/**
 * WebSocket 测试辅助工具
 * 提供一些便捷的测试方法和消息模板
 */

import type { ChatWebSocketMessage, SystemWebSocketMessage } from '@/types/websocket'

// 生成唯一ID
const generateId = () => Date.now().toString(36) + Math.random().toString(36).substr(2)

/**
 * 创建测试聊天消息
 */
export const createTestChatMessage = (content: string, role: 'user' | 'assistant' = 'user'): ChatWebSocketMessage => {
  return {
    id: generateId(),
    type: 'chat_message',
    timestamp: Date.now(),
    data: {
      content,
      role,
      agentId: 1
    }
  }
}

/**
 * 创建测试系统消息
 */
export const createTestSystemMessage = (content: string, level: 'info' | 'warning' | 'error' = 'info'): SystemWebSocketMessage => {
  return {
    id: generateId(),
    type: 'system_message',
    timestamp: Date.now(),
    data: {
      content,
      level
    }
  }
}

/**
 * 预定义的测试消息
 */
export const TEST_MESSAGES = {
  // 简单文本消息
  SIMPLE_TEXT: '这是一条简单的测试消息',
  
  // JSON 格式消息
  JSON_MESSAGE: JSON.stringify({
    type: 'test',
    data: { message: '这是一条JSON格式的测试消息' }
  }),
  
  // 长文本消息
  LONG_TEXT: '这是一条很长的测试消息，用来测试WebSocket在处理大量文本时的表现。'.repeat(10),
  
  // 特殊字符消息
  SPECIAL_CHARS: '测试特殊字符: 🚀 📡 💻 ⚡ 🔥 ✨ 🎯 📊 🔧 ⭐',
  
  // 心跳测试
  HEARTBEAT_TEST: 'ping'
} as const

/**
 * 聊天消息模板
 */
export const CHAT_TEMPLATES = {
  USER_QUESTION: '你好，请问你能帮我解决一个问题吗？',
  USER_COMMAND: '/help',
  USER_FEEDBACK: '谢谢你的帮助！'
} as const

/**
 * 控制台日志测试工具
 */
export class WebSocketLogTester {
  private static instance: WebSocketLogTester | null = null
  
  static getInstance(): WebSocketLogTester {
    if (!WebSocketLogTester.instance) {
      WebSocketLogTester.instance = new WebSocketLogTester()
    }
    return WebSocketLogTester.instance
  }
  
  /**
   * 开始日志监控
   */
  startLogging(): void {
    console.group('🔍 [WebSocket 日志监控] 开始监控')
    console.log('⏰ 开始时间:', new Date().toLocaleString())
    console.log('📋 监控内容: 连接状态、消息发送/接收、心跳、重连')
    console.groupEnd()
  }
  
  /**
   * 停止日志监控
   */
  stopLogging(): void {
    console.group('🛑 [WebSocket 日志监控] 停止监控')
    console.log('⏰ 结束时间:', new Date().toLocaleString())
    console.groupEnd()
  }
  
  /**
   * 记录测试步骤
   */
  logTestStep(step: string, description?: string): void {
    console.log(`🧪 [测试步骤] ${step}${description ? ': ' + description : ''}`)
  }
  
  /**
   * 记录测试结果
   */
  logTestResult(testName: string, success: boolean, details?: string): void {
    const icon = success ? '✅' : '❌'
    const status = success ? '成功' : '失败'
    
    console.group(`${icon} [测试结果] ${testName} - ${status}`)
    if (details) {
      console.log('详情:', details)
    }
    console.log('时间:', new Date().toLocaleString())
    console.groupEnd()
  }
}

/**
 * 自动化测试序列
 */
export const runWebSocketTests = async (sendMessage: (message: string) => boolean) => {
  const tester = WebSocketLogTester.getInstance()
  
  tester.startLogging()
  
  // 测试1: 发送简单文本
  tester.logTestStep('1', '发送简单文本消息')
  const test1 = sendMessage(TEST_MESSAGES.SIMPLE_TEXT)
  tester.logTestResult('简单文本发送', test1)
  
  await new Promise(resolve => setTimeout(resolve, 1000))
  
  // 测试2: 发送JSON消息
  tester.logTestStep('2', '发送JSON格式消息')
  const test2 = sendMessage(TEST_MESSAGES.JSON_MESSAGE)
  tester.logTestResult('JSON消息发送', test2)
  
  await new Promise(resolve => setTimeout(resolve, 1000))
  
  // 测试3: 发送特殊字符
  tester.logTestStep('3', '发送特殊字符消息')
  const test3 = sendMessage(TEST_MESSAGES.SPECIAL_CHARS)
  tester.logTestResult('特殊字符发送', test3)
  
  await new Promise(resolve => setTimeout(resolve, 1000))
  
  // 测试4: 发送心跳测试
  tester.logTestStep('4', '发送心跳测试消息')
  const test4 = sendMessage(TEST_MESSAGES.HEARTBEAT_TEST)
  tester.logTestResult('心跳测试发送', test4)
  
  tester.stopLogging()
  
  return {
    totalTests: 4,
    passedTests: [test1, test2, test3, test4].filter(Boolean).length,
    results: { test1, test2, test3, test4 }
  }
}
