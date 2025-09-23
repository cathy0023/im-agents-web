import { PanelLeft, Settings } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useState } from 'react'
import ChatArea from './ChatArea'
import ChartArea from './ChartArea'
import SettingsPanel from './SettingsPanel'
import FooterBar from './FooterBar'
import AgentList from './AgentList'

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

  const handleToggleAgentList = () => {
    setIsAgentListCollapsed(!isAgentListCollapsed)
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
        // HR智能助手：对话和数据同时显示
        return (
          <div className="flex-1 flex overflow-hidden">
            <div className="flex-1 h-full">
              <ChatArea mode={mode} selectedAgent={selectedAgent} />
            </div>
            <div className="flex-1 h-full">
              <ChartArea />
            </div>
          </div>
        )
      case 2:
        // DataEyes：只有数据表
        return (
          <div className="flex-1 flex overflow-hidden">
            <div className="flex-1 h-full">
              <ChartArea />
            </div>
          </div>
        )
      case 3:
        // 对话助手：只有对话
        return (
          <div className="flex-1 flex overflow-hidden">
            <div className="flex-1 h-full">
              <ChatArea mode={mode} selectedAgent={selectedAgent} />
            </div>
          </div>
        )
      default:
        return (
          <div className="flex-1 flex overflow-hidden">
            <div className="flex-1 h-full">
              <ChatArea mode={mode} selectedAgent={selectedAgent} />
            </div>
            <div className="flex-1 h-full">
              <ChartArea />
            </div>
          </div>
        )
    }
  }

  // 获取FooterBar配置
  const getFooterConfig = () => {
    switch(selectedAgent) {
      case 1: 
        // HR智能助手：同时显示操作和输入
        return { 
          showInput: true, 
          showActions: true 
        }
      case 2: return { showInput: false, showActions: true } // 只有操作
      case 3: return { showInput: true, showActions: false } // 只有输入
      default: return { showInput: true, showActions: false }
    }
  }

  // HR模式：包含AgentList在左侧
  if (mode === 'hr') {
    const footerConfig = getFooterConfig()
    
    return (
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
              
            </div>
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
          
          {/* 主要内容区域 */}
          <div className="flex-1 flex overflow-hidden">
            {/* 中间内容区域 */}
            <div className="flex-1 flex flex-col">
              {/* 内容区域 - 根据智能体类型显示不同布局 */}
              {getContentLayout()}
              
              {/* FooterBar */}
              <FooterBar 
                mode={mode} 
                selectedAgent={selectedAgent}
                showInput={footerConfig.showInput}
                showActions={footerConfig.showActions}
              />
            </div>
            
            {/* 右侧设置面板 */}
            <SettingsPanel 
              isVisible={isSettingsPanelVisible} 
              onClose={() => setIsSettingsPanelVisible(false)}
            />
          </div>
        </div>
      </div>
    )
  }

  // DataEyes模式：不包含AgentList
  return (
    <div className="flex-1 flex flex-col h-full bg-gray-50">
      {/* HeaderBar */}
      <div className="h-12 bg-white border-b border-gray-200 flex items-center justify-between px-4">
        <div className="flex items-center space-x-3">
          <h2 className="text-lg font-semibold text-gray-900">DataEyes分析</h2>
        </div>
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
      
      {/* 主要内容区域 */}
      <div className="flex-1 flex overflow-hidden">
        {/* 中间内容区域 */}
        <div className="flex-1 flex flex-col">
          {/* Chat区域 */}
          <div className="flex-1 h-full">
            <ChatArea mode={mode} selectedAgent={selectedAgent} />
          </div>
          
          {/* FooterBar */}
          <FooterBar 
            mode={mode} 
            selectedAgent={selectedAgent}
            showInput={true}
            showActions={false}
          />
        </div>
        
        {/* 右侧设置面板 */}
        <SettingsPanel 
          isVisible={isSettingsPanelVisible} 
          onClose={() => setIsSettingsPanelVisible(false)}
        />
      </div>
    </div>
  )
}

export default MainContent