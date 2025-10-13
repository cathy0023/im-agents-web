import React, { useCallback, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { AdaptiveContainer } from '@/components/common'
import { ChatArea, ChatInputArea } from '@/components/chat'
import { ChartArea } from '@/components/dataEyes'
import { useChatStore } from '@/store/chatStore'
import { useAgentsStore } from '@/store/agentsStore'
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
    <div className="flex-1 flex flex-col h-full relative bg-background/95 backdrop-blur-sm overflow-hidden shadow-lg border border-border/10 border-t-0 border-b-0" style={{
      marginLeft: '1px' // 避免与左侧边框重叠
    }}>
      {/* 聊天区域头部和关闭按钮 */}
      <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-background/80 to-background/60 backdrop-blur-sm">
        <div className="flex items-center space-x-3">
          <div className="w-2 h-2 rounded-full bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 shadow-sm animate-pulse"></div>
          <span className="text-sm font-semibold text-foreground">DataEyes 聊天</span>
        </div>
        <button
          onClick={closeChatMode}
          className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-accent/30 transition-all duration-200 hover:scale-105"
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

  // 获取当前agent信息
  const agents = useAgentsStore(state => state.agents)
  const currentApiAgent = agents.find(agent => agent.uuid === agentId)
  
  // 图表组件
  const chartComponent = (
    <ChartArea 
      agentKey={currentApiAgent?.agent_key} 
      agentUuid={currentApiAgent?.uuid} 
    />
  )

  return (
    <div className={cn("flex-1 flex flex-col h-full relative", className)}>
      {/* 自适应布局容器 */}
      <AdaptiveContainer
        mode={layoutMode}
        chatComponent={chatComponent}
        chartComponent={chartComponent}
        splitRatio={0.5} // 1:1分割
      />
      
      {/* 聊天气泡 - 暂时禁用 */}
      {/* {chatEnabled && (
        <ChatBubble
          visible={bubbleVisible && !isChatActive}
          onClick={toggleChatMode}
          position={chatBubblePosition}
          size="md"
          variant="gradient"
          pulse={true}
          isAgentListCollapsed={isAgentListCollapsed}
        />
      )} */}

    </div>
  )
}

export default DataEyesLayout
