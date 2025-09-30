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
  syncStatus: () => void
  
  // 内部方法
  _setError: (error: string | null) => void
}

// 获取WebSocket服务器地址
const getWebSocketUrl = (): string => {
  // 优先使用环境变量
  const envWsUrl = import.meta.env.VITE_WS_URL
  if (envWsUrl) {
    return envWsUrl
  }
  
  // 使用固定的用户ID（后续可以从用户状态获取）
  const userId = '97772489-34af-4179-83ca-00993b382605'
  
  // 在开发环境中，直接使用指定的服务器地址
  if (process.env.NODE_ENV === 'development') {
    return 'ws://192.168.10.19:8001/api/v1/websocket/user/' + userId
  }
  
  // 根据当前协议和主机动态构建WebSocket URL
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
  const host = window.location.hostname
  const port = window.location.hostname === 'localhost' ? '8001' : window.location.port
  
  return `${protocol}//${host}:${port}/api/v1/websocket/user/${userId}`
}

// 默认 WebSocket 配置
const DEFAULT_WS_CONFIG: WebSocketConfig = {
  url: getWebSocketUrl(),
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
          set((state) => ({
            ...state,
            connectionStatus: 'connected',
            isConnected: true,
            lastConnectedAt: Date.now(),
            error: null
          }))
        },
        
        onClose: (event) => {
          set((state) => ({
            ...state,
            connectionStatus: 'disconnected',
            isConnected: false,
            lastDisconnectedAt: Date.now(),
            error: event.code !== 1000 ? `连接关闭: ${event.reason || '未知原因'}` : state.error
          }))
        },
        
        onError: () => {
          set((state) => ({
            ...state,
            connectionStatus: 'error',
            isConnected: false,
            error: 'WebSocket 连接错误'
          }))
        },
        
        onMessage: (message) => {
          console.log('📬 [Store] onMessage 回调被触发');
          console.log('收到的消息:', message);
          console.log('消息类型:', message.type);
          
          set((state) => {
            const newHistory = [...state.messageHistory, message]
            
            // 限制历史记录数量
            const maxHistorySize = 1000
            if (newHistory.length > maxHistorySize) {
              newHistory.splice(0, newHistory.length - maxHistorySize)
            }
            
            console.log('更新 lastMessage 为:', message);
            
            return {
              ...state,
              messageHistory: newHistory,
              lastMessage: message
            }
          })
        },
        
        onReconnect: (attempt) => {
          set((state) => ({
            ...state,
            connectionStatus: 'reconnecting',
            isConnected: false,
            reconnectAttempts: attempt
          }))
        },
        
        onReconnectFailed: () => {
          console.error('💀 [Store] WebSocket 重连失败')
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
      
      // 检查是否已经连接，如果是则立即更新状态
      if (wsManager.isConnected()) {
        set((state) => ({
          ...state,
          connectionStatus: 'connected',
          isConnected: true,
          lastConnectedAt: Date.now(),
          error: null
        }))
      } else {
        // 开始连接
        wsManager.connect()
      }
      
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
      get()._setError('WebSocket 未连接')
      return false
    }

    const success = wsManager.send(message)
    if (!success) {
      get()._setError('消息发送失败')
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
      wsManager.forceReconnect()
    }
  },

  // 同步状态（强制同步 WebSocket 管理器的状态到 store）
  syncStatus: () => {
    const { wsManager } = get()
    if (wsManager) {
      const isConnected = wsManager.isConnected()
      const connectionStatus = wsManager.getConnectionStatus()
      
      set((state) => ({
        ...state,
        connectionStatus,
        isConnected,
        error: isConnected ? null : state.error
      }))
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
  const syncStatus = useWebSocketStore(state => state.syncStatus)
  
  return {
    connect,
    disconnect,
    sendMessage,
    sendChatMessage,
    clearError,
    resetConnection,
    syncStatus
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
        // 安全地访问data属性
        if ('data' in msg && msg.data && typeof msg.data === 'object' && 'agentId' in msg.data) {
          return msg.data.agentId === agentId
        }
        return false
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
