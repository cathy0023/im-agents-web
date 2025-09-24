import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Header from './components/Header'
import Sidebar from './components/Sidebar'
import MessageLayout from './components/MessageLayout'
import AnalysisLayout from './components/AnalysisLayout'
import { getDefaultAgent } from './types/router'

function App() {
  const defaultAgent = getDefaultAgent()

  return (
    <Router>
      <div className="h-screen flex flex-col bg-gray-100">
        {/* 顶部Header */}
        <Header />
        
        {/* 主要内容区域 */}
        <div className="flex-1 flex overflow-hidden">
          {/* 最左侧导航 */}
          <Sidebar />
          
          {/* 路由内容区域 */}
          <Routes>
            {/* 默认路由：重定向到第一个智能体 */}
            <Route path="/" element={<Navigate to={defaultAgent.route} replace />} />
            
            {/* 消息模块路由 */}
            <Route path="/messages" element={<Navigate to={defaultAgent.route} replace />} />
            <Route path="/messages/:agentType" element={<MessageLayout />} />
            
            {/* 分析模块路由 */}
            <Route path="/analysis" element={<AnalysisLayout />} />
            
            {/* 404路由：重定向到默认智能体 */}
            <Route path="*" element={<Navigate to={defaultAgent.route} replace />} />
          </Routes>
        </div>
      </div>
    </Router>
  )
}

export default App