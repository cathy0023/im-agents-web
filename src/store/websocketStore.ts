import React from 'react'
import { create } from 'zustand'
import { WebSocketManager } from '@/lib/websocket'
import type {
  WebSocketState,
  WebSocketMessage,
  WebSocketConfig,
  ChatWebSocketMessage,
  SystemWebSocketMessage,
  ErrorWebSocketMessage
} from '@/types/websocket'

// WebSocket Store 接口
export interface WebSocketStoreState extends WebSocketState {
  // WebSocket 管理器实例
  wsManager: WebSocketManager | null
  
  // 操作方法
  connect: (config?: Partial<WebSocketConfig>) => void
  disconnect: () => void
  sendMessage: (message: WebSocketMessage | string) => boolean
  sendChatMessage: (content: string, role: 'user' | 'assistant', agentId?: number) => boolean
  clearMessageHistory: () => void
  clearError: () => void
  resetConnection: () => void
  
  // 内部方法
  _setError: (error: string | null) => void
}

// 默认 WebSocket 配置
const DEFAULT_WS_CONFIG: WebSocketConfig = {
  url: 'ws://192.168.10.19:8001/api/v1/websocket/user/97772489-34af-4179-83ca-00993b382605',
  reconnectAttempts: 5,
  reconnectInterval: 3000,
  heartbeat: {
    interval: 30000, // 30秒
    timeout: 10000,  // 10秒
    message: 'ping'
  },
  debug: process.env.NODE_ENV === 'development'
}

// 生成唯一ID
const generateId = () => Date.now().toString(36) + Math.random().toString(36).substr(2)

// 创建 WebSocket store
export const useWebSocketStore = create<WebSocketStoreState>((set, get) => ({
  // 初始状态
  connectionStatus: 'disconnected',
  isConnected: false,
  lastConnectedAt: null,
  lastDisconnectedAt: null,
  reconnectAttempts: 0,
  messageHistory: [],
  lastMessage: null,
  error: null,
  wsManager: null,

  // 连接 WebSocket
  connect: (configOverrides = {}) => {
    const state = get()
    
    // 如果已经连接，直接返回
    if (state.isConnected && state.wsManager) {
      console.log('WebSocket 已连接')
      return
    }

    try {
      // 合并配置
      const config: WebSocketConfig = {
        ...DEFAULT_WS_CONFIG,
        ...configOverrides
      }

      // 创建或获取 WebSocket 管理器实例
      const wsManager = WebSocketManager.getInstance(config)
      
      // 设置事件回调
      wsManager.setCallbacks({
        onOpen: () => {
          console.log('🎊 [Store] WebSocket 连接成功，更新状态')
          // 直接使用 set 更新状态，避免通过 get() 调用方法
          set((state) => ({
            ...state,
            connectionStatus: 'connected',
            isConnected: true,
            lastConnectedAt: Date.now(),
            error: null
          }))
        },
        
        onClose: (event) => {
          console.log('📪 [Store] WebSocket 连接关闭，更新状态:', {
            关闭码: event.code,
            关闭原因: event.reason,
            时间: new Date().toLocaleString()
          })
          // 直接使用 set 更新状态
          set((state) => ({
            ...state,
            connectionStatus: 'disconnected',
            isConnected: false,
            lastDisconnectedAt: Date.now(),
            error: event.code !== 1000 ? `连接关闭: ${event.reason || '未知原因'}` : state.error
          }))
        },
        
        onError: (error) => {
          console.error('💥 [Store] WebSocket 连接错误，更新状态:', error)
          // 直接使用 set 更新状态
          set((state) => ({
            ...state,
            connectionStatus: 'error',
            isConnected: false,
            error: 'WebSocket 连接错误'
          }))
        },
        
        onMessage: (message) => {
          console.group('📬 [Store] 收到 WebSocket 消息')
          console.log('消息类型:', message.type)
          console.log('消息内容:', message)
          console.log('接收时间:', new Date().toLocaleString())
          console.groupEnd()
          
          // 直接使用 set 更新状态
          set((state) => {
            const newHistory = [...state.messageHistory, message]
            
            // 限制历史记录数量
            const maxHistorySize = 1000
            if (newHistory.length > maxHistorySize) {
              newHistory.splice(0, newHistory.length - maxHistorySize)
            }
            
            console.log('📚 [Store] 消息历史已更新，当前数量:', newHistory.length)
            
            return {
              ...state,
              messageHistory: newHistory,
              lastMessage: message
            }
          })
        },
        
        onReconnect: (attempt) => {
          console.log('🔄 [Store] WebSocket 重连尝试，更新状态:', {
            重连次数: attempt,
            时间: new Date().toLocaleString()
          })
          // 直接使用 set 更新状态
          set((state) => ({
            ...state,
            connectionStatus: 'reconnecting',
            isConnected: false,
            reconnectAttempts: attempt
          }))
        },
        
        onReconnectFailed: () => {
          console.error('💀 [Store] WebSocket 重连失败，更新状态')
          // 直接使用 set 更新状态
          set((state) => ({
            ...state,
            connectionStatus: 'error',
            isConnected: false,
            error: '重连失败，请检查网络连接'
          }))
        }
      })

      // 更新 store 状态
      set({ wsManager })
      
      // 开始连接
      wsManager.connect()
      
    } catch (error) {
      console.error('WebSocket 连接初始化失败:', error)
      get()._setError(error instanceof Error ? error.message : 'WebSocket 初始化失败')
    }
  },

  // 断开连接
  disconnect: () => {
    const { wsManager } = get()
    
    if (wsManager) {
      wsManager.disconnect()
    }
    
    // 清理状态
    set((state) => ({
      ...state,
      wsManager: null,
      connectionStatus: 'disconnected',
      isConnected: false,
      reconnectAttempts: 0,
      lastDisconnectedAt: Date.now()
    }))
  },

  // 发送消息
  sendMessage: (message: WebSocketMessage | string) => {
    const { wsManager, isConnected } = get()
    
    if (!wsManager || !isConnected) {
      console.warn('⚠️ [Store] WebSocket 未连接，无法发送消息')
      get()._setError('WebSocket 未连接')
      return false
    }

    console.group('📤 [Store] 准备发送消息')
    console.log('消息类型:', typeof message === 'string' ? '纯文本' : message.type)
    console.log('发送时间:', new Date().toLocaleString())
    console.log('消息内容:', message)
    console.groupEnd()

    const success = wsManager.send(message)
    if (!success) {
      console.error('❌ [Store] 消息发送失败')
      get()._setError('消息发送失败')
    } else {
      console.log('✅ [Store] 消息发送成功')
    }
    
    return success
  },

  // 发送聊天消息的便捷方法
  sendChatMessage: (content: string, role: 'user' | 'assistant', agentId?: number) => {
    const chatMessage: ChatWebSocketMessage = {
      id: generateId(),
      type: 'chat_message',
      timestamp: Date.now(),
      data: {
        content,
        role,
        agentId
      }
    }

    console.log('💬 [Store] 创建聊天消息:', {
      消息ID: chatMessage.id,
      角色: role,
      代理ID: agentId,
      内容长度: content.length,
      时间: new Date().toLocaleString()
    })

    return get().sendMessage(chatMessage)
  },

  // 清空消息历史
  clearMessageHistory: () => {
    set({ messageHistory: [], lastMessage: null })
  },

  // 清除错误
  clearError: () => {
    set({ error: null })
  },

  // 重置连接（强制重连）
  resetConnection: () => {
    const { wsManager } = get()
    if (wsManager) {
      console.log('🔄 [Store] 重置WebSocket连接')
      wsManager.forceReconnect()
    }
  },

  // 内部方法：设置错误信息（保留用于其他地方调用）
  _setError: (error: string | null) => {
    set({ error })
  }
}))

