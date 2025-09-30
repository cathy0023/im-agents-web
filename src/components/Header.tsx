import { BarChart4, Settings } from 'lucide-react'
import { Button } from '@/components/ui/button'
import ThemeToggle from './ThemeToggle'
import WebSocketStatus from './WebSocketStatus'

const Header = () => {
  return (
    <header className="h-14 bg-muted/30 border-b border-border/50 flex items-center px-6 justify-between backdrop-blur-sm">
      {/* 左侧品牌区域 */}
      <div className="flex items-center">
        <div className="flex items-center space-x-3">
          <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center">
            <BarChart4 className="h-4 w-4 text-primary-foreground" />
          </div>
          {/* <div className="hidden md:block">
            <h1 className="text-base font-semibold text-foreground">IM Agents</h1>
            <p className="text-xs text-muted-foreground">智能助手平台</p>
          </div> */}
        </div>
      </div>
      
      {/* 中间区域 - WebSocket状态 */}
      <div className="flex-1 flex items-center justify-center max-w-md mx-8">
        <WebSocketStatus />
      </div>
      
      {/* 右侧操作按钮 */}
      <div className="flex items-center space-x-2">
        <ThemeToggle />
        <Button variant="ghost" size="icon" className="h-9 w-9 rounded-lg">
          <Settings className="h-4 w-4" />
        </Button>
        <div className="h-9 w-9 bg-primary rounded-lg flex items-center justify-center ml-2">
          <span className="text-primary-foreground text-sm font-medium">李</span>
        </div>
      </div>
    </header>
  )
}

export default Header
