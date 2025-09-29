import { webApiClient } from '../../client'

// Agent配置类型
export interface AgentConfig {
  max_session_duration: number;
  evaluation_enabled: boolean;
  auto_end_timeout: number;
}

// Agent基础类型
export interface Agent {
  agent_key: string;
  agent_name: string;
  agent_type: string;
  description: string;
  capabilities: string[];
  status: 'active' | 'inactive';
  avatar: string;
  uuid: string;
  config: AgentConfig;
}

// 获取Agents列表响应类型
export interface GetAgentsListResponse {
  agents: Agent[];
  total_count: number;
  timestamp: number;
}

// 获取Agent详情响应类型
export type GetAgentDetailResponse = Agent

// 导入会话相关类型
import type { 
  ApiCreateConversationRequest,
  ApiCreateConversationResponse,
  ApiConversationInfo,
  ConversationStatus,
  GetHistoryMessagesResponse
} from '@/types/conversation'

// 重新导出会话相关类型
export type CreateConversationRequest = ApiCreateConversationRequest
export type CreateConversationResponse = ApiCreateConversationResponse
export type { ApiConversationInfo, ConversationStatus, GetHistoryMessagesResponse }

// API端点定义
export const AGENTS_ENDPOINTS = {
  LIST: '/v1/websocket/agents',
  DETAIL: '/v1/agents/{agent_id}',
  CREATE: '/v1/agents',
  UPDATE: '/v1/agents/{agent_id}',
  DELETE: '/v1/agents/{agent_id}',
  CREATE_CONVERSATION: '/v1/websocket/agent/conversation/create',
  GET_HISTORY: '/v1/websocket/agent/history'
} as const;

// Agents业务服务类
export class AgentsService {
  private static pendingRequest: Promise<GetAgentsListResponse> | null = null;

  /**
   * 获取指定用户的AI助手列表
   * @returns Promise<GetAgentsListResponse>
   */
  async getAgentsList(): Promise<GetAgentsListResponse> {
    // 防止重复请求
    if (AgentsService.pendingRequest) {
      console.log('AgentsService: 返回正在进行的请求')
      return AgentsService.pendingRequest;
    }

    try {
      const url = AGENTS_ENDPOINTS.LIST;
      console.log('AgentsService: 发起新的agents请求到:', url);
      
      // 创建请求Promise并缓存
      AgentsService.pendingRequest = this.performRequest(url);
      const result = await AgentsService.pendingRequest;
      
      return result;
    } finally {
      // 请求完成后清除缓存
      AgentsService.pendingRequest = null;
    }
  }

  private async performRequest(url: string): Promise<GetAgentsListResponse> {
    // HTTP客户端现在会自动处理 {code, msg, results} 格式
    // 并返回 results 字段的内容
    const response = await webApiClient.get<GetAgentsListResponse>(url);
    console.log('AgentsService: 收到响应', response);
    
    // 验证响应数据结构
    if (response && typeof response === 'object' && 'agents' in response) {
      return response;
    }
    
    throw new Error('Invalid response format from agents API');
  }

  /**
   * 获取单个Agent的详细信息
   * @param agentId - Agent ID
   * @returns Promise<GetAgentDetailResponse>
   */
  async getAgentDetail(agentId: string): Promise<GetAgentDetailResponse> {
    try {
      const url = AGENTS_ENDPOINTS.DETAIL.replace('{agent_id}', agentId);
      const response = await webApiClient.get<GetAgentDetailResponse>(url);
      
      // 验证响应数据结构
      if (response && typeof response === 'object' && 'agent_key' in response) {
        return response;
      }
      
      throw new Error('Invalid response format from agent detail API');
    } catch (error) {
      console.error(`Failed to get agent detail for ${agentId}:`, error);
      throw error;
    }
  }

  /**
   * 创建新的Agent（预留接口）
   * @param agentData - Agent创建数据
   * @returns Promise<Agent>
   */
  async createAgent(agentData: Omit<Agent, 'uuid'>): Promise<Agent> {
    try {
      const response = await webApiClient.post<Agent>(
        AGENTS_ENDPOINTS.CREATE,
        agentData
      );
      
      // 验证响应数据结构
      if (response && typeof response === 'object' && 'agent_key' in response) {
        return response;
      }
      
      throw new Error('Invalid response format from create agent API');
    } catch (error) {
      console.error('Failed to create agent:', error);
      throw error;
    }
  }

