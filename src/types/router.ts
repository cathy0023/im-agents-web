// 路由相关类型定义

// 智能体信息接口
export interface Agent {
  id: number
  name: string
  title: string
  route: string
}

// 路由参数接口
export interface RouteParams {
  agentType?: string
}

// 导航标签类型
export type NavigationTab = 'messages' | 'analysis' | 'contacts'

// 智能体类型
export type AgentType = 'hr' | 'dataEyes' | 'assistant'

// 智能体配置
export const AGENTS: Record<AgentType, Agent> = {
  hr: {
    id: 1,
    name: 'hr',
    title: 'HR',
    route: '/messages/hr'
  },
  dataEyes: {
    id: 2,
    name: 'dataEyes',
    title: 'DataEyes',
    route: '/messages/dataEyes'
  },
  assistant: {
    id: 3,
    name: 'assistant',
    title: '心理测评师小王',
    route: '/messages/assistant'
  }
}

// 根据路由获取智能体信息
export const getAgentByRoute = (agentType: string): Agent | null => {
  const agent = AGENTS[agentType as AgentType]
  return agent || null
}

// 根据ID获取智能体信息
export const getAgentById = (id: number): Agent | null => {
  return Object.values(AGENTS).find(agent => agent.id === id) || null
}

// 获取默认智能体（HR智能助手）
export const getDefaultAgent = (): Agent => {
  return AGENTS.hr
}
