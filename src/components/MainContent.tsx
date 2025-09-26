import { PanelLeft, Settings } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useState } from 'react'
import ChatArea from './ChatArea'
import ChartArea from './ChartArea'
import SettingsPanel from './SettingsPanel'
import ConversationList from './ConversationList'
import FooterBar from './FooterBar'
import { useChatStore } from '../store/chatStore'
// import { useConversationStore } from '../store/conversationStore' // 暂时未直接使用
import type { Conversation } from '@/types/conversation'

interface MainContentProps {
  mode?: 'hr' | 'dataEyes';
  selectedAgent?: number;
  selectedConversationId?: string;
  onAgentChange?: (agentId: number) => void;
  onConversationChange?: (conversation: Conversation) => void;
}

const MainContent = ({ 
  mode = 'hr', 
  selectedAgent = 1, 
  selectedConversationId,
  onAgentChange,
  onConversationChange
}: MainContentProps) => {
  const [isSettingsPanelVisible, setIsSettingsPanelVisible] = useState(false)
  const [isConversationListCollapsed, setIsConversationListCollapsed] = useState(false)
  const { clearAgentMessages } = useChatStore()

  const handleToggleConversationList = () => {
    setIsConversationListCollapsed(!isConversationListCollapsed)
  }

  const handleConversationChange = (conversation: Conversation) => {
    // 如果是AI智能体对话，同时更新selectedAgent
    if (conversation.type === 'ai_agent' && conversation.agentId && onAgentChange) {
      onAgentChange(conversation.agentId)
    }
    
    // 通知父组件对话改变
    if (onConversationChange) {
      onConversationChange(conversation)
    }
  }


  const handleClearMessages = () => {
    // 只清空当前选中的Agent的消息
    clearAgentMessages(selectedAgent)
  }

  // 获取智能体标题
  const getAgentTitle = () => {
    switch(selectedAgent) {
      case 1: return 'HR'
      case 2: return 'DataEyes'
      case 3: return '心理测评师小王'
      default: return 'HR'
    }
  }

  // 获取内容区域布局
  const getContentLayout = () => {
    switch(selectedAgent) {
      case 1: 
        // HR智能助手：对话和数据同时显示 + 输入框
        return (
          <div className="flex-1 flex flex-col h-full">
            <div className="flex-1 flex overflow-hidden">
              <div className="flex-1 h-full">
                <ChatArea selectedAgent={selectedAgent} />
              </div>
              <div className="flex-1 h-full">
                <ChartArea />
              </div>
            </div>
            <FooterBar 
              mode={mode} 
              selectedAgent={selectedAgent}
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
              mode={mode} 
              selectedAgent={selectedAgent}
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
              <ChatArea selectedAgent={selectedAgent} />
            </div>
            <FooterBar 
              mode={mode} 
              selectedAgent={selectedAgent}
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
                <ChatArea selectedAgent={selectedAgent} />
              </div>
              <div className="flex-1 h-full">
                <ChartArea />
              </div>
            </div>
            <FooterBar 
              mode={mode} 
              selectedAgent={selectedAgent}
              showInput={true}
              showActions={false}
            />
          </div>
        )
    }
  }


  // HR模式：包含AgentList在左侧
  if (mode === 'hr') {
    return (
      <>
        <div className="flex-1 flex overflow-hidden">
          {/* 左侧对话列表 */}
          <ConversationList 
            selectedConversationId={selectedConversationId}
            onConversationChange={handleConversationChange}
            isCollapsed={isConversationListCollapsed}
            onToggleCollapse={handleToggleConversationList}
          />
          
          {/* 右侧主要内容区域 */}
          <div className="flex-1 flex flex-col h-full bg-background">
            {/* HeaderBar */}
            {/* <div className="h-12 bg-background border-b border-border flex items-center justify-between px-4">
              <div className="flex items-center space-x-3">
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={handleToggleConversationList}
                  className="h-8 w-8 text-muted-foreground hover:text-foreground"
                  title="展开/收起对话列表"
                >
                  <PanelLeft className="h-4 w-4" />
                </Button>
                <h2 className="text-lg font-semibold text-foreground">{getAgentTitle()}</h2>
              </div>
              <div className="flex items-center space-x-2">
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
              </div>
            </div> */}
            
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
        
      </>
    )
  }

  // DataEyes模式：不包含AgentList，直接显示内容
  return (
    <>
      <div className="flex-1 flex flex-col h-full bg-background">
        {/* 主要内容区域 - 直接显示DataEyes内容，无header */}
        <div className="flex-1 flex overflow-hidden">
          {/* DataEyes内容区域 */}
          <div className="flex-1 flex flex-col">
            {getContentLayout()}
          </div>
          
          {/* 右侧设置面板 */}
          <SettingsPanel 
            isVisible={isSettingsPanelVisible} 
            onClose={() => setIsSettingsPanelVisible(false)}
          />
        </div>
      </div>
      
    </>
  )
}

export default MainContent