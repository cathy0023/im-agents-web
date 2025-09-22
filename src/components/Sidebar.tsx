import { MessageCircle, BarChart3 } from 'lucide-react'

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
        <button 
          onClick={() => handleTabChange('hr')}
          className={`w-full flex items-center space-x-2 p-3 rounded-lg transition-colors cursor-pointer ${
            activeTab === 'hr' 
              ? 'bg-blue-50 hover:bg-blue-100' 
              : 'hover:bg-gray-50'
          }`}
          style={{ minHeight: '44px' }}
        >
          <MessageCircle className={`h-5 w-5 ${
            activeTab === 'hr' ? 'text-blue-600' : 'text-gray-400'
          }`} />
          <span className={`text-sm ${
            activeTab === 'hr' ? 'text-blue-600 font-medium' : 'text-gray-400'
          }`}>HR</span>
        </button>
        <button 
          onClick={() => handleTabChange('dataEyes')}
          className={`w-full flex items-center space-x-2 p-3 rounded-lg transition-colors cursor-pointer ${
            activeTab === 'dataEyes' 
              ? 'bg-blue-50 hover:bg-blue-100' 
              : 'hover:bg-gray-50'
          }`}
          style={{ minHeight: '44px' }}
        >
          <BarChart3 className={`h-5 w-5 ${
            activeTab === 'dataEyes' ? 'text-blue-600' : 'text-gray-400'
          }`} />
          <span className={`text-sm ${
            activeTab === 'dataEyes' ? 'text-blue-600 font-medium' : 'text-gray-400'
          }`}>dataEyes</span>
        </button>
      </div>

    </div>
  )
}

export default Sidebar
