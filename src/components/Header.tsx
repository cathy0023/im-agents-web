import { BarChart4, Settings } from 'lucide-react'
import { Button } from '@/components/ui/button'

const Header = () => {
  return (
    <header className="h-12 bg-gray-50 border-b border-gray-200 flex items-center px-4 justify-between">
      {/* 左侧图标 */}
      <div className="flex items-center">
        <BarChart4 className="h-5 w-5 text-blue-600 mr-2" />
      </div>
      
      {/* 中间标题区域 */}
      <div className="flex-1 flex items-center justify-center">
        <h1 className="text-lg font-semibold text-gray-900">IM智能代理</h1>
      </div>
      
      {/* 右侧操作按钮 */}
      <div className="flex items-center space-x-3">
        <Button variant="ghost" size="icon">
          <Settings className="h-5 w-5" />
        </Button>
        <div className="h-8 w-8 bg-primary rounded-full flex items-center justify-center">
          <span className="text-primary-foreground text-sm font-medium">李</span>
        </div>
      </div>
    </header>
  )
}

export default Header
