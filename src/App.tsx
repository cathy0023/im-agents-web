import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useEffect } from 'react'
import Header from './components/Header'
import Sidebar from './components/Sidebar'
import MessageLayout from './components/layout/MessageLayout'
import AnalysisLayout from './components/layout/AnalysisLayout'
import ContactsList from './components/ContactsList'
import ContactMessageLayout from './components/layout/ContactMessageLayout'
import { getDefaultAgent } from './types/router'
import { useThemeStore } from './store/themeStore'
import { useUserStore } from './store/userStore'

function App() {
  const defaultAgent = getDefaultAgent()
  const { theme, setTheme } = useThemeStore()
  const { initializeSession } = useUserStore()

  // 初始化主题和用户session
  useEffect(() => {
    // 应用当前主题设置
    setTheme(theme)
    
    // 初始化用户session
    initializeSession()
  }, [theme, setTheme, initializeSession])

  return (
    <Router>
      <div className="h-screen flex flex-col bg-background text-foreground">
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
            <Route path="/messages/contact/:conversationId" element={<ContactMessageLayout />} />
            
            {/* 分析模块路由 */}
            <Route path="/analysis" element={<AnalysisLayout />} />
            
            {/* 通讯录模块路由 */}
            <Route path="/contacts" element={<ContactsList />} />
            
            {/* 404路由：重定向到默认智能体 */}
            <Route path="*" element={<Navigate to={defaultAgent.route} replace />} />
          </Routes>
        </div>
      </div>
    </Router>
  )
}

export default App