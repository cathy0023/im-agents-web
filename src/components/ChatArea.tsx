import React, { useRef, useEffect } from 'react';
import { useChatStore } from '../store/chatStore';
import { useAgentsStore } from '../store/agentsStore';

interface ChatAreaProps {
  selectedAgent?: string;
}

const ChatArea = ({ selectedAgent = '' }: ChatAreaProps) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const { messages, setSelectedAgent, isLoadingHistory } = useChatStore();

  // 当selectedAgent变化时更新store - 使用 ref 防止无限循环
  const prevSelectedAgentRef = useRef<string | undefined>(undefined);
  useEffect(() => {
    if (prevSelectedAgentRef.current !== selectedAgent) {
      setSelectedAgent(selectedAgent);
      prevSelectedAgentRef.current = selectedAgent;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedAgent]); // 只依赖 selectedAgent，避免 setSelectedAgent 引用变化导致的无限循环

  // 自动滚动到底部
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // 过滤当前选中代理的消息
  const filteredMessages = React.useMemo(() => {
    return messages.filter(msg => msg.agentId === selectedAgent);
  }, [messages, selectedAgent]);

  // 当消息变化时自动滚动到底部
  useEffect(() => {
    scrollToBottom();
  }, [filteredMessages]);

  // 格式化时间
  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('zh-CN', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  // 获取 agents 数据
  const { agents } = useAgentsStore();

  // 获取发送者名称
  const getSenderName = (role: string, agentId?: string) => {
    if (role === 'user') {
      return '用户';
    }
    
    if (!agentId) {
      return 'AI助手';
    }
    
    // 根据 agentId (UUID) 查找对应的 agent 名称
    const agent = agents.find(a => a.uuid === agentId);
    return agent ? agent.agent_name : 'AI助手';
  };


  return (
    <div className="h-full bg-background flex flex-col">
      {/* 对话消息列表 */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {/* 历史消息加载状态 */}
        {isLoadingHistory && (
          <div className="flex justify-center items-center py-8">
            <div className="flex items-center space-x-2 text-muted-foreground">
              <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
              </svg>
              <span className="text-sm">加载历史消息...</span>
            </div>
          </div>
        )}

        {/* 聊天消息 */}
        {filteredMessages.map((message) => {
          // 系统消息（日期分隔符）的特殊处理
          if (message.role === 'system') {
            return (
              <div key={message.id} className="flex justify-center my-6">
                <span className="text-xs px-4 py-1.5 bg-background text-muted-foreground font-medium whitespace-nowrap">
                  {message.content}
                </span>
              </div>
            );
          }

          // 普通消息的处理
          return (
            <div key={message.id} className={`flex ${message.role === 'assistant' ? 'justify-start' : 'justify-end'} group`}>
              <div className={`max-w-[70%] ${message.role === 'assistant' ? 'mr-auto' : 'ml-auto'}`}>
                <div className={`py-2 px-3 rounded-2xl shadow-sm backdrop-blur-sm ${
                  message.role === 'assistant'
                    ? 'bg-muted/30 text-foreground' 
                    : 'bg-primary/90 text-primary-foreground'
                }`}>
                  {/* 如果是loading状态（内容为空且isStreaming为true），显示loading占位符 */}
                  {message.isStreaming && !message.content ? (
                    <div className="flex items-center space-x-2 py-1">
                      <svg className="animate-spin w-4 h-4 text-muted-foreground" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                      </svg>
                      <span className="text-sm text-muted-foreground">正在思考中...</span>
                    </div>
                  ) : (
                    <p className="text-sm whitespace-pre-wrap leading-relaxed">
                      {message.content}
                    </p>
                  )}
                </div>
                {/* 发送方和时间信息：预留空间，默认透明，hover时显示 */}
                <div className={`flex items-center mt-1.5 px-1 h-5 transition-opacity duration-200 gap-1 ${
                  message.isStreaming ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                } ${message.role === 'user' ? 'flex-row-reverse' : ''}`}>
                  <span className="text-xs text-muted-foreground font-medium">
                    {getSenderName(message.role, message.agentId)}
                  </span>
                  <span className="text-xs text-muted-foreground/60">
                    {formatTime(message.timestamp)}
                  </span>
                </div>
              </div>
            </div>
          );
        })}

        {/* 滚动锚点 */}
        <div ref={messagesEndRef} />
      </div>
    </div>
  )
}

export default ChatArea
