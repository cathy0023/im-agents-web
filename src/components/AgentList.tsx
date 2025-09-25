
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getAgentById } from '../types/router'
import { Badge } from '@/components/ui/badge'

interface AgentListProps {
  selectedAgent: number;
  onAgentChange: (agentId: number) => void;
  isCollapsed?: boolean;
}

const AgentList = ({ selectedAgent, onAgentChange, isCollapsed = false }: AgentListProps) => {
  const navigate = useNavigate()
  
  const [agents, setAgents] = useState([
    { 
      id: 1, 
      name: 'HR', 
      message: '当然，我可以为专业和友好的深度采访客户的人力资源相关问题，请随时提出您的问题，无论是关于招聘策略、薪酬福利、员工培训还是相关政策问题，我都会尽力为您提供帮助。请问您今天有需要咨询的内容？', 
      time: '昨天', 
      avatar: 'HR',
      unreadCount: 0
    },
    { 
      id: 2, 
      name: 'DataEyes', 
      message: '纯数据分析专家', 
      time: '10:30', 
      avatar: 'DE',
      unreadCount: 2
    },
    { 
      id: 3, 
      name: '心理测评师小王', 
      message: '专注心理测评与咨询服务', 
      time: '09:15', 
      avatar: 'XW',
      unreadCount: 0
    }
  ])

  const handleAgentClick = (agentId: number) => {
    // 清除未读消息
    setAgents(prevAgents => 
      prevAgents.map(agent => 
        agent.id === agentId 
          ? { ...agent, unreadCount: 0 }
          : agent
      )
    )
    
    // 使用路由导航替代回调
    const agent = getAgentById(agentId)
    if (agent) {
      navigate(agent.route)
    }
    // 保持向后兼容
    onAgentChange(agentId)
    console.log('Selected agent:', agentId)
  }

  return (
    <div className={`bg-background border-r border-border/50 flex flex-col h-full transition-all duration-300 ${
      isCollapsed ? 'w-16' : 'w-80'
    }`}>
      {/* Agent列表 */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-2">
          {agents.map((agent) => (
            <div 
              key={agent.id} 
              onClick={() => handleAgentClick(agent.id)}
              className={`flex items-center px-3 py-3 cursor-pointer transition-colors ${
                isCollapsed 
                  ? 'justify-center' 
                  : 'space-x-3'
              } ${
                selectedAgent === agent.id 
                  ? 'bg-primary/10 rounded-lg' 
                  : 'hover:bg-muted/30'
              }`}
              title={isCollapsed ? `${agent.name} - ${agent.message}` : ''}
            >
              {/* 头像 */}
              <div className="flex-shrink-0 relative">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/80 to-primary flex items-center justify-center">
                  <span className="text-primary-foreground text-sm font-medium">
                    {agent.avatar}
                  </span>
                </div>
                {/* Badge 消息提醒 - 位于头像右上角 */}
                {agent.unreadCount > 0 && (
                  <Badge 
                    variant="destructive" 
                    className="absolute -top-1 -right-1 h-5 min-w-5 flex items-center justify-center p-0 text-xs text-white"
                  >
                    {agent.unreadCount > 99 ? '99+' : agent.unreadCount}
                  </Badge>
                )}
              </div>
              
              {/* 内容区域 */}
              {!isCollapsed && (
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className={`text-sm font-medium truncate ${
                          selectedAgent === agent.id ? 'text-primary' : 'text-foreground'
                        }`}>
                          {agent.name}
                        </h3>
                        <span className="text-xs text-muted-foreground ml-2">
                          {agent.time}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground truncate leading-tight">
                        {agent.message}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default AgentList
