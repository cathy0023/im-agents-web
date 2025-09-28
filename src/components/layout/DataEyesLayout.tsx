import React, { useCallback, useEffect } from 'react'
import { cn } from '@/lib/utils'
import AdaptiveContainer from '../AdaptiveContainer'
import ChatBubble from '../ChatBubble'
import ChatArea from '../ChatArea'
import ChatInputArea from '../ChatInputArea'
import ChartArea from '../ChartArea'
import { useChatStore } from '@/store/chatStore'
import type { DataEyesLayoutProps } from '@/types/dataEyes'

const DataEyesLayout = ({
  agentId,
  chatEnabled = true,
  chatBubblePosition = 'bottom-left',
  className,
  isAgentListCollapsed = false
}: DataEyesLayoutProps) => {
  
  // 使用全局状态管理
  const { 
    dataEyesConfig, 
    toggleDataEyesChat, 
    setDataEyesLayoutMode,
    setSelectedAgent 
  } = useChatStore()
  
  const { isChatActive, bubbleVisible, layoutMode } = dataEyesConfig

  // 设置当前Agent (确保聊天消息正确关联)
  React.useEffect(() => {
    setSelectedAgent(agentId)
  }, [agentId, setSelectedAgent])

  // 切换聊天模式
  const toggleChatMode = useCallback(() => {
    toggleDataEyesChat()
  }, [toggleDataEyesChat])

  // 关闭聊天模式
  const closeChatMode = useCallback(() => {
    setDataEyesLayoutMode('chart-only')
  }, [setDataEyesLayoutMode])
  
  // 键盘快捷键支持
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // ESC键关闭聊天
      if (event.key === 'Escape' && isChatActive) {
        closeChatMode()
        return
      }
      
      // Ctrl/Cmd + / 切换聊天模式
      if ((event.ctrlKey || event.metaKey) && event.key === '/') {
        event.preventDefault()
        toggleChatMode()
        return
      }
    }
    
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isChatActive, closeChatMode, toggleChatMode])

  // 构建聊天组件
  const chatComponent = isChatActive ? (
    <div className="flex-1 flex flex-col h-full relative">
      {/* 聊天区域头部和关闭按钮 */}
      <div className="flex items-center justify-between p-3 border-b border-border bg-background">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 rounded-full bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400"></div>
          <span className="text-sm font-medium text-foreground">DataEyes 聊天</span>
        </div>
        <button
          onClick={closeChatMode}
          className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors duration-200"
          title="关闭聊天 (ESC)"
          aria-label="关闭聊天"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      
      {/* 聊天对话区域 */}
      <div className="flex-1 overflow-hidden">
        <ChatArea selectedAgent={agentId} />
      </div>
      
      {/* 消息输入区域 */}
      <ChatInputArea 
        agentId={agentId}
        placeholder="请输入数据分析问题..."
      />
    </div>
  ) : null

  // 图表组件
  const chartComponent = <ChartArea />

  return (
    <div className={cn("flex-1 flex flex-col h-full relative", className)}>
      {/* 自适应布局容器 */}
      <AdaptiveContainer
        mode={layoutMode}
        chatComponent={chatComponent}
        chartComponent={chartComponent}
        splitRatio={0.5} // 1:1分割
      />
      
      {/* 聊天气泡 - 仅在启用聊天且未激活时显示 */}
      {chatEnabled && (
        <ChatBubble
          visible={bubbleVisible && !isChatActive}
          onClick={toggleChatMode}
          position={chatBubblePosition}
          size="md"
          variant="gradient"
          pulse={true}
          isAgentListCollapsed={isAgentListCollapsed}
        />
      )}

    </div>
  )
}

export default DataEyesLayout
