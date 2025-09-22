import { useState } from 'react'
import Header from './components/Header'
import Sidebar from './components/Sidebar'
import AgentList from './components/AgentList'
import MainContent from './components/MainContent'

function App() {
  const [activeTab, setActiveTab] = useState<'hr' | 'dataEyes'>('hr')
  const [selectedAgent, setSelectedAgent] = useState<number>(1) // 默认选中HR (id: 1)

  return (
    <div className="h-screen flex flex-col bg-gray-100">
      {/* 顶部Header */}
      <Header />
      
      {/* 主要内容区域 */}
      <div className="flex-1 flex overflow-hidden">
        {/* 最左侧导航 */}
        <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
        
        {/* 根据activeTab决定布局 */}
        {activeTab === 'hr' ? (
          <>
            {/* HR模式：显示Agent列表 + 主内容 */}
            <AgentList 
              selectedAgent={selectedAgent} 
              onAgentChange={setSelectedAgent} 
            />
            <MainContent mode="hr" selectedAgent={selectedAgent} />
          </>
        ) : (
          <>
            {/* dataEyes模式：直接显示主内容 */}
            <MainContent mode="dataEyes" selectedAgent={2} />
          </>
        )}
      </div>
    </div>
  )
}

export default App