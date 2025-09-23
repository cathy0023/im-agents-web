import { PanelLeft, Settings, Key } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useState, useEffect } from 'react'
import ChatArea from './ChatArea'
import ChartArea from './ChartArea'
import SettingsPanel from './SettingsPanel'
import AgentList from './AgentList'
import ApiKeyDialog from './ApiKeyDialog'
import FooterBar from './FooterBar'
import { useChatStore } from '../store/chatStore'

interface MainContentProps {
  mode?: 'hr' | 'dataEyes';
  selectedAgent?: number;
  onAgentChange?: (agentId: number) => void;
}

const MainContent = ({ 
  mode = 'hr', 
  selectedAgent = 1, 
  onAgentChange 
}: MainContentProps) => {
  const [isSettingsPanelVisible, setIsSettingsPanelVisible] = useState(false)
  const [isAgentListCollapsed, setIsAgentListCollapsed] = useState(false)
  const [isApiKeyDialogOpen, setIsApiKeyDialogOpen] = useState(false)
  
  const { apiKey, clearAgentMessages } = useChatStore()

  // 检查是否需要显示API Key配置
  useEffect(() => {
    if (!apiKey) {
      setIsApiKeyDialogOpen(true)
    }
  }, [apiKey])

  const handleToggleAgentList = () => {
    setIsAgentListCollapsed(!isAgentListCollapsed)
  }

  const handleApiKeyConfig = () => {
    setIsApiKeyDialogOpen(true)
  }

  const handleClearMessages = () => {
    // 只清空当前选中的Agent的消息
    clearAgentMessages(selectedAgent)
  }

  // 获取智能体标题
  const getAgentTitle = () => {
    switch(selectedAgent) {
      case 1: return 'HR智能助手'
      case 2: return 'DataEyes'
      case 3: return '对话助手'
      default: return 'HR智能助手'
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
          {/* 左侧AgentList */}
          <AgentList 
            selectedAgent={selectedAgent} 
            onAgentChange={onAgentChange || (() => {})}
            isCollapsed={isAgentListCollapsed}
          />
          
          {/* 右侧主要内容区域 */}
          <div className="flex-1 flex flex-col h-full bg-gray-50">
            {/* HeaderBar */}
            <div className="h-12 bg-white border-b border-gray-200 flex items-center justify-between px-4">
              <div className="flex items-center space-x-3">
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={handleToggleAgentList}
                  className="h-8 w-8 text-gray-600 hover:text-gray-900"
                  title="展开/收起Agent列表"
                >
                  <PanelLeft className="h-4 w-4" />
                </Button>
                <h2 className="text-lg font-semibold text-gray-900">{getAgentTitle()}</h2>
                {!apiKey && (
                  <span className="px-2 py-1 text-xs bg-red-100 text-red-600 rounded">
                    需要配置API Key
                  </span>
                )}
              </div>
              <div className="flex items-center space-x-2">
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={handleApiKeyConfig}
                  className="h-8 w-8 text-gray-600 hover:text-gray-900"
                  title="配置API Key"
                >
                  <Key className="h-4 w-4" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={handleClearMessages}
                  className="h-8 w-8 text-gray-600 hover:text-gray-900"
                  title="清空对话"
                >
                  🗑️
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => setIsSettingsPanelVisible(!isSettingsPanelVisible)}
                  className="h-8 w-8 text-gray-600 hover:text-gray-900"
                  title="设置"
                >
                  <Settings className="h-4 w-4" />
                </Button>
              </div>
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

  // DataEyes模式：不包含AgentList
  return (
    <>
      <div className="flex-1 flex flex-col h-full bg-gray-50">
        {/* HeaderBar */}
        <div className="h-12 bg-white border-b border-gray-200 flex items-center justify-between px-4">
          <div className="flex items-center space-x-3">
            <h2 className="text-lg font-semibold text-gray-900">DataEyes分析</h2>
            {!apiKey && (
              <span className="px-2 py-1 text-xs bg-red-100 text-red-600 rounded">
                需要配置API Key
              </span>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={handleApiKeyConfig}
              className="h-8 w-8 text-gray-600 hover:text-gray-900"
              title="配置API Key"
            >
              <Key className="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon"
              onClick={handleClearMessages}
              className="h-8 w-8 text-gray-600 hover:text-gray-900"
              title="清空对话"
            >
              🗑️
            </Button>
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => setIsSettingsPanelVisible(!isSettingsPanelVisible)}
              className="h-8 w-8 text-gray-600 hover:text-gray-900"
              title="设置"
            >
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        {/* 主要内容区域 */}
        <div className="flex-1 flex overflow-hidden">
          {/* 中间内容区域 */}
          <div className="flex-1 flex flex-col">
            {/* DataEyes内容区域 */}
            {getContentLayout()}
          </div>
          
          {/* 右侧设置面板 */}
          <SettingsPanel 
            isVisible={isSettingsPanelVisible} 
            onClose={() => setIsSettingsPanelVisible(false)}
          />
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

export default MainContent