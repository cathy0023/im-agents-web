import { useState } from 'react'
import Header from './components/Header'
import Sidebar from './components/Sidebar'
import MainContent from './components/MainContent'

function App() {
  const [activeTab, setActiveTab] = useState<'hr' | 'dataEyes' | 'psychologist'>('hr')
  const [selectedAgent, setSelectedAgent] = useState<number>(1) // 默认选中HR (id: 1)

  // 当切换到对练模式时，自动选择心理测评师
  const handleTabChange = (tab: 'hr' | 'dataEyes' | 'psychologist') => {
    setActiveTab(tab)
    if (tab === 'psychologist' && selectedAgent < 4) {
      setSelectedAgent(4) // 默认选择心理测评师
    } else if (tab === 'hr' && selectedAgent > 3) {
      setSelectedAgent(1) // 切换回HR模式时选择HR助手
    }
  }

  return (
    <div className="h-screen flex flex-col bg-gray-100">
      {/* 顶部Header */}
      <Header />
      
      {/* 主要内容区域 */}
      <div className="flex-1 flex overflow-hidden">
        {/* 最左侧导航 */}
        <Sidebar 
          activeTab={activeTab} 
          onTabChange={handleTabChange}
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