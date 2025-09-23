import { BarChart3, Brain, TrendingUp, FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'
import MessageInput from './MessageInput'

interface FooterBarProps {
  mode?: 'hr' | 'dataEyes';
  selectedAgent?: number;
  showInput?: boolean;
  showActions?: boolean;
  inputPlaceholder?: string;
}

const FooterBar = ({ 
  mode = 'hr', 
  selectedAgent = 1, 
  showInput = true, 
  showActions = false,
  inputPlaceholder 
}: FooterBarProps) => {
  const getDefaultPlaceholder = () => {
    return mode === 'dataEyes' || selectedAgent === 2 ? "请输入数据分析需求..." : "请输入HR相关问题..."
  }

  const placeholder = inputPlaceholder || getDefaultPlaceholder()

  return (
    <div className="bg-white border-t border-gray-200">
      {/* 输入区域 */}
      {showInput && (
        <div className="p-4">
          {/* 精简的快捷操作 - 仅在同时显示操作和输入时出现 */}
          {showActions && (
            <div className="mb-3">
              <div className="flex items-center space-x-2 mb-2">
                <span className="text-xs text-gray-500">快捷操作:</span>
              </div>
              <div className="flex items-center space-x-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="h-7 px-3 text-xs text-gray-600 border-gray-300 hover:bg-gray-50"
                >
                  <BarChart3 className="h-3 w-3 mr-1" />
                  数据分析
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="h-7 px-3 text-xs text-gray-600 border-gray-300 hover:bg-gray-50"
                >
                  <Brain className="h-3 w-3 mr-1" />
                  智能总结
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="h-7 px-3 text-xs text-gray-600 border-gray-300 hover:bg-gray-50"
                >
                  <TrendingUp className="h-3 w-3 mr-1" />
                  趋势预测
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="h-7 px-3 text-xs text-gray-600 border-gray-300 hover:bg-gray-50"
                >
                  <FileText className="h-3 w-3 mr-1" />
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
        <div className="px-4 py-3">
          <div className="grid grid-cols-4 gap-3">
            <div className="flex flex-col items-center p-3 rounded-lg bg-gray-50 hover:bg-gray-100 cursor-pointer transition-colors">
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center mb-2">
                <BarChart3 className="h-4 w-4 text-white" />
              </div>
              <span className="text-xs text-gray-700 text-center">会话数据分析</span>
              <span className="text-xs text-gray-500 text-center">快速生成，对话内容、多维度分析</span>
            </div>
            
            <div className="flex flex-col items-center p-3 rounded-lg bg-gray-50 hover:bg-gray-100 cursor-pointer transition-colors">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center mb-2">
                <Brain className="h-4 w-4 text-white" />
              </div>
              <span className="text-xs text-gray-700 text-center">智能总结</span>
              <span className="text-xs text-gray-500 text-center">通过算法智能总结对话关键点</span>
            </div>
            
            <div className="flex flex-col items-center p-3 rounded-lg bg-gray-50 hover:bg-gray-100 cursor-pointer transition-colors">
              <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center mb-2">
                <TrendingUp className="h-4 w-4 text-white" />
              </div>
              <span className="text-xs text-gray-700 text-center">趋势预测</span>
              <span className="text-xs text-gray-500 text-center">15分钟高效完成情绪</span>
            </div>
            
            <div className="flex flex-col items-center p-3 rounded-lg bg-gray-50 hover:bg-gray-100 cursor-pointer transition-colors">
              <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center mb-2">
                <FileText className="h-4 w-4 text-white" />
              </div>
              <span className="text-xs text-gray-700 text-center">报告生成</span>
              <span className="text-xs text-gray-500 text-center">飞秒级小时一音频训练</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default FooterBar
