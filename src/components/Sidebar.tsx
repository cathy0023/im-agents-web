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
    <div className="w-36 bg-white border-r border-gray-200 flex flex-col h-full">
      {/* 左侧功能导航 */}
      <div className="p-3 flex flex-col space-y-4 mt-4">
        <Button 
          variant={activeTab === 'hr' ? 'secondary' : 'ghost'}
          onClick={() => handleTabChange('hr')}
          className="w-full justify-start space-x-2 h-11"
        >
          <MessageCircle className="h-5 w-5" />
          <span className="text-sm">消息</span>
        </Button>
        <Button 
          variant={activeTab === 'dataEyes' ? 'secondary' : 'ghost'}
          onClick={() => handleTabChange('dataEyes')}
          className="w-full justify-start space-x-2 h-11"
        >
          <BarChart3 className="h-5 w-5" />
          <span className="text-sm">BI</span>
        </Button>
      </div>

    </div>
  )
}

export default Sidebar
