import { MessageCircle, BarChart3 } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface SidebarProps {
  activeTab: 'hr' | 'dataEyes';
  onTabChange: (tab: 'hr' | 'dataEyes') => void;
}

const Sidebar = ({ activeTab, onTabChange }: SidebarProps) => {
  const handleTabChange = (tab: 'hr' | 'dataEyes') => {
    console.log('Switching to tab:', tab)
    onTabChange(tab)
  }

  return (
    <div className="w-24 bg-white border-r border-gray-200 flex flex-col h-full">
      {/* 功能导航 */}
      <div className="p-3 flex flex-col space-y-1">
        <Button 
          variant="outline"
          onClick={() => handleTabChange('hr')}
          className={`w-full h-14 flex flex-col items-center justify-center py-2 px-1 text-xs rounded-lg transition-colors border-0 ${
            activeTab === 'hr' 
              ? 'bg-blue-50 text-blue-600 hover:bg-blue-100 hover:text-blue-600' 
              : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
          }`}
        >
          <MessageCircle className="h-4 w-4" />
          <span className="mt-0.5">消息</span>
        </Button>
        
        <Button 
          variant="outline"
          onClick={() => handleTabChange('dataEyes')}
          className={`w-full h-14 flex flex-col items-center justify-center py-2 px-1 text-xs rounded-lg transition-colors border-0 ${
            activeTab === 'dataEyes' 
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