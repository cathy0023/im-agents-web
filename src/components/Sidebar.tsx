import { MessageCircle, BarChart3 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useNavigate, useLocation } from 'react-router-dom'
import { getDefaultAgent } from '../types/router'

interface SidebarProps {
  activeTab?: 'messages' | 'analysis';
  onTabChange?: (tab: 'messages' | 'analysis') => void;
}

const Sidebar = ({ onTabChange }: SidebarProps) => {
  const navigate = useNavigate()
  const location = useLocation()

  // 从当前路径判断活跃状态
  const isMessagesActive = location.pathname.startsWith('/messages')
  const isAnalysisActive = location.pathname.startsWith('/analysis')

  const handleTabChange = (tab: 'messages' | 'analysis') => {
    console.log('Switching to tab:', tab)
    
    // 路由导航
    if (tab === 'messages') {
      // 导航到默认智能体
      const defaultAgent = getDefaultAgent()
      navigate(defaultAgent.route)
    } else if (tab === 'analysis') {
      navigate('/analysis')
    }
    
    // 保持向后兼容
    if (onTabChange) {
      onTabChange(tab)
    }
  }

  return (
    <div className="w-24 bg-white border-r border-gray-200 flex flex-col h-full">
      {/* 功能导航 */}
      <div className="p-3 flex flex-col space-y-1">
        <Button 
          variant="outline"
          onClick={() => handleTabChange('messages')}
          className={`w-full h-14 flex flex-col items-center justify-center py-2 px-1 text-xs rounded-lg transition-colors border-0 ${
            isMessagesActive 
              ? 'bg-blue-50 text-blue-600 hover:bg-blue-100 hover:text-blue-600' 
              : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
          }`}
        >
          <MessageCircle className="h-4 w-4" />
          <span className="mt-0.5">消息</span>
        </Button>
        
        <Button 
          variant="outline"
          onClick={() => handleTabChange('analysis')}
          className={`w-full h-14 flex flex-col items-center justify-center py-2 px-1 text-xs rounded-lg transition-colors border-0 ${
            isAnalysisActive 
              ? 'bg-blue-50 text-blue-600 hover:bg-blue-100 hover:text-blue-600' 
              : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
          }`}
        >
          <BarChart3 className="h-4 w-4" />
          <span className="mt-0.5">分析</span>
        </Button>
      </div>
    </div>
  )
}

export default Sidebar