import React from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useWebSocketConnection, useWebSocketActions } from '@/store/websocketStore'
import { cn } from '@/lib/utils'

interface WebSocketStatusProps {
  className?: string
  showReconnectButton?: boolean
}

/**
 * WebSocket连接状态指示器组件
 * 显示当前WebSocket连接状态，并提供重连功能
 */
export const WebSocketStatus: React.FC<WebSocketStatusProps> = ({ 
  className, 
  showReconnectButton = true 
}) => {
  const { connectionStatus, error, reconnectAttempts } = useWebSocketConnection()
  const { resetConnection } = useWebSocketActions()

  const getStatusConfig = () => {
    switch (connectionStatus) {
      case 'connected':
        return {
          variant: 'default' as const,
          text: '已连接',
          color: 'bg-emerald-500',
          icon: '🟢'
        }
      case 'connecting':
        return {
          variant: 'secondary' as const,
          text: '连接中...',
          color: 'bg-amber-500 animate-pulse',
          icon: '🟡'
        }
      case 'reconnecting':
        return {
          variant: 'secondary' as const,
          text: `重连中... (${reconnectAttempts}/5)`,
          color: 'bg-blue-500 animate-pulse',
          icon: '🔄'
        }
      case 'error':
        return {
          variant: 'destructive' as const,
          text: '连接错误',
          color: 'bg-red-500',
          icon: '🔴'
        }
      default:
        return {
          variant: 'outline' as const,
          text: '未连接',
          color: 'bg-muted-foreground',
          icon: '⚪'
        }
    }
  }

  const statusConfig = getStatusConfig()

  const handleReconnect = () => {
    if (connectionStatus === 'error' || connectionStatus === 'disconnected') {
      resetConnection()
    }
  }

  return (
    <div className={cn("flex items-center space-x-2", className)}>
      {/* 状态指示器 */}
      <div className="flex items-center space-x-1">
        <div className={cn("w-2 h-2 rounded-full", statusConfig.color)} />
        <Badge variant={statusConfig.variant} className="text-xs">
          {statusConfig.icon} {statusConfig.text}
        </Badge>
      </div>

      {/* 错误信息 */}
      {error && (
        <span className="text-xs text-destructive max-w-32 truncate" title={error}>
          {error}
        </span>
      )}

      {/* 重连按钮 */}
      {showReconnectButton && (connectionStatus === 'error' || connectionStatus === 'disconnected') && (
        <Button
          size="sm"
          variant="outline"
          onClick={handleReconnect}
          className="text-xs h-6 px-2"
        >
          重连
        </Button>
      )}
    </div>
  )
}

export default WebSocketStatus
