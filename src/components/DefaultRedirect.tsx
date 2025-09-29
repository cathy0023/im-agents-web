import React, { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAgentsStore } from '@/store/agentsStore';

const DefaultRedirect = () => {
  const { agents, loading, hasLoaded, loadAgents, getDefaultAgent } = useAgentsStore();

  useEffect(() => {
    // 如果还没有加载过，则加载agents
    if (!hasLoaded) {
      loadAgents();
    }
  }, [hasLoaded, loadAgents]);

  if (loading || !hasLoaded) {
    return (
      <div className="flex-1 flex items-center justify-center bg-background">
        <div className="text-muted-foreground">加载中...</div>
      </div>
    );
  }

  const defaultAgent = getDefaultAgent();
  
  if (!defaultAgent) {
    return (
      <div className="flex-1 flex items-center justify-center bg-background">
        <div className="text-destructive">无法加载智能体</div>
      </div>
    );
  }

  console.log('DefaultRedirect: 重定向到默认agent:', defaultAgent.agent_key);
  return <Navigate to={`/messages/${defaultAgent.agent_key}`} replace />;
};

export default DefaultRedirect;
