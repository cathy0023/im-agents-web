import React from 'react'
import { cn } from '@/lib/utils'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { BookOpen, MessageCircle, Globe, Award } from 'lucide-react'

interface TrainingAgent {
  id: number
  name: string
  description: string
  scenario: string
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  avatar: string
  bgColor: string
  icon: React.ElementType
  tags: string[]
}

interface TrainingAgentListProps {
  selectedAgent: number
  onAgentChange: (agentId: number) => void
  isCollapsed?: boolean
}

// 对练场景的Agent配置
const TRAINING_AGENTS: TrainingAgent[] = [
  {
    id: 4,
    name: 'Dr. Chen',
    description: '心理测评师',
    scenario: '青少年学习焦虑咨询',
    difficulty: 'intermediate',
    avatar: 'DC',
    bgColor: 'from-blue-500 to-blue-600',
    icon: BookOpen,
    tags: ['心理咨询', '对练训练', '专业指导']
  },
  {
    id: 5,
    name: 'Prof. Johnson',
    description: '英语口语考官',
    scenario: '雅思口语考试模拟',
    difficulty: 'advanced',
    avatar: 'PJ',
    bgColor: 'from-green-500 to-green-600',
    icon: Globe,
    tags: ['雅思考试', '口语测评', '英语对练']
  }
]

const TrainingAgentList: React.FC<TrainingAgentListProps> = ({ 
  selectedAgent, 
  onAgentChange, 
  isCollapsed = false 
}) => {
  const handleAgentClick = (agentId: number) => {
    onAgentChange(agentId)
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-700 border-green-200'
      case 'intermediate': return 'bg-yellow-100 text-yellow-700 border-yellow-200'
      case 'advanced': return 'bg-red-100 text-red-700 border-red-200'
      default: return 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }

  const getDifficultyText = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return '初级'
      case 'intermediate': return '中级'
      case 'advanced': return '高级'
      default: return '未知'
    }
  }

  return (
    <div className={cn(
      "bg-white border-r border-gray-200 flex flex-col h-full transition-all duration-300",
      isCollapsed ? 'w-16' : 'w-80'
    )}>
      {/* 标题 */}
      {!isCollapsed && (
        <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-blue-50">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <Award className="h-5 w-5 mr-2 text-purple-600" />
            对练训练场景
          </h3>
          <p className="text-sm text-gray-600 mt-1">选择您要练习的场景类型</p>
        </div>
      )}

      {/* Agent列表 */}
      <div className="flex-1 overflow-y-auto">
        <div className="py-3 px-2 space-y-3">
          {TRAINING_AGENTS.map((agent) => {
            const IconComponent = agent.icon
            const isSelected = selectedAgent === agent.id
            
            return (
              <div 
                key={agent.id} 
                onClick={() => handleAgentClick(agent.id)}
                className={cn(
                  "rounded-lg cursor-pointer transition-all duration-200 border",
                  isCollapsed ? 'p-2 justify-center' : 'p-4',
                  isSelected 
                    ? 'bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200 shadow-md' 
                    : 'hover:bg-gray-50 border-gray-200 hover:border-gray-300'
                )}
                title={isCollapsed ? `${agent.name} - ${agent.description}` : ''}
              >
                {isCollapsed ? (
                  // 折叠状态：只显示头像
                  <div className="flex flex-col items-center space-y-1">
                    <Avatar className="h-10 w-10 border-2 border-white shadow-sm">
                      <AvatarFallback className={cn(
                        "bg-gradient-to-br text-white font-semibold text-sm",
                        agent.bgColor
                      )}>
                        {agent.avatar}
                      </AvatarFallback>
                    </Avatar>
                    <div className="w-2 h-2 rounded-full bg-green-400" />
                  </div>
                ) : (
                  // 展开状态：完整信息
                  <div className="space-y-3">
                    {/* 头部信息 */}
                    <div className="flex items-start space-x-3">
                      <Avatar className="h-12 w-12 border-2 border-white shadow-sm flex-shrink-0">
                        <AvatarFallback className={cn(
                          "bg-gradient-to-br text-white font-semibold",
                          agent.bgColor
                        )}>
                          {agent.avatar}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h4 className={cn(
                            "text-sm font-semibold truncate",
                            isSelected ? 'text-purple-900' : 'text-gray-900'
                          )}>
                            {agent.name}
                          </h4>
                          <Badge className={getDifficultyColor(agent.difficulty)}>
                            {getDifficultyText(agent.difficulty)}
                          </Badge>
                        </div>
                        
                        <p className={cn(
                          "text-sm font-medium truncate mt-1",
                          isSelected ? 'text-purple-700' : 'text-gray-700'
                        )}>
                          {agent.description}
                        </p>
                      </div>
                    </div>

                    {/* 场景描述 */}
                    <div className={cn(
                      "p-3 rounded-lg border",
                      isSelected 
                        ? 'bg-white border-purple-200' 
                        : 'bg-gray-50 border-gray-200'
                    )}>
                      <div className="flex items-center space-x-2 mb-2">
                        <IconComponent className={cn(
                          "h-4 w-4",
                          isSelected ? 'text-purple-600' : 'text-gray-600'
                        )} />
                        <span className={cn(
                          "text-xs font-medium",
                          isSelected ? 'text-purple-700' : 'text-gray-600'
                        )}>
                          训练场景
                        </span>
                      </div>
                      <p className={cn(
                        "text-xs leading-relaxed",
                        isSelected ? 'text-purple-800' : 'text-gray-700'
                      )}>
                        {agent.scenario}
                      </p>
                    </div>

                    {/* 标签 */}
                    <div className="flex flex-wrap gap-1">
                      {agent.tags.map((tag, index) => (
                        <Badge 
                          key={index}
                          variant="outline"
                          className={cn(
                            "text-xs px-2 py-0.5",
                            isSelected 
                              ? 'border-purple-300 text-purple-700 bg-purple-50' 
                              : 'border-gray-300 text-gray-600 bg-gray-50'
                          )}
                        >
                          {tag}
                        </Badge>
                      ))}
                    </div>

                    {/* 状态指示 */}
                    <div className="flex items-center justify-between pt-2 border-t border-gray-200">
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-green-400 rounded-full" />
                        <span className="text-xs text-gray-600">可用</span>
                      </div>
                      <div className="flex items-center space-x-1 text-xs text-gray-500">
                        <MessageCircle className="h-3 w-3" />
                        <span>实时对练</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* 底部提示 */}
      {!isCollapsed && (
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <div className="text-xs text-gray-600 leading-relaxed">
            💡 <strong>提示：</strong>每个训练场景都有专门的AI教练，会根据您的表现提供个性化的指导和反馈。
          </div>
        </div>
      )}
    </div>
  )
}

export default TrainingAgentList
