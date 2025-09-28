import { BarChart3, TrendingUp, Users, DollarSign } from 'lucide-react'
import { Card } from '@/components/ui/card'

const ChartArea = () => {
  return (
    <div className="h-full bg-muted/15 p-6 overflow-y-auto" style={{
      borderLeft: '1px solid hsl(var(--border) / 0.2)',
      marginLeft: '1px' // 避免边框重叠
    }}>
      <div className="min-h-full flex flex-col space-y-6 pb-6">
        <div className="flex items-center space-x-3">
          <div className="w-2 h-6 bg-gradient-to-b from-primary to-primary/60 rounded-full"></div>
          <h3 className="text-xl font-semibold text-foreground">数据分析</h3>
        </div>
        
        {/* 统计卡片 */}
        <div className="grid grid-cols-2 gap-6">
          <Card className="p-6 bg-card/50 backdrop-blur-sm border-0 shadow-sm rounded-2xl">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-primary/10 rounded-2xl">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground font-medium">在线用户</p>
                <p className="text-2xl font-bold text-foreground">1,234</p>
              </div>
            </div>
          </Card>
          
          <Card className="p-6 bg-card/50 backdrop-blur-sm border-0 shadow-sm rounded-2xl">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-green-500/10 rounded-2xl">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground font-medium">转化率</p>
                <p className="text-2xl font-bold text-foreground">23.5%</p>
              </div>
            </div>
          </Card>
          
          <Card className="p-6 bg-card/50 backdrop-blur-sm border-0 shadow-sm rounded-2xl">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-purple-500/10 rounded-2xl">
                <DollarSign className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground font-medium">月收入</p>
                <p className="text-2xl font-bold text-foreground">¥158K</p>
              </div>
            </div>
          </Card>
          
          <Card className="p-6 bg-card/50 backdrop-blur-sm border-0 shadow-sm rounded-2xl">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-orange-500/10 rounded-2xl">
                <BarChart3 className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground font-medium">活跃度</p>
                <p className="text-2xl font-bold text-foreground">89.2%</p>
              </div>
            </div>
          </Card>
        </div>
        
        {/* 详细数据表格 */}
        <Card className="p-6 bg-card/50 backdrop-blur-sm border-0 shadow-sm rounded-2xl">
          <h4 className="text-lg font-semibold text-foreground mb-4">用户行为分析</h4>
          <div className="space-y-4">
            <div className="flex justify-between items-center py-3 px-2 rounded-xl hover:bg-muted/20 transition-colors">
              <span className="text-sm text-muted-foreground font-medium">页面浏览量</span>
              <span className="text-sm font-semibold text-foreground">45,320</span>
            </div>
            <div className="flex justify-between items-center py-3 px-2 rounded-xl hover:bg-muted/20 transition-colors">
              <span className="text-sm text-muted-foreground font-medium">独立访客</span>
              <span className="text-sm font-semibold text-foreground">12,456</span>
            </div>
            <div className="flex justify-between items-center py-3 px-2 rounded-xl hover:bg-muted/20 transition-colors">
              <span className="text-sm text-muted-foreground font-medium">平均停留时间</span>
              <span className="text-sm font-semibold text-foreground">5分32秒</span>
            </div>
            <div className="flex justify-between items-center py-3 px-2 rounded-xl hover:bg-muted/20 transition-colors">
              <span className="text-sm text-muted-foreground font-medium">跳出率</span>
              <span className="text-sm font-semibold text-foreground">32.1%</span>
            </div>
            <div className="flex justify-between items-center py-3 px-2 rounded-xl hover:bg-muted/20 transition-colors">
              <span className="text-sm text-muted-foreground font-medium">新用户比例</span>
              <span className="text-sm font-semibold text-foreground">68.5%</span>
            </div>
          </div>
        </Card>
        
        {/* 趋势图表 */}
        <Card className="p-6 bg-card/50 backdrop-blur-sm border-0 shadow-sm rounded-2xl">
          <h4 className="text-lg font-semibold text-foreground mb-4">7天趋势</h4>
          <div className="space-y-3">
            <div className="flex items-center justify-between py-1">
              <span className="text-xs text-muted-foreground font-medium">2024-01-15</span>
              <div className="flex-1 mx-4 bg-muted/50 rounded-full h-3">
                <div className="bg-gradient-to-r from-primary to-primary/80 h-3 rounded-full shadow-sm" style={{width: '78%'}}></div>
              </div>
              <span className="text-xs text-foreground font-semibold">78%</span>
            </div>
            <div className="flex items-center justify-between py-1">
              <span className="text-xs text-muted-foreground font-medium">2024-01-16</span>
              <div className="flex-1 mx-4 bg-muted/50 rounded-full h-3">
                <div className="bg-gradient-to-r from-primary to-primary/80 h-3 rounded-full shadow-sm" style={{width: '85%'}}></div>
              </div>
              <span className="text-xs text-foreground font-semibold">85%</span>
            </div>
            <div className="flex items-center justify-between py-1">
              <span className="text-xs text-muted-foreground font-medium">2024-01-17</span>
              <div className="flex-1 mx-4 bg-muted/50 rounded-full h-3">
                <div className="bg-gradient-to-r from-primary to-primary/80 h-3 rounded-full shadow-sm" style={{width: '92%'}}></div>
              </div>
              <span className="text-xs text-foreground font-semibold">92%</span>
            </div>
            <div className="flex items-center justify-between py-1">
              <span className="text-xs text-muted-foreground font-medium">2024-01-18</span>
              <div className="flex-1 mx-4 bg-muted/50 rounded-full h-3">
                <div className="bg-gradient-to-r from-primary to-primary/80 h-3 rounded-full shadow-sm" style={{width: '74%'}}></div>
              </div>
              <span className="text-xs text-foreground font-semibold">74%</span>
            </div>
            <div className="flex items-center justify-between py-1">
              <span className="text-xs text-muted-foreground font-medium">2024-01-19</span>
              <div className="flex-1 mx-4 bg-muted/50 rounded-full h-3">
                <div className="bg-gradient-to-r from-primary to-primary/80 h-3 rounded-full shadow-sm" style={{width: '89%'}}></div>
              </div>
              <span className="text-xs text-foreground font-semibold">89%</span>
            </div>
            <div className="flex items-center justify-between py-1">
              <span className="text-xs text-muted-foreground font-medium">2024-01-20</span>
              <div className="flex-1 mx-4 bg-muted/50 rounded-full h-3">
                <div className="bg-gradient-to-r from-primary to-primary/80 h-3 rounded-full shadow-sm" style={{width: '96%'}}></div>
              </div>
              <span className="text-xs text-foreground font-semibold">96%</span>
            </div>
            <div className="flex items-center justify-between py-1">
              <span className="text-xs text-muted-foreground font-medium">2024-01-21</span>
              <div className="flex-1 mx-4 bg-muted/50 rounded-full h-3">
                <div className="bg-gradient-to-r from-primary to-primary/80 h-3 rounded-full shadow-sm" style={{width: '83%'}}></div>
              </div>
              <span className="text-xs text-foreground font-semibold">83%</span>
            </div>
          </div>
        </Card>
        
        {/* 设备分析 */}
        <Card className="p-6 bg-card/50 backdrop-blur-sm border-0 shadow-sm rounded-2xl">
          <h4 className="text-lg font-semibold text-foreground mb-4">设备分析</h4>
          <div className="space-y-4">
            <div className="flex items-center justify-between py-2">
              <span className="text-sm text-muted-foreground font-medium">移动设备</span>
              <div className="flex items-center space-x-3">
                <div className="w-24 bg-muted/50 rounded-full h-3">
                  <div className="bg-gradient-to-r from-green-500 to-green-600 h-3 rounded-full shadow-sm" style={{width: '68%'}}></div>
                </div>
                <span className="text-sm font-semibold text-foreground">68%</span>
              </div>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-sm text-muted-foreground font-medium">桌面设备</span>
              <div className="flex items-center space-x-3">
                <div className="w-24 bg-muted/50 rounded-full h-3">
                  <div className="bg-gradient-to-r from-primary to-primary/80 h-3 rounded-full shadow-sm" style={{width: '28%'}}></div>
                </div>
                <span className="text-sm font-semibold text-foreground">28%</span>
              </div>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-sm text-muted-foreground font-medium">平板设备</span>
              <div className="flex items-center space-x-3">
                <div className="w-24 bg-muted/50 rounded-full h-3">
                  <div className="bg-gradient-to-r from-purple-500 to-purple-600 h-3 rounded-full shadow-sm" style={{width: '4%'}}></div>
                </div>
                <span className="text-sm font-semibold text-foreground">4%</span>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}

export default ChartArea
