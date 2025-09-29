// WebSocket 连接状态
export type WebSocketConnectionStatus = 
  | 'connecting' 
  | 'connected' 
  | 'disconnected' 
  | 'reconnecting' 
  | 'error'

// WebSocket 消息类型
export type WebSocketMessageType = 
  | 'chat_message'     // 聊天消息
  | 'system_message'   // 系统消息
  | 'heartbeat'        // 心跳消息
  | 'error'            // 错误消息
  | 'component_render' // 组件渲染消息

// 基础 WebSocket 消息接口
export interface BaseWebSocketMessage {
  id: string
  type: WebSocketMessageType
  timestamp: number
}

// 聊天消息
export interface ChatWebSocketMessage extends BaseWebSocketMessage {
  type: 'chat_message'
  data: {
    content: string
    role: 'user' | 'assistant'
    agentId?: number
  }
}

// 系统消息
export interface SystemWebSocketMessage extends BaseWebSocketMessage {
  type: 'system_message'
  data: {
    content: string
    level: 'info' | 'warning' | 'error'
  }
}

// 心跳消息 - 发送给后端的ping
export interface HeartbeatWebSocketMessage extends BaseWebSocketMessage {
  type: 'heartbeat'
  message: {
    data: {
      content: 'ping'
    }
  }
}

// 心跳响应消息 - 后端返回的pong
export interface HeartbeatResponseMessage extends BaseWebSocketMessage {
  type: 'heartbeat'
  message: {
    data: {
      content: 'pong',
      timestamp: number
    }
  }
  id: string
  status: 'finish'
  component_name: string
}

// 错误消息
export interface ErrorWebSocketMessage extends BaseWebSocketMessage {
  type: 'error'
  data: {
    code: string
    message: string
    details?: Record<string, unknown>
  }
}

// 组件渲染消息（用于后续扩展）
export interface ComponentRenderMessage extends BaseWebSocketMessage {
  type: 'component_render'
  data: {
    componentType: string
    props: Record<string, unknown>
    content?: string
  }
}

// 联合消息类型
export type WebSocketMessage = 
  | ChatWebSocketMessage
  | SystemWebSocketMessage
  | HeartbeatWebSocketMessage
  | HeartbeatResponseMessage
  | ErrorWebSocketMessage
  | ComponentRenderMessage

// WebSocket 配置接口
export interface WebSocketConfig {
  url: string
  reconnectAttempts?: number
  reconnectInterval?: number
  heartbeat?: {
    interval: number
    timeout: number
    message: string
  }
  debug?: boolean
}

// WebSocket 状态接口
export interface WebSocketState {
  connectionStatus: WebSocketConnectionStatus
  isConnected: boolean
  lastConnectedAt: number | null
  lastDisconnectedAt: number | null
  reconnectAttempts: number
  messageHistory: WebSocketMessage[]
  lastMessage: WebSocketMessage | null
  error: string | null
}

// WebSocket 事件回调类型
export interface WebSocketEventCallbacks {
  onOpen?: () => void
  onClose?: (event: CloseEvent) => void
  onError?: (error: Event) => void
  onMessage?: (message: WebSocketMessage) => void
  onReconnect?: (attempt: number) => void
  onReconnectFailed?: () => void
}

// 消息类型守卫函数
export function isChatMessage(message: unknown): message is ChatWebSocketMessage {
  return typeof message === 'object' && message !== null && 
    (message as WebSocketMessage)?.type === 'chat_message' && 
    (message as ChatWebSocketMessage)?.data?.content !== undefined
}

export function isSystemMessage(message: unknown): message is SystemWebSocketMessage {
  return typeof message === 'object' && message !== null && 
    (message as WebSocketMessage)?.type === 'system_message' && 
    (message as SystemWebSocketMessage)?.data?.content !== undefined
}

export function isHeartbeatMessage(message: unknown): message is HeartbeatWebSocketMessage {
  return typeof message === 'object' && message !== null && 
    (message as WebSocketMessage)?.type === 'heartbeat' &&
    (message as HeartbeatWebSocketMessage)?.message?.data?.content === 'ping'
}

export function isHeartbeatResponseMessage(message: unknown): message is HeartbeatResponseMessage {
  return typeof message === 'object' && message !== null && 
    (message as WebSocketMessage)?.type === 'heartbeat' &&
    (message as HeartbeatResponseMessage)?.message?.data?.content === 'pong'
}

export function isErrorMessage(message: unknown): message is ErrorWebSocketMessage {
  return typeof message === 'object' && message !== null && 
    (message as WebSocketMessage)?.type === 'error' && 
    (message as ErrorWebSocketMessage)?.data?.message !== undefined
}

export function isComponentRenderMessage(message: unknown): message is ComponentRenderMessage {
  return typeof message === 'object' && message !== null && 
    (message as WebSocketMessage)?.type === 'component_render' && 
    (message as ComponentRenderMessage)?.data?.componentType !== undefined
}

// 工具函数：获取 session cookie
export function getSessionFromCookie(): string | null {
  if (typeof document === 'undefined') return null
  
  const cookies = document.cookie.split(';')
  for (const cookie of cookies) {
    const [name, value] = cookie.trim().split('=')
    if (name === 'session') {
      return value
    }
  }
  return null
}
