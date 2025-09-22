import { Search, BarChart4, Settings } from 'lucide-react'

const Header = () => {
  return (
    <header className="h-12 bg-gray-50 border-b border-gray-200 flex items-center px-4 justify-between">
      {/* 左侧图标 */}
      <div className="flex items-center">
        <BarChart4 className="h-5 w-5 text-blue-600 mr-2" />
      </div>
      
      {/* 中间搜索框 */}
      <div className="flex-1 max-w-md mx-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="搜索客户、会话、或者话术文本"
            className="w-full pl-10 pr-4 py-2 text-sm bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>
      
      {/* 右侧操作按钮 */}
      <div className="flex items-center space-x-3">
        <button className="p-2 hover:bg-gray-100 rounded-lg">
          <Settings className="h-5 w-5 text-gray-600" />
        </button>
        <div className="h-8 w-8 bg-blue-600 rounded-full flex items-center justify-center">
          <span className="text-white text-sm font-medium">李</span>
        </div>
      </div>
    </header>
  )
}

export default Header
