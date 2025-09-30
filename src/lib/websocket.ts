import type {
  WebSocketConfig,
  WebSocketMessage,
  WebSocketEventCallbacks,
  WebSocketConnectionStatus,
  HeartbeatWebSocketMessage
} from '@/types/websocket'
import { isHeartbeatResponseMessage } from '@/types/websocket'

/**
 * WebSocket 单例管理器
 * 提供全局唯一的 WebSocket 连接，支持自动重连和心跳机制
 */
export class WebSocketManager {
  private static instance: WebSocketManager | null = null
  private ws: WebSocket | null = null
  private config: WebSocketConfig
  private callbacks: WebSocketEventCallbacks = {}
  private connectionStatus: WebSocketConnectionStatus = 'disconnected'
  private reconnectTimer: NodeJS.Timeout | null = null
  private heartbeatTimer: NodeJS.Timeout | null = null
  private heartbeatTimeoutTimer: NodeJS.Timeout | null = null
  private reconnectAttempts = 0
  private isDestroyed = false

  private constructor(config: WebSocketConfig) {
    this.config = {
      reconnectAttempts: 5,
      reconnectInterval: 3000,
      heartbeat: {
        interval: 30000, // 30秒发送一次心跳
        timeout: 10000,  // 10秒心跳超时
        message: 'ping'
      },
      debug: false,
      ...config
    }
  }

  /**
   * 获取 WebSocket 管理器单例实例
   */
  public static getInstance(config?: WebSocketConfig): WebSocketManager {
    if (!WebSocketManager.instance) {
      if (!config) {
        throw new Error('WebSocket 配置不能为空')
      }
      WebSocketManager.instance = new WebSocketManager(config)
    }
    return WebSocketManager.instance
  }

  /**
   * 销毁单例实例
   */
  public static destroyInstance(): void {
    if (WebSocketManager.instance) {
      WebSocketManager.instance.destroy()
      WebSocketManager.instance = null
    }
  }

  /**
   * 设置事件回调
   */
  public setCallbacks(callbacks: WebSocketEventCallbacks): void {
    this.callbacks = { ...this.callbacks, ...callbacks }
  }

  /**
   * 连接 WebSocket
   */
  public connect(): void {
    if (this.isDestroyed) {
      this.log('WebSocket 管理器已销毁，无法连接')
      return
    }

    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.log('WebSocket 已连接')
      return
    }

    // 清理之前的连接
    if (this.ws) {
      this.ws.close()
      this.ws = null
    }

    // this.setConnectionStatus('connecting')
    
