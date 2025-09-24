import { Settings, Key } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useState, useEffect } from 'react'
import ChartArea from './ChartArea'
import SettingsPanel from './SettingsPanel'
import ApiKeyDialog from './ApiKeyDialog'
import FooterBar from './FooterBar'
import { useChatStore } from '../store/chatStore'

const AnalysisLayout = () => {
  const [isSettingsPanelVisible, setIsSettingsPanelVisible] = useState(false)
  const [isApiKeyDialogOpen, setIsApiKeyDialogOpen] = useState(false)
  
  const { apiKey, clearAgentMessages } = useChatStore()

  // 检查是否需要显示API Key配置
  useEffect(() => {
    if (!apiKey) {
      setIsApiKeyDialogOpen(true)
    }
  }, [apiKey])

  const handleApiKeyConfig = () => {
    setIsApiKeyDialogOpen(true)
  }

  const handleClearMessages = () => {
    // 清空分析模块相关的消息（使用特殊的ID）
    clearAgentMessages(999) // 使用特殊ID表示分析模块
  }

  return (
    <>
      <div className="flex-1 flex flex-col h-full bg-gray-50">
        {/* HeaderBar */}
        <div className="h-12 bg-white border-b border-gray-200 flex items-center justify-between px-4">
          <div className="flex items-center space-x-3">
            <h2 className="text-lg font-semibold text-gray-900">数据分析</h2>
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
              title="清空数据"
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
            {/* 分析内容区域 */}
            <div className="flex-1 flex flex-col h-full">
              <div className="flex-1 overflow-hidden">
                <ChartArea />
              </div>
              <FooterBar 
                mode="dataEyes" 
                selectedAgent={999} // 分析模块特殊ID
                showInput={false}
                showActions={true}
              />
            </div>
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

export default AnalysisLayout
