import { MessageCircle, BarChart3, Users, Bug } from 'lucide-react'
import { useNavigate, useLocation } from 'react-router-dom'
import { getDefaultAgent } from '../types/router'

interface SidebarProps {
  activeTab?: 'messages' | 'analysis' | 'contacts';
  onTabChange?: (tab: 'messages' | 'analysis' | 'contacts') => void;
}

const Sidebar = ({ onTabChange }: SidebarProps) => {
  const navigate = useNavigate()
  const location = useLocation()

  // 从当前路径判断活跃状态
  const isMessagesActive = location.pathname.startsWith('/messages')
  const isAnalysisActive = location.pathname.startsWith('/analysis')
  const isContactsActive = location.pathname.startsWith('/contacts')
  const isDebugActive = location.pathname.startsWith('/debug')

  const handleTabChange = (tab: 'messages' | 'analysis' | 'contacts') => {
    console.log('Switching to tab:', tab)
    
    // 路由导航
    if (tab === 'messages') {
      // 导航到默认智能体
      const defaultAgent = getDefaultAgent()
      navigate(defaultAgent.route)
    } else if (tab === 'analysis') {
      navigate('/analysis')
    } else if (tab === 'contacts') {
      navigate('/contacts')
    }
    
    // 保持向后兼容
    if (onTabChange) {
      onTabChange(tab)
    }
  }

  return (
    <div className="w-20 bg-muted/30 border-r border-border/50 flex flex-col h-full backdrop-blur-sm">
      
      {/* 功能导航 */}
      <div className="flex-1 p-3 flex flex-col space-y-2">
        <button
          onClick={() => handleTabChange('messages')}
          className={`group relative w-full h-12 flex flex-col items-center justify-center rounded-xl transition-all duration-200 cursor-pointer ${
            isMessagesActive 
              ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/25' 
              : 'text-muted-foreground hover:text-foreground hover:bg-background/50'
          }`}
        >
          <MessageCircle className={`h-5 w-5 transition-transform group-hover:scale-110 ${
            isMessagesActive ? 'scale-110' : ''
          }`} />
          <span className="text-[10px] font-medium mt-1">消息</span>
        </button>
        
        <button
          onClick={() => handleTabChange('analysis')}
          className={`group relative w-full h-12 flex flex-col items-center justify-center rounded-xl transition-all duration-200 cursor-pointer ${
            isAnalysisActive 
              ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/25' 
              : 'text-muted-foreground hover:text-foreground hover:bg-background/50'
          }`}
        >
          <BarChart3 className={`h-5 w-5 transition-transform group-hover:scale-110 ${
            isAnalysisActive ? 'scale-110' : ''
          }`} />
          <span className="text-[10px] font-medium mt-1">分析</span>
        </button>

        <button
          onClick={() => handleTabChange('contacts')}
          className={`group relative w-full h-12 flex flex-col items-center justify-center rounded-xl transition-all duration-200 cursor-pointer ${
            isContactsActive 
              ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/25' 
              : 'text-muted-foreground hover:text-foreground hover:bg-background/50'
          }`}
        >
          <Users className={`h-5 w-5 transition-transform group-hover:scale-110 ${
            isContactsActive ? 'scale-110' : ''
          }`} />
          <span className="text-[10px] font-medium mt-1">通讯录</span>
        </button>
      </div>

      {/* 开发环境调试入口 */}
      {process.env.NODE_ENV === 'development' && (
        <div className="p-3 border-t border-border/50">
          <button
            onClick={() => navigate('/debug/websocket-test')}
            className={`group relative w-full h-12 flex flex-col items-center justify-center rounded-xl transition-all duration-200 cursor-pointer ${
              isDebugActive 
                ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/25' 
                : 'text-muted-foreground hover:text-foreground hover:bg-background/50'
            }`}
            title="WebSocket 调试工具"
          >
            <Bug className={`h-4 w-4 transition-transform group-hover:scale-110 ${
              isDebugActive ? 'scale-110' : ''
            }`} />
            <span className="text-[9px] font-medium mt-1">调试</span>
          </button>
        </div>
      )}
    </div>
  )
}

export default Sidebar