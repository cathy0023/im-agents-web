import { useState, useEffect, useRef } from 'react'
import { useParams } from 'react-router-dom'
import { Send, Image, Paperclip, Smile } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useConversationStore } from '@/store/conversationStore'
import type { Message } from '@/types/conversation'

const ContactChatArea = () => {
  const { conversationId } = useParams<{ conversationId: string }>()
  const [inputValue, setInputValue] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  
  const {
    currentConversation,
    currentUser,
    getConversationById,
    getMessagesByConversationId,
    addMessage,
    setCurrentConversation
  } = useConversationStore()

  // 获取当前对话和消息
  const conversation = conversationId ? getConversationById(conversationId) : null
  const messages = conversationId ? getMessagesByConversationId(conversationId) : []

  // 设置当前对话
  useEffect(() => {
    if (conversation && conversation.id !== currentConversation?.id) {
      setCurrentConversation(conversation)
    }
  }, [conversation, currentConversation, setCurrentConversation])

  // 自动滚动到底部
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // 发送消息
  const handleSendMessage = async () => {
    if (!inputValue.trim() || !conversationId) return

    const messageContent = inputValue.trim()
    setInputValue('')
    setIsTyping(true)

    // 添加用户消息
    addMessage(conversationId, {
      conversationId,
      senderId: currentUser.id,
      senderName: currentUser.name,
      senderType: 'user',
      content: messageContent,
      type: 'text',
      status: 'sent'
    })

    // 模拟对方回复（实际项目中这里应该是WebSocket或API调用）
    setTimeout(() => {
      const otherParticipant = conversation?.participants.find(p => p.id !== currentUser.id)
      if (otherParticipant) {
        addMessage(conversationId, {
          conversationId,
          senderId: otherParticipant.id,
          senderName: otherParticipant.name,
          senderType: 'contact',
          content: `收到您的消息：${messageContent}`,
          type: 'text',
          status: 'sent'
        })
      }
      setIsTyping(false)
    }, 1000 + Math.random() * 2000) // 1-3秒随机延迟
  }

  // 处理键盘事件
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  // 格式化时间
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('zh-CN', { 
      hour: '2-digit', 
      minute: '2-digit' 
    })
  }

  if (!conversation) {
    return (
      <div className="flex-1 flex items-center justify-center bg-background">
        <div className="text-center">
          <h3 className="text-lg font-medium text-foreground mb-2">对话不存在</h3>
          <p className="text-muted-foreground">请从对话列表中选择一个对话</p>
        </div>
      </div>
    )
  }

  const otherParticipant = conversation.participants.find(p => p.id !== currentUser.id)

  return (
    <div className="flex-1 flex flex-col h-full bg-background">
      {/* 对话头部 */}
      <div className="h-16 bg-card border-b border-border flex items-center px-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-500/80 to-green-600 flex items-center justify-center">
            <span className="text-white text-sm font-medium">
              {otherParticipant?.avatar}
            </span>
          </div>
          <div>
            <h3 className="text-base font-medium text-foreground">
              {otherParticipant?.name}
            </h3>
            <p className="text-sm text-muted-foreground">
              {otherParticipant?.status === 'online' ? '在线' : '离线'}
            </p>
          </div>
        </div>
      </div>

      {/* 消息区域 */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-4">
          {messages.map((message: Message) => {
            const isCurrentUser = message.senderId === currentUser.id
            return (
              <div
                key={message.id}
                className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
              >
                <div className="flex items-end space-x-2 max-w-[70%]">
                  {!isCurrentUser && (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-500/80 to-green-600 flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-xs font-medium">
                        {otherParticipant?.avatar}
                      </span>
                    </div>
                  )}
                  <div className="flex flex-col">
                    <div
                      className={`px-4 py-2 rounded-lg ${
                        isCurrentUser
                          ? 'bg-primary text-primary-foreground rounded-br-sm'
                          : 'bg-muted text-foreground rounded-bl-sm'
                      }`}
                    >
                      <p className="text-sm leading-relaxed">{message.content}</p>
                    </div>
                    <span className={`text-xs text-muted-foreground mt-1 ${
                      isCurrentUser ? 'text-right' : 'text-left'
                    }`}>
                      {formatTime(message.timestamp)}
                    </span>
                  </div>
                  {isCurrentUser && (
                    <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                      <span className="text-primary-foreground text-xs font-medium">
                        {currentUser.avatar}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
          
          {/* 正在输入指示器 */}
          {isTyping && (
            <div className="flex justify-start">
              <div className="flex items-end space-x-2 max-w-[70%]">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-500/80 to-green-600 flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-xs font-medium">
                    {otherParticipant?.avatar}
                  </span>
                </div>
                <div className="bg-muted text-foreground px-4 py-2 rounded-lg rounded-bl-sm">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
        <div ref={messagesEndRef} />
      </div>

      {/* 输入区域 */}
      <div className="p-4 border-t border-border bg-card">
        <div className="flex items-end space-x-2">
          <div className="flex-1 flex items-end space-x-2">
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={`发送消息给 ${otherParticipant?.name}...`}
              className="flex-1 bg-background border-border"
              disabled={isTyping}
            />
            <div className="flex space-x-1">
              <Button variant="ghost" size="icon" className="h-10 w-10">
                <Smile className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-10 w-10">
                <Image className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-10 w-10">
                <Paperclip className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <Button 
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || isTyping}
            className="h-10 px-4"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}

export default ContactChatArea
