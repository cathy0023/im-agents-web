import { create } from 'zustand';
import { agentsApi } from '@/api';
import type { Agent } from '@/api';

interface AgentsState {
  // 状态
  agents: Agent[];
  loading: boolean;
  error: string | null;
  hasLoaded: boolean;
  
  // 操作方法
  loadAgents: () => Promise<void>;
  getAgentByKey: (agentKey: string) => Agent | null;
  getDefaultAgent: () => Agent | null;
  clearError: () => void;
}

// 创建 agents store
export const useAgentsStore = create<AgentsState>((set, get) => ({
  // 初始状态
  agents: [],
  loading: false,
  error: null,
  hasLoaded: false,

  // 加载 agents 数据
  loadAgents: async () => {
    const state = get();
    
    // 防止重复请求
    if (state.loading || state.hasLoaded) {
      console.log('AgentsStore: 跳过重复请求，loading:', state.loading, 'hasLoaded:', state.hasLoaded);
      return;
    }

    try {
      set({ loading: true, error: null });
      console.log('AgentsStore: 开始加载agents列表');
      
      const response = await agentsApi.getAgentsList();
      console.log('AgentsStore: 加载成功，agents数量:', response.agents.length);
      
      set({ 
        agents: response.agents,
        loading: false,
        hasLoaded: true,
        error: null
      });
    } catch (error) {
      console.error('AgentsStore: 加载agents失败:', error);
      set({ 
        loading: false,
        error: error instanceof Error ? error.message : '加载失败',
        // 即使失败也标记为已加载，避免无限重试
        hasLoaded: true
      });
    }
  },

  // 根据 agent_key 获取 agent
  getAgentByKey: (agentKey: string) => {
    const state = get();
    return state.agents.find(agent => agent.agent_key === agentKey) || null;
  },

  // 获取默认 agent（第一个）
  getDefaultAgent: () => {
    const state = get();
    return state.agents.length > 0 ? state.agents[0] : null;
  },

  // 清除错误
  clearError: () => {
    set({ error: null });
  }
}));
