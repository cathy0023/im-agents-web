import { X, Settings, User, Bell, Shield, HelpCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

interface SettingsPanelProps {
  isVisible?: boolean;
  onClose?: () => void;
}

const SettingsPanel = ({ isVisible = true, onClose }: SettingsPanelProps) => {
  if (!isVisible) return null;

  return (
    <div className="w-[400px] bg-white border-l border-gray-200 flex flex-col h-full">
      {/* 标题栏 */}
      <div className="h-12 border-b border-gray-200 flex items-center justify-between px-4">
        <div className="flex items-center space-x-2">
          <Settings className="h-5 w-5 text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-900">设置</h3>
        </div>
        {onClose && (
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* 内容区域 */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* 用户信息 */}
        <Card className="p-4">
          <div className="flex items-center space-x-3">
            <div className="h-12 w-12 bg-primary rounded-full flex items-center justify-center">
              <span className="text-primary-foreground text-lg font-medium">李</span>
            </div>
            <div>
              <p className="font-medium text-gray-900">假勤</p>
              <p className="text-sm text-gray-500">机器人</p>
              <p className="text-xs text-gray-400">原「打卡」应用，实现高效考勤管理</p>
            </div>
          </div>
        </Card>

        {/* 标签设置 */}
        <Card className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-medium text-gray-900">标签</h4>
            <Button variant="ghost" size="sm" className="text-blue-600">
              添加标签
            </Button>
          </div>
          <div className="space-y-2">
            <label className="flex items-center space-x-2">
              <input type="checkbox" className="rounded" />
              <span className="text-sm text-gray-700">消息免打扰</span>
            </label>
            <label className="flex items-center space-x-2">
              <input type="checkbox" className="rounded" />
              <span className="text-sm text-gray-700">置顶会话</span>
            </label>
            <label className="flex items-center space-x-2">
              <input type="checkbox" className="rounded" />
              <span className="text-sm text-gray-700">添加到标记</span>
            </label>
          </div>
        </Card>

        {/* 翻译助手 */}
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="font-medium text-gray-900">翻译助手</span>
            </div>
            <Button variant="ghost" size="sm">
              <HelpCircle className="h-4 w-4" />
            </Button>
          </div>
        </Card>

        {/* 清空聊天记录 */}
        <Card className="p-4">
          <Button variant="ghost" className="w-full justify-start text-gray-700">
            <HelpCircle className="h-4 w-4 mr-2" />
            清空聊天记录
          </Button>
        </Card>

        {/* 举报 */}
        <div className="pt-4 border-t border-gray-200">
          <Button variant="ghost" className="w-full text-red-600 hover:text-red-700 hover:bg-red-50">
            举报
          </Button>
        </div>
      </div>
    </div>
  )
}

export default SettingsPanel
