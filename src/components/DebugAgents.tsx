import React, { useState, useEffect } from 'react';
import { agentsApi } from '@/api';
import type { Agent } from '@/api';

const DebugAgents = () => {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadAgents = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('DebugAgents: 开始请求agents列表');
      const response = await agentsApi.getAgentsList();
      console.log('DebugAgents: API响应:', response);
      
      setAgents(response.agents);
    } catch (err) {
      console.error('DebugAgents: 请求失败:', err);
      setError(err instanceof Error ? err.message : '请求失败');
    } finally {
      setLoading(false);
    }
  };

  const testCreateConversation = async (agent: Agent) => {
    try {
      console.log('DebugAgents: 测试创建会话，agent:', agent);
      const response = await agentsApi.createConversation(agent.agent_key, agent.uuid);
      console.log('DebugAgents: 创建会话成功:', response);
    } catch (err) {
      console.error('DebugAgents: 创建会话失败:', err);
    }
  };

  const testGetHistory = async (agent: Agent) => {
    try {
      console.log('DebugAgents: 测试获取历史消息，agent:', agent);
      const response = await agentsApi.getAgentHistory(agent.uuid);
      console.log('DebugAgents: 获取历史消息成功:', response);
    } catch (err) {
      console.error('DebugAgents: 获取历史消息失败:', err);
    }
  };

  useEffect(() => {
    loadAgents();
  }, []);

  return (
    <div className="p-6 bg-background text-foreground">
      <h1 className="text-2xl font-bold mb-4">Debug Agents API</h1>
      
      <button 
        onClick={loadAgents}
        disabled={loading}
        className="mb-4 px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90 disabled:opacity-50"
      >
        {loading ? '加载中...' : '重新加载 Agents'}
      </button>

      {error && (
        <div className="mb-4 p-3 bg-destructive/10 text-destructive border border-destructive/20 rounded">
          错误: {error}
        </div>
      )}

      <div className="space-y-4">
        {agents.map((agent, index) => (
          <div key={agent.uuid} className="p-4 border border-border rounded-lg bg-card">
            <h3 className="text-lg font-semibold mb-2">{agent.agent_name}</h3>
            <div className="grid grid-cols-2 gap-2 text-sm mb-3">
              <div><strong>Agent Key:</strong> {agent.agent_key}</div>
              <div><strong>Agent Type:</strong> <span className="font-mono bg-muted px-2 py-1 rounded">{agent.agent_type}</span></div>
              <div><strong>UUID:</strong> {agent.uuid}</div>
              <div><strong>Status:</strong> {agent.status}</div>
            </div>
            <div className="mb-3">
              <strong>Description:</strong> {agent.description}
            </div>
            <div className="mb-3">
              <strong>Capabilities:</strong> {agent.capabilities.join(', ')}
            </div>
            
            <div className="flex space-x-2">
              <button 
                onClick={() => testCreateConversation(agent)}
                className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
              >
                测试创建会话
              </button>
              <button 
                onClick={() => testGetHistory(agent)}
                className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 text-sm"
              >
                测试获取历史
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DebugAgents;
