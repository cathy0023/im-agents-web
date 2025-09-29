
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getAgentById } from '../types/router'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { PanelLeftClose, PanelLeftOpen } from 'lucide-react'
import { agentsApi } from '@/api'
import type { Agent } from '@/api'

interface AgentListProps {
  selectedAgent: number;
  onAgentChange: (agentId: number) => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

const AgentList = ({ selectedAgent, onAgentChange, isCollapsed = false, onToggleCollapse }: AgentListProps) => {
  const navigate = useNavigate()
  
  // 本地显示用的agent数据结构
  interface LocalAgent {
    id: number
    name: string
    message: string
    time: string
    avatar: string
    unreadCount: number
  }
  
  const [agents, setAgents] = useState<LocalAgent[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hasLoaded, setHasLoaded] = useState(false) // 防止重复加载

  // 将API返回的Agent数据转换为本地显示格式
  const convertApiAgentToLocal = (apiAgent: Agent, index: number): LocalAgent => {
    return {
      id: index + 1, // 临时使用索引作为ID，实际应该使用API返回的唯一标识
      name: apiAgent.agent_name,
      message: apiAgent.description,
      time: '在线', // API没有返回时间信息，使用默认值
      avatar: apiAgent.agent_key.substring(0, 2).toUpperCase(),
      unreadCount: 0 // 默认无未读消息
    }
  }

  // 加载agents数据
  const loadAgents = async () => {
    // 防止重复请求
    if (hasLoaded || loading) {
      console.log('AgentList: 跳过重复请求，hasLoaded:', hasLoaded, 'loading:', loading)
      return
    }

    try {
      setLoading(true)
      setError(null)
      
      console.log('AgentList: 开始请求agents列表')
      const response = await agentsApi.getAgentsList()
      const localAgents = response.agents.map(convertApiAgentToLocal)
      
      setAgents(localAgents)
      setHasLoaded(true) // 标记已加载
      console.log('AgentList: 成功加载agents列表:', response.agents.length, '个助手')
    } catch (err) {
      console.error('AgentList: 加载agents列表失败:', err)
      setError(err instanceof Error ? err.message : '加载失败')
      
      // 发生错误时使用默认数据
      setAgents([
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
      setHasLoaded(true) // 即使失败也标记为已加载，避免无限重试
    } finally {
      setLoading(false)
    }
  }

  // 组件挂载时加载数据
  useEffect(() => {
    loadAgents()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

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
    <div className={`bg-muted/20 flex flex-col h-full transition-all duration-300 ${
      isCollapsed ? 'w-16' : 'w-80'
    }`} style={{ 
      borderRight: isCollapsed ? 'none' : '1px solid hsl(var(--border) / 0.3)' 
    }}>
      {/* Agent列表头部 */}
      <div className="bg-muted/30 backdrop-blur-sm">
        {/* 折叠按钮 - 始终显示 */}
        <div className="p-4 flex justify-between items-center">
          {!isCollapsed && <h2 className="text-lg font-semibold text-foreground">消息</h2>}
          {onToggleCollapse && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onToggleCollapse}
              className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-accent/50"
              title={isCollapsed ? "展开助手列表" : "收起助手列表"}
            >
              {isCollapsed ? <PanelLeftOpen className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
            </Button>
          )}
        </div>
      </div>
      
      {/* Agent列表 */}
      <div className="flex-1 overflow-y-auto">
        <div className="px-2 py-1">
          {/* 加载状态 */}
          {loading && !isCollapsed && (
            <div className="flex items-center justify-center py-8">
              <div className="text-muted-foreground text-sm">加载中...</div>
            </div>
          )}
          
          {/* 错误状态 */}
          {error && !loading && !isCollapsed && (
            <div className="px-4 py-2 mb-2 bg-destructive/10 text-destructive text-sm rounded-lg">
              加载失败: {error}
            </div>
          )}
          
          {/* Agent列表 */}
          {agents.map((agent) => (
            <div 
              key={agent.id} 
              onClick={() => handleAgentClick(agent.id)}
              className={`flex items-center px-4 py-4 cursor-pointer transition-all duration-200 rounded-xl mb-2 ${
                isCollapsed 
                  ? 'justify-center' 
                  : 'space-x-3'
              } ${
                selectedAgent === agent.id 
                  ? 'bg-background/80 shadow-sm ring-1 ring-primary/20' 
                  : 'hover:bg-background/40 hover:shadow-sm'
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