// 便捷的 Hook 函数

/**
 * 获取 WebSocket 连接状态 - 使用单独的选择器避免重新渲染
 */
export const useWebSocketConnection = () => {
  const connectionStatus = useWebSocketStore(state => state.connectionStatus)
  const isConnected = useWebSocketStore(state => state.isConnected)
  const error = useWebSocketStore(state => state.error)
  const reconnectAttempts = useWebSocketStore(state => state.reconnectAttempts)
  const lastConnectedAt = useWebSocketStore(state => state.lastConnectedAt)
  const lastDisconnectedAt = useWebSocketStore(state => state.lastDisconnectedAt)
  
  return {
    connectionStatus,
    isConnected,
    error,
    reconnectAttempts,
    lastConnectedAt,
    lastDisconnectedAt
  }
}

/**
 * 获取 WebSocket 消息相关状态 - 使用单独的选择器避免重新渲染
 */
export const useWebSocketMessages = () => {
  const messageHistory = useWebSocketStore(state => state.messageHistory)
  const lastMessage = useWebSocketStore(state => state.lastMessage)
  const clearMessageHistory = useWebSocketStore(state => state.clearMessageHistory)
  
  return {
    messageHistory,
    lastMessage,
    clearMessageHistory
  }
}

/**
 * 获取 WebSocket 操作方法 - 使用单独的选择器避免重新渲染
 */
export const useWebSocketActions = () => {
  const connect = useWebSocketStore(state => state.connect)
  const disconnect = useWebSocketStore(state => state.disconnect)
  const sendMessage = useWebSocketStore(state => state.sendMessage)
  const sendChatMessage = useWebSocketStore(state => state.sendChatMessage)
  const clearError = useWebSocketStore(state => state.clearError)
  const resetConnection = useWebSocketStore(state => state.resetConnection)
  
  return {
    connect,
    disconnect,
    sendMessage,
    sendChatMessage,
    clearError,
    resetConnection
  }
}

/**
 * 过滤聊天消息的 Hook - 使用 useMemo 缓存避免无限循环
 */
export const useChatMessages = (agentId?: number) => {
  const messageHistory = useWebSocketStore((state) => state.messageHistory)
  
  return React.useMemo(() => {
    return messageHistory.filter(
      (msg): msg is ChatWebSocketMessage => {
        if (msg.type !== 'chat_message') return false
        if (agentId === undefined) return true
        return msg.data?.agentId === agentId
      }
    )
  }, [messageHistory, agentId]) // 🔍 关键：只有当 messageHistory 或 agentId 真正变化时才重新计算
}

/**
 * 过滤系统消息的 Hook - 使用 useMemo 缓存避免无限循环
 */
export const useSystemMessages = () => {
  const messageHistory = useWebSocketStore((state) => state.messageHistory)
  
  return React.useMemo(() => {
    return messageHistory.filter(
      (msg): msg is SystemWebSocketMessage => msg.type === 'system_message'
    )
  }, [messageHistory])
}

/**
 * 过滤错误消息的 Hook - 使用 useMemo 缓存避免无限循环
 */
export const useErrorMessages = () => {
  const messageHistory = useWebSocketStore((state) => state.messageHistory)
  
  return React.useMemo(() => {
    return messageHistory.filter(
      (msg): msg is ErrorWebSocketMessage => msg.type === 'error'
    )
  }, [messageHistory])
}
