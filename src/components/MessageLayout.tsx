import { useParams, Navigate } from 'react-router-dom'
import { PanelLeft } from 'lucide-react'
// 暂时未使用: Settings, Key
import { Button } from '@/components/ui/button'
import { useState, useEffect } from 'react'
import ChatArea from './ChatArea'
import ChartArea from './ChartArea'
import SettingsPanel from './SettingsPanel'
import AgentList from './AgentList'
import ApiKeyDialog from './ApiKeyDialog'
import FooterBar from './FooterBar'
import { useChatStore } from '../store/chatStore'
import { getAgentByRoute, getDefaultAgent, type Agent } from '../types/router'

const MessageLayout = () => {
  const { agentType } = useParams<{ agentType: string }>()
  const [isSettingsPanelVisible, setIsSettingsPanelVisible] = useState(false)
  const [isAgentListCollapsed, setIsAgentListCollapsed] = useState(false)
  const [isApiKeyDialogOpen, setIsApiKeyDialogOpen] = useState(false)
  
  const { apiKey, clearAgentMessages } = useChatStore()

  // 获取当前智能体信息
  const currentAgent: Agent | null = agentType ? getAgentByRoute(agentType) : null
  
  // 检查是否需要显示API Key配置
  useEffect(() => {
    if (!apiKey) {
      setIsApiKeyDialogOpen(true)
    }
  }, [apiKey])
  
  // 如果找不到智能体，重定向到默认智能体
  if (!currentAgent) {
    const defaultAgent = getDefaultAgent()
    return <Navigate to={defaultAgent.route} replace />
  }

  const handleToggleAgentList = () => {
    setIsAgentListCollapsed(!isAgentListCollapsed)
  }

  const handleApiKeyConfig = () => {
    setIsApiKeyDialogOpen(true)
  }

  const handleClearMessages = () => {
    // 清空当前选中的Agent的消息
    clearAgentMessages(currentAgent.id)
  }

  // 获取内容区域布局
  const getContentLayout = () => {
    switch(currentAgent.id) {
      case 1: 
        // HR智能助手：对话和数据同时显示 + 输入框
        return (
          <div className="flex-1 flex flex-col h-full">
            <div className="flex-1 flex overflow-hidden">
              <div className="flex-1 h-full">
                <ChatArea selectedAgent={currentAgent.id} />
              </div>
              <div className="flex-1 h-full">
                <ChartArea />
              </div>
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
        // DataEyes：数据分析图表 + 独立操作区域（无输入框）
        return (
          <div className="flex-1 flex flex-col h-full">
            <div className="flex-1 overflow-hidden">
              <ChartArea />
            </div>
            <FooterBar 
              mode="hr" 
              selectedAgent={currentAgent.id}
              showInput={false}
              showActions={true}
            />
          </div>
        )
      case 3:
        // 对话助手：只有对话 + 输入框
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
        return (
          <div className="flex-1 flex flex-col">
            <div className="flex-1 flex overflow-hidden">
              <div className="flex-1 h-full">
                <ChatArea selectedAgent={currentAgent.id} />
              </div>
              <div className="flex-1 h-full">
                <ChartArea />
              </div>
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
        {/* 左侧AgentList */}
        <AgentList 
          selectedAgent={currentAgent.id} 
          onAgentChange={() => {}} // 路由模式下不需要回调
          isCollapsed={isAgentListCollapsed}
        />
        
        {/* 右侧主要内容区域 */}
        <div className="flex-1 flex flex-col h-full bg-background">
          {/* HeaderBar */}
          <div className="h-12 bg-background border-b border-border flex items-center justify-between px-4">
            <div className="flex items-center space-x-3">
              <Button 
                variant="ghost" 
                size="icon"
                onClick={handleToggleAgentList}
                className="h-8 w-8 text-muted-foreground hover:text-foreground"
                title="展开/收起Agent列表"
              >
                <PanelLeft className="h-4 w-4" />
              </Button>
              <h2 className="text-lg font-semibold text-foreground">{currentAgent.title}</h2>
            </div>
            {/* <div className="flex items-center space-x-2">
              <Button 
                variant="ghost" 
                size="icon"
                onClick={handleApiKeyConfig}
                className="h-8 w-8 text-muted-foreground hover:text-foreground"
                title="配置API Key"
              >
                <Key className="h-4 w-4" />
              </Button>
              <Button 
                variant="ghost" 
                size="icon"
                onClick={handleClearMessages}
                className="h-8 w-8 text-muted-foreground hover:text-foreground"
                title="清空对话"
              >
                🗑️
              </Button>
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => setIsSettingsPanelVisible(!isSettingsPanelVisible)}
                className="h-8 w-8 text-muted-foreground hover:text-foreground"
                title="设置"
              >
                <Settings className="h-4 w-4" />
              </Button>
            </div> */}
          </div>
          
          {/* 主要内容区域 */}
          <div className="flex-1 flex overflow-hidden">
            {/* 中间内容区域 */}
            <div className="flex-1 flex flex-col">
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
      
      {/* API Key配置弹窗 */}
      <ApiKeyDialog 
        isOpen={isApiKeyDialogOpen}
        onClose={() => setIsApiKeyDialogOpen(false)}
      />
    </>
  )
}

export default MessageLayout
