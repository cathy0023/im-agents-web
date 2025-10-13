import { BarChart3, Brain, TrendingUp, FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { MessageInput } from '@/components/chat'

interface FooterBarProps {
  mode?: 'hr' | 'dataEyes';
  selectedAgent?: string;
  showInput?: boolean;
  showActions?: boolean;
  inputPlaceholder?: string;
}

const FooterBar = ({ 
  mode = 'hr', 
  selectedAgent: _selectedAgent = '', 
  showInput = true, 
  showActions = false,
  inputPlaceholder 
}: FooterBarProps) => {
  const getDefaultPlaceholder = () => {
    return mode === 'dataEyes' ? "请输入数据分析需求..." : "请输入HR相关问题..."
  }

  const placeholder = inputPlaceholder || getDefaultPlaceholder()

  return (
    <div className="bg-muted/5 backdrop-blur-sm">
      {/* 输入区域 */}
      {showInput && (
        <div className="p-6">
          {/* 精简的快捷操作 - 仅在同时显示操作和输入时出现 */}
          {showActions && (
            <div className="mb-4">
              <div className="flex items-center space-x-2 mb-3">
                <span className="text-xs text-muted-foreground font-medium">快捷操作:</span>
              </div>
              <div className="flex items-center space-x-3">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="h-8 px-4 text-xs text-muted-foreground border-0 bg-muted/30 hover:bg-accent/50 rounded-xl"
                >
                  <BarChart3 className="h-3 w-3 mr-2" />
                  数据分析
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="h-8 px-4 text-xs text-muted-foreground border-0 bg-muted/30 hover:bg-accent/50 rounded-xl"
                >
                  <Brain className="h-3 w-3 mr-2" />
                  智能总结
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="h-8 px-4 text-xs text-muted-foreground border-0 bg-muted/30 hover:bg-accent/50 rounded-xl"
                >
                  <TrendingUp className="h-3 w-3 mr-2" />
                  趋势预测
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="h-8 px-4 text-xs text-muted-foreground border-0 bg-muted/30 hover:bg-accent/50 rounded-xl"
                >
                  <FileText className="h-3 w-3 mr-2" />
                  报告生成
                </Button>
              </div>
            </div>
          )}
          
          <MessageInput placeholder={placeholder} />
        </div>
      )}

      {/* 独立的操作区域 - 仅在只显示操作时出现 */}
      {showActions && !showInput && (
        <div className="px-6 py-4">
          <div className="grid grid-cols-4 gap-4">
            <div className="flex flex-col items-center p-4 rounded-2xl bg-muted/30 hover:bg-accent/50 cursor-pointer transition-all duration-200 backdrop-blur-sm">
              <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center mb-3 shadow-sm">
                <BarChart3 className="h-5 w-5 text-white" />
              </div>
              <span className="text-xs text-foreground text-center font-medium mb-1">会话数据分析</span>
              <span className="text-xs text-muted-foreground text-center leading-relaxed">快速生成，对话内容、多维度分析</span>
            </div>
            
            <div className="flex flex-col items-center p-4 rounded-2xl bg-muted/30 hover:bg-accent/50 cursor-pointer transition-all duration-200 backdrop-blur-sm">
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary/80 rounded-2xl flex items-center justify-center mb-3 shadow-sm">
                <Brain className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="text-xs text-foreground text-center font-medium mb-1">智能总结</span>
              <span className="text-xs text-muted-foreground text-center leading-relaxed">通过算法智能总结对话关键点</span>
            </div>
            
            <div className="flex flex-col items-center p-4 rounded-2xl bg-muted/30 hover:bg-accent/50 cursor-pointer transition-all duration-200 backdrop-blur-sm">
              <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center mb-3 shadow-sm">
                <TrendingUp className="h-5 w-5 text-white" />
              </div>
              <span className="text-xs text-foreground text-center font-medium mb-1">趋势预测</span>
              <span className="text-xs text-muted-foreground text-center leading-relaxed">15分钟高效完成情绪</span>
            </div>
            
            <div className="flex flex-col items-center p-4 rounded-2xl bg-muted/30 hover:bg-accent/50 cursor-pointer transition-all duration-200 backdrop-blur-sm">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mb-3 shadow-sm">
                <FileText className="h-5 w-5 text-white" />
              </div>
              <span className="text-xs text-foreground text-center font-medium mb-1">报告生成</span>
              <span className="text-xs text-muted-foreground text-center leading-relaxed">飞秒级小时一音频训练</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default FooterBar
