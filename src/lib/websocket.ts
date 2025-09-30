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

    this.setConnectionStatus('connecting')
    
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
      this.scheduleReconnect()
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
      
      // 增强的发送日志
      console.group('🚀 [WebSocket 发送消息]')
      console.log('📤 发送时间:', new Date().toLocaleString())
      console.log('📝 消息类型:', typeof message === 'string' ? '纯文本' : message.type)
      console.log('📄 消息内容:', messageStr)
      if (typeof message === 'object') {
        console.log('🔍 消息详情:', message)
      }
      console.groupEnd()
      
      this.log(`发送消息: ${messageStr}`)
      return true
    } catch (error) {
      console.error('❌ [WebSocket 发送失败]', error)
      this.log(`发送消息失败: ${error}`)
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
   */
  public isConnected(): boolean {
    return this.connectionStatus === 'connected' && this.ws?.readyState === WebSocket.OPEN
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
      console.log('🎉 [WebSocket 连接成功]', {
        时间: new Date().toLocaleString(),
        URL: this.config.url,
        状态: 'connected',
        重连次数重置: this.reconnectAttempts
      })
      this.log('WebSocket 连接成功')
      this.setConnectionStatus('connected')
      this.reconnectAttempts = 0
      this.startHeartbeat()
      this.callbacks.onOpen?.()
    }

    this.ws.onclose = (event) => {
      console.log('🔌 [WebSocket 连接关闭]', {
        时间: new Date().toLocaleString(),
        关闭码: event.code,
        关闭原因: event.reason || '无原因',
        是否主动关闭: event.code === 1000,
        是否会重连: event.code !== 1000 && !this.isDestroyed
      })
      this.log(`WebSocket 连接关闭: ${event.code} - ${event.reason}`)
      this.setConnectionStatus('disconnected')
      this.stopHeartbeat()
      this.callbacks.onClose?.(event)
      
      // 如果不是主动关闭且未销毁，则尝试重连
      if (event.code !== 1000 && !this.isDestroyed) {
        this.scheduleReconnect()
      }
    }

    this.ws.onerror = (event) => {
      console.error('❌ [WebSocket 连接错误]', {
        时间: new Date().toLocaleString(),
        错误事件: event,
        当前状态: this.connectionStatus
      })
      this.log(`WebSocket 连接错误: ${event}`)
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
    // 增强的接收日志
    console.group('📥 [WebSocket 接收消息]')
    console.log('📨 接收时间:', new Date().toLocaleString())
    console.log('📄 原始数据:', data)
    
    this.log(`接收原始消息: ${data}`)
    
    // 首先检查是否是 JSON 格式
    let message: WebSocketMessage | null = null
    
    try {
      // 尝试解析为 JSON
      const parsed = JSON.parse(data)
      
      // 验证是否是有效的 WebSocket 消息格式
      if (parsed && typeof parsed === 'object' && parsed.type && parsed.timestamp) {
        message = parsed as WebSocketMessage
        console.log('✅ JSON 解析成功')
        console.log('📝 消息类型:', message.type)
        console.log('🔍 消息详情:', message)
        this.log(`解析 JSON 消息成功: ${message.type}`)
      } else {
        throw new Error('不是有效的 WebSocket 消息格式')
      }
    } catch {
      // JSON 解析失败，处理为纯文本消息
      console.log('⚠️ JSON 解析失败，处理为纯文本')
      this.log(`处理为纯文本消息: ${data}`)
      
      // 检查是否是心跳响应
      if (data.toLowerCase().includes('pong') || data.toLowerCase().includes('ping')) {
        console.log('💓 检测到心跳响应')
        console.groupEnd()
        this.handleHeartbeatResponse()
        return
      }
      
      // 创建系统消息
      message = {
        id: Date.now().toString(),
        type: 'system_message',
        timestamp: Date.now(),
        data: {
          content: data,
          level: 'info'
        }
      } as WebSocketMessage
      
      console.log('📋 转换为系统消息:', message)
    }
    
    console.groupEnd()
    
    if (message) {
      // 处理心跳响应 - 检查是否是pong消息
      if (isHeartbeatResponseMessage(message)) {
        console.log('💓 [WebSocket 心跳响应] 收到pong消息', {
          时间: new Date().toLocaleString(),
          消息ID: message.id,
          状态: message.status,
          组件名: message.component_name,
          时间戳: message.message.data.timestamp
        })
        this.handleHeartbeatResponse()
        return
      }
      
      // 调用消息回调
      this.callbacks.onMessage?.(message)
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

    console.log('💓 [WebSocket 发送心跳]', {
      时间: new Date().toLocaleString(),
      消息ID: heartbeatMessage.id,
      消息类型: heartbeatMessage.type,
      内容: heartbeatMessage.message.data.content,
      超时设置: `${this.config.heartbeat.timeout}ms`
    })

    const success = this.send(heartbeatMessage)
    if (success) {
      // 设置心跳超时定时器
      this.heartbeatTimeoutTimer = setTimeout(() => {
        console.warn('💔 [WebSocket 心跳超时]', {
          时间: new Date().toLocaleString(),
          超时时长: `${this.config.heartbeat!.timeout}ms`,
          操作: '即将关闭连接'
        })
        this.log('心跳超时，连接可能已断开')
        this.ws?.close(1001, '心跳超时')
      }, this.config.heartbeat!.timeout)
    }
  }

  /**
   * 处理心跳响应
   */
  private handleHeartbeatResponse(): void {
    console.log('💚 [WebSocket 心跳响应]', {
      时间: new Date().toLocaleString(),
      状态: '连接正常',
      操作: '清除超时定时器'
    })
    
    this.log('收到心跳响应')
    
    // 清除心跳超时定时器
    if (this.heartbeatTimeoutTimer) {
      clearTimeout(this.heartbeatTimeoutTimer)
      this.heartbeatTimeoutTimer = null
    }
  }

  /**
   * 安排重连
   */
  private scheduleReconnect(): void {
    if (this.isDestroyed || !this.config.reconnectAttempts) return
    
    if (this.reconnectAttempts >= this.config.reconnectAttempts) {
      console.error('🚫 [WebSocket 重连失败]', {
        时间: new Date().toLocaleString(),
        重连次数: this.reconnectAttempts,
        最大次数: this.config.reconnectAttempts,
        状态: '停止重连'
      })
      this.log('重连次数已达上限，停止重连')
      this.setConnectionStatus('error')
      this.callbacks.onReconnectFailed?.()
      return
    }

    this.reconnectAttempts++
    this.setConnectionStatus('reconnecting')
    
    console.log('🔄 [WebSocket 安排重连]', {
      时间: new Date().toLocaleString(),
      当前重连次数: this.reconnectAttempts,
      最大重连次数: this.config.reconnectAttempts,
      重连间隔: `${this.config.reconnectInterval}ms`,
      下次重连时间: new Date(Date.now() + (this.config.reconnectInterval || 3000)).toLocaleString()
    })
    
    this.log(`${this.config.reconnectInterval}ms 后进行第 ${this.reconnectAttempts} 次重连`)
    
    this.reconnectTimer = setTimeout(() => {
      console.log('⏰ [WebSocket 开始重连]', {
        时间: new Date().toLocaleString(),
        重连次数: this.reconnectAttempts
      })
      this.callbacks.onReconnect?.(this.reconnectAttempts)
      this.connect()
    }, this.config.reconnectInterval)
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
    this.connectionStatus = status
    this.log(`连接状态变更: ${status}`)
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
