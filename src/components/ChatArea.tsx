import { useEffect, useRef } from 'react';
import { useChatStore, AGENT_CONFIGS } from '../store/chatStore';

interface ChatAreaProps {
  selectedAgent?: number;
}

const ChatArea = ({ selectedAgent = 1 }: ChatAreaProps) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const { 
    messages, 
    setSelectedAgent,
  } = useChatStore();

  // 当selectedAgent变化时更新store
  useEffect(() => {
    setSelectedAgent(selectedAgent);
  }, [selectedAgent, setSelectedAgent]);

  // 自动滚动到底部
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // 格式化时间
  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('zh-CN', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  // 获取发送者名称
  const getSenderName = (role: string, agentId?: number) => {
    if (role === 'user') {
      return '用户';
    }
    
    if (!agentId) {
      return 'AI助手';
    }
    
    const agentConfig = AGENT_CONFIGS[agentId as keyof typeof AGENT_CONFIGS];
    return agentConfig?.name || 'AI助手';
  };

  // 过滤当前agent的消息（只显示与当前agent相关的对话）
  const currentMessages = messages.filter(msg => 
    msg.agentId === selectedAgent
  );

  // 检查是否有AI回复内容
  const hasAiResponse = currentMessages.some(msg => 
    msg.role === 'assistant' && msg.content.trim().length > 0
  );

  // 当没有AI回复时显示欢迎信息
  const showWelcome = !hasAiResponse;

  const getWelcomeMessage = () => {
    const agentConfig = AGENT_CONFIGS[selectedAgent as keyof typeof AGENT_CONFIGS];
    if (!agentConfig) {
      return '您好！我是AI助手，很高兴为您服务！';
    }
    return `您好！我是${agentConfig.name}，${agentConfig.systemPrompt.split('，')[1] || '很高兴为您服务！'}`;
  }

  return (
    <div className="h-full bg-background flex flex-col">
      {/* 对话消息列表 */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* 欢迎消息 */}
        {showWelcome && (
          <div className="flex justify-start">
            <div className="max-w-[70%] mr-auto">
              <div className="p-3 rounded-lg bg-muted text-foreground">
                <p className="text-sm whitespace-pre-wrap">{getWelcomeMessage()}</p>
              </div>
              <div className="flex items-center mt-1 space-x-2">
                <span className="text-xs text-muted-foreground">
                  {getSenderName('assistant', selectedAgent)}
                </span>
                <span className="text-xs text-muted-foreground/70">刚刚</span>
              </div>
            </div>
          </div>
        )}

        {/* 聊天消息 */}
        {currentMessages.map((message) => (
          <div key={message.id} className={`flex ${message.role === 'assistant' ? 'justify-start' : 'justify-end'}`}>
            <div className={`max-w-[70%] ${message.role === 'assistant' ? 'mr-auto' : 'ml-auto'}`}>
              <div className={`p-3 rounded-lg ${
                message.role === 'assistant'
                  ? 'bg-muted text-foreground' 
                  : 'bg-primary text-primary-foreground'
              }`}>
                <p className="text-sm whitespace-pre-wrap">
                  {message.content}
                  {/* 流式输出时显示光标 */}
                  {message.isStreaming && (
                    <span className="inline-block w-2 h-4 ml-1 bg-muted-foreground animate-pulse" />
                  )}
                </p>
              </div>
              <div className="flex items-center mt-1 space-x-2">
                <span className="text-xs text-muted-foreground">
                  {getSenderName(message.role, message.agentId)}
                </span>
                <span className="text-xs text-muted-foreground/70">
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
        ))}

        {/* 滚动锚点 */}
        <div ref={messagesEndRef} />
      </div>
    </div>
  )
}

export default ChatArea
