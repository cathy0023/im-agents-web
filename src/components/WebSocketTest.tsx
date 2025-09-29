import React, { useState, useEffect, useRef } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from './ui/card'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Textarea } from './ui/textarea'
import ErrorBoundary from './ErrorBoundary'
import { 
  useWebSocketConnection, 
  useWebSocketActions, 
  useWebSocketMessages 
} from '../store/websocketStore'
import { TEST_MESSAGES, runWebSocketTests, WebSocketLogTester } from '../utils/websocket-test-helper'

/**
 * WebSocket 测试页面
 * 用于验证 WebSocket 功能是否正常工作
 * 使用增强日志功能的 WebSocketManager
 */
export const WebSocketTest: React.FC = () => {
  const [wsUrl, setWsUrl] = useState('ws://192.168.10.19:8001/api/v1/websocket/user/97772489-34af-4179-83ca-00993b382605')
  const [message, setMessage] = useState('')
  
  // 使用 WebSocket Store
  const { connectionStatus, isConnected, error } = useWebSocketConnection()
  const { connect, disconnect, sendMessage: sendWSMessage } = useWebSocketActions()
  const { messageHistory } = useWebSocketMessages()
  
  // 本地消息显示（用于UI展示）
  const [localMessages, setLocalMessages] = useState<Array<{id: string, content: string, timestamp: number, type: 'sent' | 'received'}>>([])

  // 消息滚动容器引用
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // 自动滚动到底部
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  // 监听 WebSocket 消息历史变化
  useEffect(() => {
    const newMessages = messageHistory.map(msg => ({
      id: msg.id,
      content: `[${msg.type}] ${JSON.stringify(msg.data)}`,
      timestamp: msg.timestamp,
      type: 'received' as const
    }))
    setLocalMessages(newMessages)
  }, [messageHistory])

  // 当消息更新时自动滚动到底部
  useEffect(() => {
    scrollToBottom()
  }, [localMessages])

  const handleConnect = () => {
    console.log('🔗 [WebSocketTest] 用户点击连接按钮')
    // 使用 WebSocketManager 连接，会显示增强的控制台日志
    connect({
      url: wsUrl,
      debug: true // 确保开启调试模式
    })
  }

  const handleDisconnect = () => {
    console.log('🔌 [WebSocketTest] 用户点击断开按钮')
    disconnect()
  }

  const handleSendMessage = () => {
    if (isConnected && message.trim()) {
      console.log('📤 [WebSocketTest] 用户发送消息:', message)
      
      // 添加到本地显示
      addLocalMessage(`发送消息: ${message}`, 'sent')
      
      // 通过 WebSocketManager 发送（会显示增强日志）
      const success = sendWSMessage(message)
      
      if (success) {
        setMessage('')
      } else {
        console.error('❌ [WebSocketTest] 消息发送失败')
      }
    }
  }

  const addLocalMessage = (content: string, type: 'sent' | 'received') => {
    setLocalMessages(prev => [...prev, {
      id: Date.now().toString(),
      content,
      timestamp: Date.now(),
      type
    }])
  }

  // 快速发送测试消息
  const sendQuickMessage = (messageKey: keyof typeof TEST_MESSAGES) => {
    const testMessage = TEST_MESSAGES[messageKey]
    if (isConnected && typeof testMessage === 'string') {
      console.log(`🧪 [WebSocketTest] 发送快速测试消息: ${messageKey}`)
      addLocalMessage(`发送测试消息 [${messageKey}]: ${testMessage}`, 'sent')
      sendWSMessage(testMessage)
    }
  }

  // 运行自动化测试
  const runAutomatedTests = async () => {
    if (!isConnected) {
      console.warn('⚠️ [WebSocketTest] 请先连接WebSocket再运行测试')
      return
    }

    console.log('🚀 [WebSocketTest] 开始运行自动化测试')
    const tester = WebSocketLogTester.getInstance()
    tester.startLogging()

    try {
      const results = await runWebSocketTests((msg) => {
        addLocalMessage(`自动测试: ${msg}`, 'sent')
        return sendWSMessage(msg)
      })
      
      console.log('📊 [WebSocketTest] 测试完成:', results)
      addLocalMessage(`自动化测试完成: ${results.passedTests}/${results.totalTests} 通过`, 'received')
    } catch (error) {
      console.error('❌ [WebSocketTest] 自动化测试失败:', error)
      addLocalMessage('自动化测试失败', 'received')
    }
  }

  const getStatusColor = () => {
    switch (connectionStatus) {
      case 'connected': return 'bg-emerald-500'
      case 'connecting': return 'bg-amber-500 animate-pulse'
      case 'reconnecting': return 'bg-blue-500 animate-pulse'
      case 'error': return 'bg-red-500'
      default: return 'bg-muted-foreground'
    }
  }

  const getStatusText = () => {
    switch (connectionStatus) {
      case 'connected': return '已连接'
      case 'connecting': return '连接中...'
      case 'reconnecting': return '重连中...'
      case 'error': return `连接错误${error ? ': ' + error : ''}`
      default: return '未连接'
    }
  }

  return (
    <ErrorBoundary>
      <div className="h-full w-full bg-background p-3 flex flex-col">
        <div className="max-w-6xl mx-auto w-full flex-1 flex flex-col">
          {/* 页面标题 - 紧凑版 */}
          <div className="flex items-center justify-between mb-4 p-3 bg-card rounded-lg border border-border">
            <div>
              <h1 className="text-lg font-semibold text-foreground">WebSocket 测试工具</h1>
              <p className="text-xs text-muted-foreground">验证 WebSocket 连接和消息传输功能</p>
            </div>
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${getStatusColor()}`} />
              <span className="text-sm text-muted-foreground">{getStatusText()}</span>
            </div>
          </div>

          {/* 主要内容区域 - 响应式网格布局 */}
          <div className="flex-1 grid grid-cols-1 xl:grid-cols-2 gap-4 min-h-0">
            {/* 左侧：连接和消息发送 */}
            <div className="space-y-4">
              {/* 连接控制 - 紧凑版 */}
              <Card className="h-fit">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">连接控制</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-2">
                    <Input
                      value={wsUrl}
                      onChange={(e) => setWsUrl(e.target.value)}
                      placeholder="WebSocket URL"
                      className="w-full text-xs"
                    />
                    <div className="flex space-x-2">
                      <Button 
                        size="sm"
                        onClick={handleConnect}
                        disabled={connectionStatus === 'connecting' || connectionStatus === 'connected'}
                        className="flex-1"
                      >
                        连接
                      </Button>
                      <Button 
                        size="sm"
                        onClick={handleDisconnect}
                        disabled={connectionStatus === 'disconnected'}
                        variant="outline"
                        className="flex-1"
                      >
                        断开
                      </Button>
                    </div>
                  </div>
                  
                  {/* 连接配置信息 - 更紧凑 */}
                  <div className="grid grid-cols-3 gap-2 p-2 bg-muted/30 rounded text-xs">
                    <div className="text-center">
                      <div className="text-muted-foreground">心跳</div>
                      <div className="font-mono">30s</div>
                    </div>
                    <div className="text-center">
                      <div className="text-muted-foreground">超时</div>
                      <div className="font-mono">10s</div>
                    </div>
                    <div className="text-center">
                      <div className="text-muted-foreground">重连</div>
                      <div className="font-mono">5次</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* 消息发送 - 紧凑版 */}
              <Card className="flex-1">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">发送消息</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex space-x-2">
                    <Textarea
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="输入要发送的消息..."
                      className="flex-1 text-sm"
                      rows={2}
                    />
                    <Button 
                      size="sm"
                      onClick={handleSendMessage}
                      disabled={!isConnected || !message.trim()}
                    >
                      发送
                    </Button>
                  </div>
                  
                  {/* 快速测试按钮 - 更紧凑 */}
                  <div className="space-y-2">
                    <div className="text-xs font-medium text-foreground">快速测试</div>
                    <div className="grid grid-cols-2 gap-1">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => sendQuickMessage('SIMPLE_TEXT')}
                        disabled={!isConnected}
                        className="text-xs py-1"
                      >
                        简单文本
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => sendQuickMessage('JSON_MESSAGE')}
                        disabled={!isConnected}
                        className="text-xs py-1"
                      >
                        JSON消息
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => sendQuickMessage('SPECIAL_CHARS')}
                        disabled={!isConnected}
                        className="text-xs py-1"
                      >
                        特殊字符
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => sendQuickMessage('HEARTBEAT_TEST')}
                        disabled={!isConnected}
                        className="text-xs py-1"
                      >
                        心跳测试
                      </Button>
                    </div>
                    
                    {/* 自动化测试 */}
                    <Button
                      size="sm"
                      onClick={runAutomatedTests}
                      disabled={!isConnected}
                      variant="secondary"
                      className="w-full text-xs"
                    >
                      🧪 自动化测试
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* 右侧：消息历史 */}
            <Card className="flex flex-col min-h-0 h-[600px] overflow-y-auto">
              <CardHeader className="pb-3 flex-shrink-0">
                <CardTitle className="flex items-center justify-between text-base">
                  消息历史 ({localMessages.length})
                  <Button 
                    onClick={() => setLocalMessages([])}
                    size="sm"
                    variant="outline"
                    className="text-xs"
                  >
                    清空
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col min-h-0 p-3">
                {/* 消息列表 - 可滚动 */}
                <div className="flex-1 space-y-2 overflow-y-auto min-h-0 pr-2">
                  {localMessages.length === 0 ? (
                    <div className="text-center text-muted-foreground py-8">
                      <div className="text-sm">暂无消息</div>
                      <div className="text-xs mt-2 text-blue-600 dark:text-blue-400">
                        💡 按 F12 查看详细日志
                      </div>
                    </div>
                  ) : (
                    <>
                      {localMessages.map((msg, index) => (
                        <div 
                          key={index} 
                          className={`p-2 rounded text-xs ${
                            msg.type === 'sent' 
                              ? 'bg-primary/10 text-primary ml-4' 
                              : 'bg-muted/50 text-foreground mr-4'
                          }`}
                        >
                          <div className="font-mono break-all">{msg.content}</div>
                          <div className="text-xs text-muted-foreground mt-1 opacity-70">
                            {new Date(msg.timestamp).toLocaleTimeString()}
                          </div>
                        </div>
                      ))}
                      {/* 滚动锚点 */}
                      <div ref={messagesEndRef} />
                    </>
                  )}
                </div>
                
                {/* 控制台提示 - 固定在底部 */}
                <div className="mt-3 p-2 bg-primary/5 border border-primary/20 rounded text-xs flex-shrink-0">
                  <div className="flex items-center space-x-2 text-primary">
                    <span>🖥️</span>
                    <div>
                      <div className="font-medium">控制台日志已启用</div>
                      <div className="text-xs opacity-80">
                        F12 → Console 查看详细通信日志
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  )
}

export default WebSocketTest
