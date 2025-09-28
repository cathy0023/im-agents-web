import { useParams, Navigate } from 'react-router-dom'
import { useState } from 'react'
import ChatArea from '../ChatArea'
import SettingsPanel from '../SettingsPanel'
import AgentList from '../AgentList'
import FooterBar from '../FooterBar'
import DataEyesLayout from './DataEyesLayout'
import { getAgentByRoute, getDefaultAgent, type Agent } from '../../types/router'

const MessageLayout = () => {
  const { agentType } = useParams<{ agentType: string }>()
  const [isSettingsPanelVisible, setIsSettingsPanelVisible] = useState(false)
  const [isAgentListCollapsed, setIsAgentListCollapsed] = useState(false)
  const currentAgent: Agent | null = agentType ? getAgentByRoute(agentType) : null
  
  // 如果找不到智能体，重定向到默认智能体
  if (!currentAgent) {
    const defaultAgent = getDefaultAgent()
    return <Navigate to={defaultAgent.route} replace />
  }

  const handleToggleAgentList = () => {
    setIsAgentListCollapsed(!isAgentListCollapsed)
  }


  // const handleClearMessages = () => {
  //   // 清空当前选中的Agent的消息
  //   clearAgentMessages(currentAgent.id)
  // }

  // 获取内容区域布局
  const getContentLayout = () => {
    switch(currentAgent.id) {
      case 1: 
        // HR智能助手：纯聊天布局 + 输入框
        return (
          <div className="flex-1 flex flex-col h-full">
            <div className="flex-1 overflow-hidden">
              <ChatArea selectedAgent={currentAgent.id} />
            </div>
            <FooterBar 
              mode="hr" 
              selectedAgent={currentAgent.id}
              showInput={true}
              showActions={true}
            />
          </div>
        )
      case 2:
        // DataEyes：agentsList + dataEyesLayout
        return <DataEyesLayout agentId={currentAgent.id} isAgentListCollapsed={isAgentListCollapsed} />
      case 3:
        // 心理测评师：纯聊天布局 + 输入框
        return (
          <div className="flex-1 flex flex-col h-full">
            <div className="flex-1 overflow-hidden">
              <ChatArea selectedAgent={currentAgent.id} />
            </div>
            <FooterBar 
              mode="hr" 
              selectedAgent={currentAgent.id}
              showInput={true}
              showActions={false}
            />
          </div>
        )
      default:
        // 默认：纯聊天布局
        return (
          <div className="flex-1 flex flex-col h-full">
            <div className="flex-1 overflow-hidden">
              <ChatArea selectedAgent={currentAgent.id} />
            </div>
            <FooterBar 
              mode="hr" 
              selectedAgent={currentAgent.id}
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
          selectedAgent={currentAgent.id} 
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
