
import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { PanelLeftClose, PanelLeftOpen } from 'lucide-react'
import { useChatStore } from '@/store/chatStore'
import { useAgentsStore } from '@/store/agentsStore'
import { agentsApi } from '@/api'
import type { Agent } from '@/api'

interface AgentListProps {
  selectedAgentKey: string;
  onAgentChange: (agentKey: string) => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

const AgentList = ({ selectedAgentKey, onAgentChange, isCollapsed = false, onToggleCollapse }: AgentListProps) => {
  const navigate = useNavigate()
  const { setConversationId, setError: setChatError, addHistoryMessages } = useChatStore()
  const { agents: apiAgents, loading, error, hasLoaded, loadAgents } = useAgentsStore()
  
  // 本地显示用的agent数据结构
  interface LocalAgent {
    agent_key: string
    name: string
    message: string
    time: string
    avatar: string
    unreadCount: number
    // 添加API数据引用，用于创建会话
    apiAgent: Agent
  }
  
  const [localAgents, setLocalAgents] = useState<LocalAgent[]>([])
  const [conversationCreatedFor, setConversationCreatedFor] = useState<string | null>(null) // 跟踪已创建会话的agent key

  // 将API返回的Agent数据转换为本地显示格式
  const convertApiAgentToLocal = useCallback((apiAgent: Agent): LocalAgent => {
    console.log('AgentList: 转换API Agent到本地格式:', {
      agent_key: apiAgent.agent_key,
      agent_name: apiAgent.agent_name,
      agent_type: apiAgent.agent_type,
      uuid: apiAgent.uuid
    });
    
    return {
      agent_key: apiAgent.agent_key,
      name: apiAgent.agent_name,
      message: apiAgent.description,
      time: '在线', // API没有返回时间信息，使用默认值
      avatar: apiAgent.agent_key.substring(0, 2).toUpperCase(),
      unreadCount: 0, // 默认无未读消息
      apiAgent: apiAgent // 保存完整的API数据
    }
  }, [])

  // 当 API agents 数据变化时，转换为本地格式
  useEffect(() => {
    if (apiAgents.length > 0) {
      const convertedAgents = apiAgents.map(convertApiAgentToLocal)
      console.log('AgentList: 转换API agents到本地格式:', convertedAgents)
      setLocalAgents(convertedAgents)
      setConversationCreatedFor(null) // 重置会话创建状态
    }
  }, [apiAgents, convertApiAgentToLocal])

  // 创建会话的独立函数
  const createConversationForAgent = async (agentData: LocalAgent, forceCreate = false) => {
    console.log('AgentList: 准备创建会话，agentData:', agentData)

    // 只有agent_type为conversation时才创建会话
    console.log('AgentList: 检查agent_type:', agentData.apiAgent.agent_type)
    
    if (agentData.apiAgent.agent_type !== 'conversation') {
      console.log('AgentList: agent_type不是conversation，跳过创建会话，agent_type:', agentData.apiAgent.agent_type)
      // 如果切换到非conversation类型的agent，清除之前的会话状态
      if (conversationCreatedFor !== null) {
        setConversationId(null)
        setConversationCreatedFor(null)
        console.log('AgentList: 切换到非conversation类型agent，清除会话状态')
      }
      return
    }

    // 检查是否已经为这个agent创建过会话（除非强制创建）
    if (!forceCreate && conversationCreatedFor === agentData.agent_key) {
      console.log('AgentList: 已经为agent', agentData.agent_key, '创建过会话，跳过重复创建')
      return
    }

    try {
      console.log('AgentList: 创建会话，agent_key:', agentData.apiAgent.agent_key, 'agent_uuid:', agentData.apiAgent.uuid, 'agent_type:', agentData.apiAgent.agent_type)
      
      // 并行执行创建会话和获取历史消息
      const [conversationResponse, historyResponse] = await Promise.allSettled([
        agentsApi.createConversation(
          agentData.apiAgent.agent_key,
          agentData.apiAgent.uuid
        ),
        agentsApi.getAgentHistory(agentData.apiAgent.uuid)
      ])
      
      // 处理会话创建结果
      if (conversationResponse.status === 'fulfilled') {
        // 保存conversation_id到store
        setConversationId(conversationResponse.value.conversation_id)
        setConversationCreatedFor(agentData.agent_key) // 标记已为此agent创建会话
        console.log('AgentList: 会话创建成功，conversation_id:', conversationResponse.value.conversation_id, 'for agent:', agentData.agent_key)
      } else {
        console.error('AgentList: 创建会话失败:', conversationResponse.reason)
        setChatError(conversationResponse.reason instanceof Error ? conversationResponse.reason.message : '创建会话失败')
      }
      
      // 处理历史消息获取结果
      if (historyResponse.status === 'fulfilled') {
        console.log('AgentList: 获取历史消息成功，消息数量:', historyResponse.value.data.length)
        // 将历史消息添加到聊天记录中 - 使用uuid作为agentId
        addHistoryMessages(historyResponse.value.data, agentData.apiAgent.uuid)
      } else {
        console.warn('AgentList: 获取历史消息失败:', historyResponse.reason)
        // 历史消息获取失败不影响会话创建，只记录警告
      }
      
    } catch (error) {
      console.error('AgentList: 创建会话或获取历史消息失败:', error)
      setChatError(error instanceof Error ? error.message : '创建会话失败')
    }
  }

  // 组件挂载时确保数据已加载
  useEffect(() => {
    if (!hasLoaded) {
      loadAgents()
    }
  }, [hasLoaded, loadAgents])

  // 当agents加载完成且有selectedAgentKey时，为默认选中的agent创建会话
  useEffect(() => {
    console.log('AgentList: useEffect触发，hasLoaded:', hasLoaded, 'localAgents:', localAgents, 'selectedAgentKey:', selectedAgentKey)
    if (hasLoaded && localAgents.length > 0 && selectedAgentKey) {
      const defaultAgent = localAgents.find(agent => agent.agent_key === selectedAgentKey)
      console.log('AgentList: 找到默认agent:', defaultAgent)
      if (defaultAgent) {
        console.log('AgentList: 准备为默认agent创建会话，agent_type:', defaultAgent.apiAgent.agent_type)
        createConversationForAgent(defaultAgent)
      }
    }
  }, [hasLoaded, localAgents, selectedAgentKey]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleAgentClick = (agentKey: string) => {
    // 清除未读消息
    setLocalAgents(prevAgents => 
      prevAgents.map(agent => 
        agent.agent_key === agentKey 
          ? { ...agent, unreadCount: 0 }
          : agent
      )
    )
    
    // 直接使用 agent_key 作为路由参数
    navigate(`/messages/${agentKey}`)
    
    // 回调通知父组件
    onAgentChange(agentKey)
    console.log('Selected agent:', agentKey)
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
          {localAgents.map((agent) => (
            <div 
              key={agent.agent_key} 
              onClick={() => handleAgentClick(agent.agent_key)}
              className={`flex items-center px-4 py-4 cursor-pointer transition-all duration-200 rounded-xl mb-2 ${
                isCollapsed 
                  ? 'justify-center' 
                  : 'space-x-3'
              } ${
                selectedAgentKey === agent.agent_key 
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
                          selectedAgentKey === agent.agent_key ? 'text-primary' : 'text-foreground'
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
