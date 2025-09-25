import React, { useRef, useEffect } from 'react';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Send } from 'lucide-react';
import { useChatStore } from '../store/chatStore';

interface MessageInputProps {
  className?: string;
  placeholder?: string;
}

const MessageInput = ({ className = '', placeholder }: MessageInputProps) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
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

  return (
    <div className={`flex items-end space-x-3 ${className}`}>
      <Textarea
        ref={textareaRef}
        value={currentMessage}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        placeholder={finalPlaceholder}
        disabled={isLoading}
        rows={3}
        className="flex-1 resize-none"
        style={{ height: 'auto' }}
      />
      {isStreaming ? (
        <Button 
          onClick={handleStop}
          variant="outline" 
          size="icon" 
          className="px-4 py-3 border-destructive text-destructive hover:bg-destructive/10"
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
          disabled={!currentMessage.trim() || isLoading}
          size="icon" 
          className="px-4 py-3"
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
  );
};

export default MessageInput;
