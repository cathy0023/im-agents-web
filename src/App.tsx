import { useState } from 'react'
import Header from './components/Header'
import Sidebar from './components/Sidebar'
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
        <Sidebar 
          activeTab={activeTab} 
          onTabChange={setActiveTab}
        />
        
        {/* 主内容区域 - 包含AgentList和内容 */}
        <MainContent 
          mode={activeTab} 
          selectedAgent={selectedAgent}
          onAgentChange={setSelectedAgent}
        />
      </div>
    </div>
  )
}

export default App