import React, { useRef, useEffect } from 'react';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Send } from 'lucide-react';
import { useChatStore } from '../store/chatStore';
import { useWebSocketConnection } from '../store/websocketStore';

interface MessageInputProps {
  className?: string;
  placeholder?: string;
}

const MessageInput = ({ className = '', placeholder }: MessageInputProps) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  // 获取 WebSocket 连接状态（不需要在这里调用 useEnsureWebSocketConnected，MessageLayout 已经调用了）
  const { isConnected, connectionStatus } = useWebSocketConnection();
  
  const {
    currentMessage,
    isLoading,
    isStreaming,
    error,
    setCurrentMessage,
    sendMessage,
    stopStreaming,
    setError,
  } = useChatStore();

  // 自动调整textarea高度
  const adjustTextareaHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      const scrollHeight = Math.min(textarea.scrollHeight, 120); // 最大高度120px
      textarea.style.height = `${scrollHeight}px`;
    }
  };

  // 当消息内容变化时调整高度
  useEffect(() => {
    adjustTextareaHeight();
  }, [currentMessage]);

  // 处理发送消息
  const handleSend = async () => {
    if (!currentMessage.trim() || isLoading) {
      return;
    }
    
    try {
      await sendMessage();
      // 发送成功后重置textarea高度
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    } catch (error) {
      console.error('发送消息失败:', error);
      setError('消息发送失败');
    }
  };

  // 处理键盘事件
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Ctrl/Cmd + Enter 发送消息
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      handleSend();
      return;
    }
    
    // Enter 发送消息（非Shift+Enter）
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
      return;
    }
  };

  // 处理输入变化
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setCurrentMessage(e.target.value);
    // 清除错误信息
    if (error) {
      setError(null);
    }
  };

  // 处理停止按钮
  const handleStop = () => {
    stopStreaming();
  };

  const defaultPlaceholder = isStreaming ? "AI正在思考中..." : "输入消息...";
  const finalPlaceholder = placeholder || defaultPlaceholder;

  // 获取连接状态提示
  const getConnectionHint = () => {
    if (connectionStatus === 'connecting') {
      return { text: '正在连接...', color: 'text-amber-600' };
    }
    if (connectionStatus === 'reconnecting') {
      return { text: '正在重连...', color: 'text-blue-600' };
    }
    if (!isConnected) {
      return { text: 'WebSocket未连接，请稍候', color: 'text-destructive' };
    }
    return null;
  };

  const connectionHint = getConnectionHint();

  return (
    <div className="space-y-3">
      {/* 错误信息或连接状态显示 */}
      {(error || connectionHint) && (
        <div className="flex justify-end">
          <span className={`text-xs ${connectionHint ? connectionHint.color : 'text-destructive'}`}>
            {connectionHint ? connectionHint.text : error}
          </span>
        </div>
      )}
      
      {/* 消息输入区域 */}
      <div className={`flex items-end space-x-4 ${className}`}>
        <div className="flex-1 relative">
          <Textarea
            ref={textareaRef}
            value={currentMessage}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder={finalPlaceholder}
            disabled={isLoading}
            rows={3}
            className="flex-1 resize-none border-0 bg-muted/20 rounded-2xl px-4 py-3 focus:ring-2 focus:ring-primary/20 focus:bg-background/80 transition-all duration-200 shadow-sm"
            style={{ height: 'auto' }}
          />
        </div>
      {isStreaming ? (
        <Button 
          onClick={handleStop}
          variant="outline" 
          size="icon" 
          className="h-12 w-12 rounded-2xl border-destructive/20 text-destructive hover:bg-destructive/10 hover:scale-105 transition-all duration-200 shadow-sm"
        >
          <svg 
            className="w-4 h-4" 
            fill="currentColor" 
            viewBox="0 0 20 20"
          >
            <rect x="6" y="6" width="8" height="8" rx="1" />
          </svg>
        </Button>
      ) : (
        <Button 
          onClick={handleSend}
          disabled={!currentMessage.trim() || isLoading || !isConnected}
          size="icon" 
          className="h-12 w-12 rounded-2xl bg-primary hover:bg-primary/90 hover:scale-105 transition-all duration-200 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          title={!isConnected ? 'WebSocket未连接' : '发送消息'}
        >
          {isLoading ? (
            <svg 
              className="animate-spin w-5 h-5" 
              fill="none" 
              viewBox="0 0 24 24"
            >
              <circle 
                className="opacity-25" 
                cx="12" 
                cy="12" 
                r="10" 
                stroke="currentColor" 
                strokeWidth="4"
              />
              <path 
                className="opacity-75" 
                fill="currentColor" 
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
          ) : (
            <Send className="h-5 w-5" />
          )}
        </Button>
      )}
      </div>
    </div>
  );
};

export default MessageInput;
