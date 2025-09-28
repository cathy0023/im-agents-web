import { X, Settings, HelpCircle } from 'lucide-react'
// 暂时未使用: User, Bell, Shield
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

interface SettingsPanelProps {
  isVisible?: boolean;
  onClose?: () => void;
}

const SettingsPanel = ({ isVisible = true, onClose }: SettingsPanelProps) => {
  if (!isVisible) return null;

  return (
    <div className="w-[400px] bg-muted/8 backdrop-blur-sm flex flex-col h-full" style={{
      borderLeft: '1px solid hsl(var(--border) / 0.2)',
      marginLeft: '1px' // 避免边框重叠
    }}>
      {/* 标题栏 */}
      <div className="h-16 flex items-center justify-between px-6 bg-background/40 border-b border-border/10">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-xl bg-primary/10">
            <Settings className="h-5 w-5 text-primary" />
          </div>
          <h3 className="text-lg font-semibold text-foreground">设置</h3>
        </div>
        {onClose && (
          <Button variant="ghost" size="icon" onClick={onClose} className="rounded-xl hover:bg-accent/50">
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* 内容区域 */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* 用户信息 */}
        <Card className="p-6 bg-card/50 backdrop-blur-sm border-0 shadow-sm rounded-2xl">
          <div className="flex items-center space-x-4">
            <div className="h-14 w-14 bg-gradient-to-br from-primary to-primary/80 rounded-2xl flex items-center justify-center shadow-sm">
              <span className="text-primary-foreground text-lg font-medium">李</span>
            </div>
            <div>
              <p className="font-semibold text-foreground">假勤</p>
              <p className="text-sm text-muted-foreground">机器人</p>
              <p className="text-xs text-muted-foreground/70 leading-relaxed">原「打卡」应用，实现高效考勤管理</p>
            </div>
          </div>
        </Card>

        {/* 标签设置 */}
        <Card className="p-6 bg-card/50 backdrop-blur-sm border-0 shadow-sm rounded-2xl">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-semibold text-foreground">标签</h4>
            <Button variant="ghost" size="sm" className="text-primary rounded-xl hover:bg-primary/10">
              添加标签
            </Button>
          </div>
          <div className="space-y-3">
            <label className="flex items-center space-x-3 cursor-pointer">
              <input type="checkbox" className="rounded-md" />
              <span className="text-sm text-foreground">消息免打扰</span>
            </label>
            <label className="flex items-center space-x-3 cursor-pointer">
              <input type="checkbox" className="rounded-md" />
              <span className="text-sm text-foreground">置顶会话</span>
            </label>
            <label className="flex items-center space-x-3 cursor-pointer">
              <input type="checkbox" className="rounded-md" />
              <span className="text-sm text-foreground">添加到标记</span>
            </label>
          </div>
        </Card>

        {/* 翻译助手 */}
        <Card className="p-6 bg-card/50 backdrop-blur-sm border-0 shadow-sm rounded-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <span className="font-semibold text-foreground">翻译助手</span>
            </div>
            <Button variant="ghost" size="sm" className="rounded-xl hover:bg-accent/50">
              <HelpCircle className="h-4 w-4" />
            </Button>
          </div>
        </Card>

        {/* 清空聊天记录 */}
        <Card className="p-6 bg-card/50 backdrop-blur-sm border-0 shadow-sm rounded-2xl">
          <Button variant="ghost" className="w-full justify-start text-foreground rounded-xl hover:bg-accent/50">
            <HelpCircle className="h-4 w-4 mr-2" />
            清空聊天记录
          </Button>
        </Card>

        {/* 举报 */}
        <div className="pt-2">
          <Button variant="ghost" className="w-full text-destructive hover:text-destructive hover:bg-destructive/10 rounded-xl">
            举报
          </Button>
        </div>
      </div>
    </div>
  )
}

export default SettingsPanel