  /**
   * 更新Agent信息（预留接口）
   * @param agentId - Agent ID
   * @param updateData - 更新数据
   * @returns Promise<Agent>
   */
  async updateAgent(agentId: string, updateData: Partial<Agent>): Promise<Agent> {
    try {
      const url = AGENTS_ENDPOINTS.UPDATE.replace('{agent_id}', agentId);
      const response = await webApiClient.put<Agent>(url, updateData);
      
      // 验证响应数据结构
      if (response && typeof response === 'object' && 'agent_key' in response) {
        return response;
      }
      
      throw new Error('Invalid response format from update agent API');
    } catch (error) {
      console.error(`Failed to update agent ${agentId}:`, error);
      throw error;
    }
  }

  /**
   * 删除Agent（预留接口）
   * @param agentId - Agent ID
   * @returns Promise<boolean>
   */
  async deleteAgent(agentId: string): Promise<boolean> {
    try {
      const url = AGENTS_ENDPOINTS.DELETE.replace('{agent_id}', agentId);
      await webApiClient.delete<void>(url);
      return true;
    } catch (error) {
      console.error(`Failed to delete agent ${agentId}:`, error);
      throw error;
    }
  }

  /**
   * 创建与指定Agent的会话
   * @param agentKey - Agent的key
   * @param agentUuid - Agent的UUID
   * @returns Promise<CreateConversationResponse>
   */
  async createConversation(agentKey: string, agentUuid: string): Promise<CreateConversationResponse> {
    try {
      const requestData: CreateConversationRequest = {
        agent_key: agentKey,
        agent_uuid: agentUuid
      };
      
      console.log('AgentsService: 创建会话请求:', requestData);
      
      const response = await webApiClient.post<CreateConversationResponse>(
        AGENTS_ENDPOINTS.CREATE_CONVERSATION,
        requestData
      );
      
      console.log('AgentsService: 创建会话成功:', response);
      
      // 验证响应数据结构
      if (response && typeof response === 'object' && 'conversation_id' in response) {
        return response;
      }
      
      throw new Error('Invalid response format from create conversation API');
    } catch (error) {
      console.error('Failed to create conversation:', error);
      throw error;
    }
  }

  /**
   * 获取Agent的历史消息
   * @param agentUuid - Agent的UUID
   * @returns Promise<GetHistoryMessagesResponse>
   */
  async getAgentHistory(agentUuid: string): Promise<GetHistoryMessagesResponse> {
    try {
      console.log('AgentsService: 获取历史消息，agent_uuid:', agentUuid);
      
      const response = await webApiClient.get<GetHistoryMessagesResponse>(
        AGENTS_ENDPOINTS.GET_HISTORY,
        {
          params: {
            agent_uuid: agentUuid
          }
        }
      );
      
      console.log('AgentsService: 获取历史消息成功:', response);
      
      // 验证响应数据结构
      if (response && typeof response === 'object' && 'data' in response && Array.isArray(response.data)) {
        return response;
      }
      
      throw new Error('Invalid response format from get history API');
    } catch (error) {
      console.error('Failed to get agent history:', error);
      throw error;
    }
  }
}

// 创建并导出agents服务实例
export const agentsService = new AgentsService();

// 导出便捷的API方法
export const agentsApi = {
  getAgentsList: () => agentsService.getAgentsList(),
  getAgentDetail: (agentId: string) => agentsService.getAgentDetail(agentId),
  createAgent: (agentData: Omit<Agent, 'uuid'>) => agentsService.createAgent(agentData),
  updateAgent: (agentId: string, updateData: Partial<Agent>) => 
    agentsService.updateAgent(agentId, updateData),
  deleteAgent: (agentId: string) => agentsService.deleteAgent(agentId),
  createConversation: (agentKey: string, agentUuid: string) => 
    agentsService.createConversation(agentKey, agentUuid),
  getAgentHistory: (agentUuid: string) => 
    agentsService.getAgentHistory(agentUuid)
};

// 默认导出
export default agentsApi;
