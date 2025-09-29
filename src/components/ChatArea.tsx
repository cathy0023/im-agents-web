import React, { useRef, useEffect } from 'react';
import { useChatStore } from '../store/chatStore';

interface ChatAreaProps {
  selectedAgent?: string;
}

const ChatArea = ({ selectedAgent = '' }: ChatAreaProps) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const { messages, setSelectedAgent } = useChatStore();

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

  // 获取发送者名称
  const getSenderName = (role: string, agentId?: string) => {
    if (role === 'user') {
      return '用户';
    }
    
    if (!agentId) {
      return 'AI助手';
    }
    
    // 简化处理，直接返回 AI助手，因为现在使用 UUID 而不是数字 ID
    return 'AI助手';
  };

  // 检查是否有AI回复内容
  const hasAiResponse = filteredMessages.some(msg => 
    msg.role === 'assistant' && msg.content.trim().length > 0
  );
  
  // 当没有AI回复时显示欢迎信息
  const showWelcome = !hasAiResponse;

  const getWelcomeMessage = () => {
    // 简化欢迎消息，因为现在使用 UUID
    return '您好！我是AI助手，很高兴为您服务！';
  }

  return (
    <div className="h-full bg-background flex flex-col">
      {/* 对话消息列表 */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* 欢迎消息 */}
        {showWelcome && (
          <div className="flex justify-start">
            <div className="max-w-[70%] mr-auto">
              <div className="p-4 rounded-2xl bg-muted/30 text-foreground shadow-sm backdrop-blur-sm">
                <p className="text-sm whitespace-pre-wrap leading-relaxed">{getWelcomeMessage()}</p>
              </div>
              <div className="flex items-center mt-2 space-x-2 px-1">
                <span className="text-xs text-muted-foreground font-medium">
                  {getSenderName('assistant', selectedAgent)}
                </span>
                <span className="text-xs text-muted-foreground/60">刚刚</span>
              </div>
            </div>
          </div>
        )}

        {/* 聊天消息 */}
        {filteredMessages.map((message) => {
          // 系统消息（分割线）的特殊处理
          if (message.role === 'system') {
            return (
              <div key={message.id} className="flex justify-center my-8">
                <div className="flex items-center w-full max-w-md">
                  <div className="flex-1 h-px bg-gradient-to-r from-transparent via-border to-border"></div>
                  <span className="text-xs px-4 py-1.5 bg-background border border-border rounded-full text-muted-foreground font-medium whitespace-nowrap shadow-sm">
                    {message.content}
                  </span>
                  <div className="flex-1 h-px bg-gradient-to-l from-transparent via-border to-border"></div>
                </div>
              </div>
            );
          }

          // 普通消息的处理
          return (
            <div key={message.id} className={`flex ${message.role === 'assistant' ? 'justify-start' : 'justify-end'}`}>
              <div className={`max-w-[70%] ${message.role === 'assistant' ? 'mr-auto' : 'ml-auto'}`}>
                <div className={`p-4 rounded-2xl shadow-sm backdrop-blur-sm ${
                  message.role === 'assistant'
                    ? 'bg-muted/30 text-foreground' 
                    : 'bg-primary/90 text-primary-foreground'
                }`}>
                  <p className="text-sm whitespace-pre-wrap leading-relaxed">
                    {message.content}
                    {/* 流式输出时显示光标 */}
                    {message.isStreaming && (
                      <span className="inline-block w-2 h-4 ml-1 bg-muted-foreground animate-pulse rounded-sm" />
                    )}
                  </p>
                </div>
                <div className="flex items-center mt-2 space-x-2 px-1">
                  <span className="text-xs text-muted-foreground font-medium">
                    {getSenderName(message.role, message.agentId)}
                  </span>
                  <span className="text-xs text-muted-foreground/60">
                    {formatTime(message.timestamp)}
                  </span>
                  {/* 显示流式状态 */}
                  {message.isStreaming && (
                    <span className="text-xs text-primary flex items-center">
                      <svg className="animate-spin w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                      </svg>
                      正在输入...
                    </span>
                  )}
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