    try {
      // 直接使用配置的URL连接
      const url = this.config.url
      this.log(`连接 WebSocket: ${url}`)
      
      this.ws = new WebSocket(url)
      this.setupEventListeners()
    } catch (error) {
      this.log(`WebSocket 连接失败: ${error}`)
      this.setConnectionStatus('error')
      this.callbacks.onError?.(error as Event)
      // 🚫 已禁用自动重连
      console.warn('⚠️ [WebSocket] 连接失败，自动重连已禁用。请手动重连。')
    }
  }

  /**
   * 断开 WebSocket 连接
   */
  public disconnect(): void {
    this.log('主动断开 WebSocket 连接')
    this.clearTimers()
    
    if (this.ws) {
      this.ws.close(1000, '主动断开连接')
      this.ws = null
    }
    
    this.setConnectionStatus('disconnected')
    this.reconnectAttempts = 0
  }

  /**
   * 发送消息
   */
  public send(message: WebSocketMessage | string): boolean {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      this.log('WebSocket 未连接，无法发送消息')
      return false
    }

    try {
      const messageStr = typeof message === 'string' ? message : JSON.stringify(message)
      this.ws.send(messageStr)
      this.log(`发送消息: ${typeof message === 'object' ? message.type : '文本'}`)
      return true
    } catch (error) {
      console.error('❌ [WebSocket 发送失败]', error)
      return false
    }
  }

  /**
   * 获取连接状态
   */
  public getConnectionStatus(): WebSocketConnectionStatus {
    return this.connectionStatus
  }

  /**
   * 检查是否已连接
   * 优先使用内部状态，避免状态不一致
   */
  public isConnected(): boolean {
    // 如果没有 WebSocket 实例，肯定未连接
    if (!this.ws) {
      return false
    }
    
    // 优先使用原生状态，这是最准确的
    const wsIsOpen = this.ws.readyState === WebSocket.OPEN
    
    // 如果原生状态和内部状态不一致，记录警告并以原生状态为准
    if (wsIsOpen && this.connectionStatus !== 'connected') {
      console.warn('[WebSocket] 状态不一致：ws.readyState=OPEN 但 connectionStatus=', this.connectionStatus)
      this.setConnectionStatus('connected')
    } else if (!wsIsOpen && this.connectionStatus === 'connected') {
      console.warn('[WebSocket] 状态不一致：ws.readyState=', this.ws.readyState, '但 connectionStatus=connected')
      this.setConnectionStatus('disconnected')
    }
    
    return wsIsOpen
  }

  /**
   * 重置重连计数器（用于手动重试）
   */
  public resetReconnectAttempts(): void {
    this.reconnectAttempts = 0
    this.log('重连计数器已重置')
  }

  /**
   * 强制重连（清除错误状态）
   */
  public forceReconnect(): void {
    this.log('强制重连')
    this.clearTimers()
    this.resetReconnectAttempts()
    this.connect()
  }

  /**
   * 销毁 WebSocket 管理器
   */
  private destroy(): void {
    this.log('销毁 WebSocket 管理器')
    this.isDestroyed = true
    this.disconnect()
    this.callbacks = {}
  }

  /**
   * 设置 WebSocket 事件监听器
   */
  private setupEventListeners(): void {
    if (!this.ws) return

    this.ws.onopen = () => {
      console.log('🎉 [WebSocket 连接成功]', this.config.url)
      this.setConnectionStatus('connected')
      this.reconnectAttempts = 0
      this.startHeartbeat()
      this.callbacks.onOpen?.()
    }

    this.ws.onclose = (event) => {
      console.log('🔌 [WebSocket 连接关闭]', `code: ${event.code}`, event.reason || '')
      this.setConnectionStatus('disconnected')
      this.stopHeartbeat()
      this.callbacks.onClose?.(event)
      
      // 🚫 已禁用自动重连，需要手动重连
      // 如果需要重连，请使用 resetConnection() 或 forceReconnect() 方法
      if (event.code !== 1000 && !this.isDestroyed) {
        console.warn('⚠️ [WebSocket] 连接已断开，自动重连已禁用。请手动重连。')
      }
    }

    this.ws.onerror = (event) => {
      console.error('❌ [WebSocket 连接错误]', event)
      this.setConnectionStatus('error')
      this.callbacks.onError?.(event)
    }

    this.ws.onmessage = (event) => {
      this.handleMessage(event.data)
    }
  }

  /**
   * 处理接收到的消息
   */
  private handleMessage(data: string): void {
    try {
      // 尝试解析为 JSON
      const parsed = JSON.parse(data)
      
      // 验证是否是有效的消息格式（只要有 type 字段就行，timestamp 可选）
      if (parsed && typeof parsed === 'object' && parsed.type) {
        // 如果没有 timestamp，自动添加
        if (!parsed.timestamp) {
          parsed.timestamp = Date.now()
        }
        
        const message = parsed as WebSocketMessage
        this.log(`接收消息: ${message.type}`)
        
        // 处理心跳响应
        if (isHeartbeatResponseMessage(message)) {
          this.handleHeartbeatResponse()
          return
        }
        
        // 调用消息回调
        this.callbacks.onMessage?.(message)
      } else {
        this.log(`收到非标准格式消息，已忽略: ${JSON.stringify(parsed)}`)
      }
    } catch {
      // JSON 解析失败，检查是否是心跳响应
      if (data.toLowerCase().includes('pong') || data.toLowerCase().includes('ping')) {
        this.handleHeartbeatResponse()
      } else {
        this.log(`收到非 JSON 格式消息，已忽略: ${data}`)
      }
    }
  }

  /**
   * 开始心跳机制
   */
  private startHeartbeat(): void {
    if (!this.config.heartbeat) return

    this.stopHeartbeat() // 清除之前的心跳定时器
    
    this.heartbeatTimer = setInterval(() => {
      this.sendHeartbeat()
    }, this.config.heartbeat.interval)
    
    this.log(`心跳机制已启动，间隔: ${this.config.heartbeat.interval}ms`)
  }

  /**
   * 停止心跳机制
   */
  private stopHeartbeat(): void {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer)
      this.heartbeatTimer = null
    }
    
    if (this.heartbeatTimeoutTimer) {
      clearTimeout(this.heartbeatTimeoutTimer)
      this.heartbeatTimeoutTimer = null
    }
    
    this.log('心跳机制已停止')
  }

  /**
   * 发送心跳消息
   */
  private sendHeartbeat(): void {
    if (!this.config.heartbeat) return

    const heartbeatMessage: HeartbeatWebSocketMessage = {
      id: Date.now().toString(),
      type: 'heartbeat',
      timestamp: Date.now(),
      message: {
        data: {
          content: 'ping'
        }
      }
    }

    const success = this.send(heartbeatMessage)
    if (success) {
      // 设置心跳超时定时器（不会自动重连，只是关闭连接）
      this.heartbeatTimeoutTimer = setTimeout(() => {
        console.warn('💔 [WebSocket 心跳超时] - 连接将被关闭，不会自动重连')
        this.ws?.close(1001, '心跳超时')
      }, this.config.heartbeat!.timeout)
    }
  }

  /**
   * 处理心跳响应
   */
  private handleHeartbeatResponse(): void {
    // 清除心跳超时定时器
    if (this.heartbeatTimeoutTimer) {
      clearTimeout(this.heartbeatTimeoutTimer)
      this.heartbeatTimeoutTimer = null
    }
  }

  /**
   * 安排重连（已禁用自动调用）
   * 此方法仅供内部使用，不会被自动调用
   * 如需重连，请使用 forceReconnect() 或通过 UI 手动触发
   */
  private scheduleReconnect(): void {
    // 🚫 自动重连已禁用
    console.warn('⚠️ [WebSocket] scheduleReconnect 已被禁用，请使用手动重连')
    this.setConnectionStatus('error')
    this.callbacks.onReconnectFailed?.()
  }

  /**
   * 清除所有定时器
   */
  private clearTimers(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer)
      this.reconnectTimer = null
    }
    
    this.stopHeartbeat()
  }

  /**
   * 设置连接状态
   */
  private setConnectionStatus(status: WebSocketConnectionStatus): void {
    const oldStatus = this.connectionStatus
    this.connectionStatus = status
    
    // 记录状态变更
    if (oldStatus !== status) {
      this.log(`连接状态变更: ${oldStatus} → ${status}`)
      
      // 同时记录原生 WebSocket 状态
      if (this.ws) {
        const readyStateMap = {
          0: 'CONNECTING',
          1: 'OPEN',
          2: 'CLOSING',
          3: 'CLOSED'
        }
        const nativeState = readyStateMap[this.ws.readyState as keyof typeof readyStateMap] || 'UNKNOWN'
        this.log(`  └─ 原生状态: ${nativeState} (${this.ws.readyState})`)
      }
    }
  }


  /**
   * 日志输出
   */
  private log(message: string): void {
    if (this.config.debug || process.env.NODE_ENV === 'development') {
      console.log(`[WebSocket] ${new Date().toISOString()}: ${message}`)
    }
  }
}

/**
 * 创建 WebSocket 管理器实例的便捷函数
 */
export function createWebSocketManager(config: WebSocketConfig): WebSocketManager {
  return WebSocketManager.getInstance(config)
}

/**
 * 获取现有的 WebSocket 管理器实例
 */
export function getWebSocketManager(): WebSocketManager | null {
  return WebSocketManager.getInstance()
}

/**
 * 销毁 WebSocket 管理器实例
 */
export function destroyWebSocketManager(): void {
  WebSocketManager.destroyInstance()
}
