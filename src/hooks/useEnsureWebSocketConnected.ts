import { useEffect, useRef } from 'react'
import { useWebSocketConnection, useWebSocketActions } from '../store/websocketStore'

/**
 * 确保 WebSocket 连接的自定义 Hook
 * 在组件加载时检查和同步 WebSocket 连接状态
 * 
 * ⚠️ 注意：此 hook 应该只在顶层布局组件中使用一次，避免重复调用导致状态冲突
 */
export const useEnsureWebSocketConnected = () => {
  const { isConnected, connectionStatus } = useWebSocketConnection()
  const { connect, syncStatus } = useWebSocketActions()
  const hasInitialized = useRef(false)

  useEffect(() => {
    // 只在首次加载时执行
    if (hasInitialized.current) return
    hasInitialized.current = true

    console.log('🔍 [useEnsureWebSocketConnected] 检查 WebSocket 连接状态:', {
      isConnected,
      connectionStatus
    })

    // 立即同步状态
    syncStatus()

    // 如果未连接，尝试连接
    if (!isConnected && connectionStatus === 'disconnected') {
      console.log('🔌 [useEnsureWebSocketConnected] WebSocket 未连接，尝试连接...')
      connect()
    }

    // 优化：减少同步频率，避免与 API 请求冲突
    // 只在初始化后的1秒和2秒时各同步一次，确认连接状态稳定
    const timeouts: NodeJS.Timeout[] = []
    
    timeouts.push(setTimeout(() => {
      syncStatus()
      console.log('🔄 [useEnsureWebSocketConnected] 同步状态 (第 1 次)')
    }, 1000))
    
    timeouts.push(setTimeout(() => {
      syncStatus()
      console.log('🔄 [useEnsureWebSocketConnected] 同步状态 (第 2 次)')
    }, 2000))

    return () => {
      timeouts.forEach(timeout => clearTimeout(timeout))
    }
  }, []) // 空依赖数组，只在挂载时执行一次

  return {
    isConnected,
    connectionStatus
  }
}
