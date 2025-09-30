/**
 * WebSocket 聊天通信协议类型定义
 * 基于后端提供的协议结构
 */

// ==================== 发送消息 ====================

/**
 * 发送给后端的消息数据结构
 */
export interface ChatMessageData {
  content: string                // 消息内容
}

/**
 * 发送消息的完整结构
 */
export interface SendChatMessage {
  type: 'chat_message'            // 消息类型固定为 'chat_message'
  message: {
    data: ChatMessageData
  }
  id: string                      // 消息唯一ID，通过 Date.now().toString() 生成
  timestamp: number               // 时间戳
  agent_uuid: string              // Agent UUID，如 '550e8400-e29b-41d4-a716-446655440001'
  conversation_uuid: string       // 会话UUID，如 'hdskdhjsadhaj'
}

// ==================== 接收消息 ====================

/**
 * Agent回复的消息数据
 */
export interface AgentMessageData {
  content: string                 // 回复内容
}

/**
 * Agent回复的消息结构
 */
export interface AgentMessage {
  data: AgentMessageData
}

/**
 * 从后端接收的消息完整结构
 */
export interface ReceiveChatMessage {
  type: 'chat_message'            // 消息类型
  message: AgentMessage           // Agent的消息
  id: string                      // 消息唯一ID
  chat_uuid: string               // 聊天UUID (后端使用的字段名)
  status: 'finish' | 'error' | 'pending'  // 消息状态
  component_name: string          // 组件名称，空字符串表示普通消息
}

// ==================== 消息状态 ====================

/**
 * 消息状态枚举
 */
export type ChatMessageStatus = 'finish' | 'error' | 'pending'

/**
 * 消息状态说明：
 * - pending: 进行中
 * - finish: 结束对话的结果提示
 * - error: 错误消息
 */

// ==================== 辅助类型 ====================

/**
 * 本地聊天消息（用于UI显示）
 */
export interface LocalChatMessage {
  id: string
  content: string
  role: 'user' | 'assistant'
  timestamp: number
  agentId: string
  conversationId: string
  isStreaming?: boolean
  status?: ChatMessageStatus
  componentName?: string
}

/**
 * 发送消息的参数
 */
export interface SendMessageParams {
  content: string
  agentUuid: string
  conversationUuid: string
}

/**
 * WebSocket 聊天事件回调
 */
export interface ChatWebSocketCallbacks {
  onMessageReceived?: (message: ReceiveChatMessage) => void
  onMessageSent?: (message: SendChatMessage) => void
  onError?: (error: Error) => void
  onStatusChange?: (status: ChatMessageStatus, message: ReceiveChatMessage) => void
}
