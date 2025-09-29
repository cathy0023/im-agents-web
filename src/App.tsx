import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { useEffect } from 'react'
import Header from './components/Header'
import Sidebar from './components/Sidebar'
import MessageLayout from './components/layout/MessageLayout'
import AnalysisLayout from './components/layout/AnalysisLayout'
import ContactsList from './components/ContactsList'
import ContactMessageLayout from './components/layout/ContactMessageLayout'
import WebSocketTest from './components/WebSocketTest'
import DebugAgents from './components/DebugAgents'
import DefaultRedirect from './components/DefaultRedirect'
import { useThemeStore } from './store/themeStore'
import { useUserStore } from './store/userStore'
import { useWebSocketActions } from './store/websocketStore'

function App() {
  const { theme, setTheme } = useThemeStore()
  const { initializeSession } = useUserStore()
  const { connect } = useWebSocketActions()

  // 初始化主题和用户session
  useEffect(() => {
    // 应用当前主题设置
    setTheme(theme)
    
    // 初始化用户session
    initializeSession()
  }, [theme, setTheme, initializeSession])

  // 初始化WebSocket连接
  useEffect(() => {
    console.log('🚀 [App] 初始化WebSocket连接')
    connect()
    
    // 组件卸载时断开连接
    return () => {
      console.log('🔌 [App] 组件卸载，WebSocket将由管理器自动处理')
    }
  }, [connect])

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
            {/* 默认路由：动态重定向到第一个智能体 */}
            <Route path="/" element={<DefaultRedirect />} />
            
            {/* 消息模块路由 - 使用动态 agent_key */}
            <Route path="/messages" element={<DefaultRedirect />} />
            <Route path="/messages/:agentKey" element={<MessageLayout />} />
            <Route path="/messages/contact/:conversationId" element={<ContactMessageLayout />} />
            
            {/* 分析模块路由 */}
            <Route path="/analysis" element={<AnalysisLayout />} />
            
            {/* 通讯录模块路由 */}
            <Route path="/contacts" element={<ContactsList />} />
            
            {/* 调试页面（仅开发环境） */}
            {process.env.NODE_ENV === 'development' && (
              <>
                <Route path="/debug/websocket-test" element={<WebSocketTest />} />
                <Route path="/debug/agents" element={<DebugAgents />} />
              </>
            )}
            
            {/* 404路由：动态重定向到默认智能体 */}
            <Route path="*" element={<DefaultRedirect />} />
          </Routes>
        </div>
      </div>
    </Router>
  )
}

export default App