import { BarChart3, TrendingUp, Users, DollarSign } from 'lucide-react'
import { Card } from '@/components/ui/card'

const ChartArea = () => {
  return (
    <div className="h-full bg-muted/30 p-4 border-l border-border overflow-y-auto">
      <div className="min-h-full flex flex-col space-y-4 pb-6">
        <h3 className="text-lg font-semibold text-foreground">数据分析</h3>
        
        {/* 统计卡片 */}
        <div className="grid grid-cols-2 gap-4">
          <Card className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">在线用户</p>
                <p className="text-2xl font-bold text-foreground">1,234</p>
              </div>
            </div>
          </Card>
          
          <Card className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <TrendingUp className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">转化率</p>
                <p className="text-2xl font-bold text-foreground">23.5%</p>
              </div>
            </div>
          </Card>
          
          <Card className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <DollarSign className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">月收入</p>
                <p className="text-2xl font-bold text-foreground">¥158K</p>
              </div>
            </div>
          </Card>
          
          <Card className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <BarChart3 className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">活跃度</p>
                <p className="text-2xl font-bold text-foreground">89.2%</p>
              </div>
            </div>
          </Card>
        </div>
        
        {/* 详细数据表格 */}
        <Card className="p-4">
          <h4 className="text-md font-semibold text-foreground mb-3">用户行为分析</h4>
          <div className="space-y-3">
            <div className="flex justify-between items-center py-2 border-b border-border">
              <span className="text-sm text-muted-foreground">页面浏览量</span>
              <span className="text-sm font-medium">45,320</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-border">
              <span className="text-sm text-muted-foreground">独立访客</span>
              <span className="text-sm font-medium">12,456</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-border">
              <span className="text-sm text-muted-foreground">平均停留时间</span>
              <span className="text-sm font-medium">5分32秒</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-border">
              <span className="text-sm text-muted-foreground">跳出率</span>
              <span className="text-sm font-medium">32.1%</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-border">
              <span className="text-sm text-muted-foreground">新用户比例</span>
              <span className="text-sm font-medium">68.5%</span>
            </div>
          </div>
        </Card>
        
        {/* 趋势图表 */}
        <Card className="p-4">
          <h4 className="text-md font-semibold text-foreground mb-3">7天趋势</h4>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">2024-01-15</span>
              <div className="flex-1 mx-3 bg-muted rounded-full h-2">
                <div className="bg-primary h-2 rounded-full" style={{width: '78%'}}></div>
              </div>
              <span className="text-xs text-muted-foreground">78%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">2024-01-16</span>
              <div className="flex-1 mx-3 bg-muted rounded-full h-2">
                <div className="bg-primary h-2 rounded-full" style={{width: '85%'}}></div>
              </div>
              <span className="text-xs text-muted-foreground">85%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">2024-01-17</span>
              <div className="flex-1 mx-3 bg-muted rounded-full h-2">
                <div className="bg-primary h-2 rounded-full" style={{width: '92%'}}></div>
              </div>
              <span className="text-xs text-muted-foreground">92%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">2024-01-18</span>
              <div className="flex-1 mx-3 bg-muted rounded-full h-2">
                <div className="bg-primary h-2 rounded-full" style={{width: '74%'}}></div>
              </div>
              <span className="text-xs text-muted-foreground">74%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">2024-01-19</span>
              <div className="flex-1 mx-3 bg-muted rounded-full h-2">
                <div className="bg-primary h-2 rounded-full" style={{width: '89%'}}></div>
              </div>
              <span className="text-xs text-muted-foreground">89%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">2024-01-20</span>
              <div className="flex-1 mx-3 bg-muted rounded-full h-2">
                <div className="bg-primary h-2 rounded-full" style={{width: '96%'}}></div>
              </div>
              <span className="text-xs text-muted-foreground">96%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">2024-01-21</span>
              <div className="flex-1 mx-3 bg-muted rounded-full h-2">
                <div className="bg-primary h-2 rounded-full" style={{width: '83%'}}></div>
              </div>
              <span className="text-xs text-muted-foreground">83%</span>
            </div>
          </div>
        </Card>
        
        {/* 设备分析 */}
        <Card className="p-4">
          <h4 className="text-md font-semibold text-foreground mb-3">设备分析</h4>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">移动设备</span>
              <div className="flex items-center space-x-2">
                <div className="w-20 bg-muted rounded-full h-2">
                  <div className="bg-green-500 h-2 rounded-full" style={{width: '68%'}}></div>
                </div>
                <span className="text-sm font-medium">68%</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">桌面设备</span>
              <div className="flex items-center space-x-2">
                <div className="w-20 bg-muted rounded-full h-2">
                  <div className="bg-primary h-2 rounded-full" style={{width: '28%'}}></div>
                </div>
                <span className="text-sm font-medium">28%</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">平板设备</span>
              <div className="flex items-center space-x-2">
                <div className="w-20 bg-muted rounded-full h-2">
                  <div className="bg-purple-500 h-2 rounded-full" style={{width: '4%'}}></div>
                </div>
                <span className="text-sm font-medium">4%</span>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}

export default ChartArea
