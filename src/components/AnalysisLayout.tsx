// 这些导入暂时未使用，将来可能需要
// import { Settings, Key } from 'lucide-react'
// import { Button } from '@/components/ui/button'
import { useState, useEffect } from 'react'
import ChartArea from './ChartArea'
import SettingsPanel from './SettingsPanel'
import ApiKeyDialog from './ApiKeyDialog'
import FooterBar from './FooterBar'
import { useChatStore } from '../store/chatStore'

const AnalysisLayout = () => {
  const [isSettingsPanelVisible, setIsSettingsPanelVisible] = useState(false)
  const [isApiKeyDialogOpen, setIsApiKeyDialogOpen] = useState(false)
  
  const { apiKey } = useChatStore()
  // clearAgentMessages 暂时未使用

  // 检查是否需要显示API Key配置
  useEffect(() => {
    if (!apiKey) {
      setIsApiKeyDialogOpen(true)
    }
  }, [apiKey])

  // 暂时未使用的函数，将来可能需要
  // const handleApiKeyConfig = () => {
  //   setIsApiKeyDialogOpen(true)
  // }

  // const handleClearMessages = () => {
  //   // 清空分析模块相关的消息（使用特殊的ID）
  //   clearAgentMessages(999) // 使用特殊ID表示分析模块
  // }

  return (
    <>
      <div className="flex-1 flex flex-col h-full bg-background">
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
