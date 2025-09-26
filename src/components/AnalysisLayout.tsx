// 这些导入暂时未使用，将来可能需要
// import { Settings, Key } from 'lucide-react'
// import { Button } from '@/components/ui/button'
import { useState } from 'react'
import ChartArea from './ChartArea'
import SettingsPanel from './SettingsPanel'
import FooterBar from './FooterBar'
const AnalysisLayout = () => {
  const [isSettingsPanelVisible, setIsSettingsPanelVisible] = useState(false)



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
      
    </>
  )
}

export default AnalysisLayout
