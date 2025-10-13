import { useParams, Navigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { ChatArea } from '@/components/chat'
import { SettingsPanel, FooterBar } from '@/components/common'
import { AgentList } from '@/components/agents'
import { DataEyesLayout } from '@/components/layout'
import { useWebSocketChatIntegration } from '@/hooks/useWebSocketChatIntegration'
import { useEnsureWebSocketConnected } from '@/hooks/useEnsureWebSocketConnected'
import { useAgentsStore } from '@/store/agentsStore'

const MessageLayout = () => {
  const { agentKey } = useParams<{ agentKey: string }>()
  const [isSettingsPanelVisible, setIsSettingsPanelVisible] = useState(false)
  const [isAgentListCollapsed, setIsAgentListCollapsed] = useState(false)
  
  // 使用 agents store
  const { loading, hasLoaded, loadAgents, getAgentByKey } = useAgentsStore()
  
  // 确保 WebSocket 连接
  useEnsureWebSocketConnected()
  
  // 启用WebSocket聊天集成
  useWebSocketChatIntegration()
  
  // 确保 agents 数据已加载
  useEffect(() => {
    if (!hasLoaded) {
      loadAgents()
    }
  }, [hasLoaded, loadAgents])
  
  // 获取当前 agent
  const currentApiAgent = agentKey ? getAgentByKey(agentKey) : null
  
  // 如果没有agentKey，重定向到默认路由
  if (!agentKey) {
    return <Navigate to="/" replace />
  }
  
  // 加载中状态
  if (loading || !hasLoaded) {
    return (
      <div className="flex-1 flex items-center justify-center bg-background">
        <div className="text-muted-foreground">加载中...</div>
      </div>
    )
  }
  
  // 如果找不到对应的agent，重定向到默认路由
  if (!currentApiAgent) {
    console.warn('MessageLayout: 找不到对应的agent，agentKey:', agentKey)
    return <Navigate to="/" replace />
  }
  
  console.log('MessageLayout: 当前agent:', currentApiAgent)

  const handleToggleAgentList = () => {
    setIsAgentListCollapsed(!isAgentListCollapsed)
  }


  // const handleClearMessages = () => {
  //   // 清空当前选中的Agent的消息
  //   clearAgentMessages(currentAgent.id)
  // }

  // 获取内容区域布局 - 根据 agent_type 决定
  const getContentLayout = () => {
    const agentType = currentApiAgent?.agent_type || 'conversation'
    const agentUuid = currentApiAgent?.uuid || ''
    
    console.log('MessageLayout: 根据agent_type决定布局:', agentType, 'uuid:', agentUuid)
    
    switch(agentType) {
      case 'list':
        // agent_type 为 list：DataEyes 布局
        return <DataEyesLayout agentId={agentUuid} isAgentListCollapsed={isAgentListCollapsed} />
      
      case 'conversation':
      default:
        // agent_type 为 conversation 或默认：纯聊天布局 + 输入框
        return (
          <div className="flex-1 flex flex-col h-full">
            <div className="flex-1 overflow-hidden">
              <ChatArea selectedAgent={agentUuid} />
            </div>
            <FooterBar 
              mode="hr" 
              selectedAgent={agentUuid}
              showInput={true}
              showActions={false}
            />
          </div>
        )
    }
  }

  return (
    <>
      <div className="flex-1 flex overflow-hidden">
        {/* 左侧AgentList - 所有模式都显示 */}
        <AgentList 
          selectedAgentKey={currentApiAgent?.agent_key || ''} 
          onAgentChange={() => {}} // 路由模式下不需要回调
          isCollapsed={isAgentListCollapsed}
          onToggleCollapse={handleToggleAgentList}
        />
        
        {/* 右侧主要内容区域 */}
        <div className="flex-1 flex flex-col h-full bg-background">
          
          {/* 主要内容区域 */}
          <div className="flex-1 flex overflow-hidden">
            {/* 中间内容区域 */}
            <div className="flex-1 flex flex-col bg-background">
              {/* 内容区域 - 根据智能体类型显示不同布局 */}
              {getContentLayout()}
            </div>
            
            {/* 右侧设置面板 */}
            <SettingsPanel 
              isVisible={isSettingsPanelVisible} 
              onClose={() => setIsSettingsPanelVisible(false)}
            />
          </div>
        </div>
      </div>
      
    </>
  )
}

export default MessageLayout
