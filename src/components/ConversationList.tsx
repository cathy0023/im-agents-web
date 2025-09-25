import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { MessageCircle, Bot, User, Users } from 'lucide-react'
import { useConversationStore } from '@/store/conversationStore'
import type { Conversation } from '@/types/conversation'

interface ConversationListProps {
  selectedConversationId?: string
  onConversationChange: (conversation: Conversation) => void
  isCollapsed?: boolean
}

const ConversationList = ({ selectedConversationId, onConversationChange, isCollapsed = false }: ConversationListProps) => {
  const navigate = useNavigate()
  const {
    conversations,
    currentConversation,
    setCurrentConversation,
    markAsRead,
    initializeAIConversations,
    cleanupDuplicateConversations,
    resetConversations,
    clearContactConversations
  } = useConversationStore()

  // 初始化AI对话（只在组件首次挂载时执行）
  useEffect(() => {
    // 先清理重复对话
    cleanupDuplicateConversations()
    // 然后初始化AI对话
    initializeAIConversations()
  }, []) // 空依赖数组，确保只执行一次

  const handleConversationClick = (conversation: Conversation) => {
    // 标记为已读
    markAsRead(conversation.id)
    
    // 设置当前对话
    setCurrentConversation(conversation)
    
    // 回调通知父组件
    onConversationChange(conversation)

    // 根据对话类型进行路由导航
    if (conversation.type === 'ai_agent' && conversation.agentId) {
      // AI智能体对话，跳转到对应的智能体页面
      switch (conversation.agentId) {
        case 1:
          navigate('/messages/hr')
          break
        case 2:
          navigate('/messages/dataEyes')
          break
        case 3:
          navigate('/messages/assistant')
          break
      }
    } else if (conversation.type === 'contact') {
      // 联系人对话，跳转到联系人消息页面
      navigate(`/messages/contact/${conversation.id}`)
    }
  }

  // 获取对话图标
  const getConversationIcon = (conversation: Conversation) => {
    switch (conversation.type) {
      case 'ai_agent':
        return <Bot className="h-4 w-4" />
      case 'contact':
        return <User className="h-4 w-4" />
      case 'group':
        return <Users className="h-4 w-4" />
      default:
        return <MessageCircle className="h-4 w-4" />
    }
  }

  // 获取对话类型文本
  const getConversationTypeText = (conversation: Conversation) => {
    switch (conversation.type) {
      case 'ai_agent':
        return 'AI助手'
      case 'contact':
        return '联系人'
      case 'group':
        return '群聊'
      default:
        return ''
    }
  }

  return (
    <div className={`bg-background border-r border-border/50 flex flex-col h-full transition-all duration-300 ${
      isCollapsed ? 'w-16' : 'w-80'
    }`}>
      {/* 对话列表头部 */}
      {!isCollapsed && (
        <div className="p-4 border-b border-border/50">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-lg font-semibold text-foreground">对话</h2>
            <div className="flex gap-1">
              {/* 调试按钮 - 查看当前对话状态 */}
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => {
                  console.log('当前所有对话:', conversations)
                  console.log('对话详情:', conversations.map(c => ({
                    id: c.id,
                    name: c.name,
                    type: c.type,
                    contactId: c.contactId,
                    agentId: c.agentId
                  })))
                }}
                className="text-xs text-muted-foreground hover:text-primary"
              >
                调试
              </Button>
              {/* 清理联系人对话按钮 */}
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => {
                  if (confirm('确定要清除所有联系人对话吗？这将保留AI助手对话。')) {
                    clearContactConversations()
                  }
                }}
                className="text-xs text-muted-foreground hover:text-orange-500"
              >
                清理联系人
              </Button>
              {/* 临时重置按钮 - 用于清理重复数据 */}
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => {
                  if (confirm('确定要重置所有对话吗？这将清除所有对话记录。')) {
                    resetConversations()
                    setTimeout(() => {
                      initializeAIConversations()
                    }, 100)
                  }
                }}
                className="text-xs text-muted-foreground hover:text-destructive"
              >
                重置
              </Button>
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            {conversations.length} 个对话
          </p>
        </div>
      )}

      {/* 对话列表 */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-2">
          {conversations.map((conversation) => (
            <div 
              key={conversation.id} 
              onClick={() => handleConversationClick(conversation)}
              className={`flex items-center px-3 py-3 cursor-pointer transition-colors rounded-lg mb-1 ${
                isCollapsed 
                  ? 'justify-center' 
                  : 'space-x-3'
              } ${
                selectedConversationId === conversation.id || currentConversation?.id === conversation.id
                  ? 'bg-primary/10 border border-primary/20' 
                  : 'hover:bg-muted/30'
              }`}
              title={isCollapsed ? `${conversation.name} - ${conversation.lastMessage}` : ''}
            >
              {/* 头像 */}
              <div className="flex-shrink-0 relative">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  conversation.type === 'ai_agent' 
                    ? 'bg-gradient-to-br from-primary/80 to-primary' 
                    : 'bg-gradient-to-br from-green-500/80 to-green-600'
                }`}>
                  <span className="text-white text-sm font-medium">
                    {conversation.avatar}
                  </span>
                </div>
                {/* 未读消息徽章 */}
                {conversation.unreadCount > 0 && (
                  <Badge 
                    variant="destructive" 
                    className="absolute -top-1 -right-1 h-5 min-w-5 flex items-center justify-center p-0 text-xs text-white"
                  >
                    {conversation.unreadCount > 99 ? '99+' : conversation.unreadCount}
                  </Badge>
                )}
                {/* 对话类型图标 */}
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-background rounded-full border border-border flex items-center justify-center">
                  {getConversationIcon(conversation)}
                </div>
              </div>
              
              {/* 对话信息 */}
              {!isCollapsed && (
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className={`text-sm font-medium truncate ${
                          selectedConversationId === conversation.id || currentConversation?.id === conversation.id
                            ? 'text-primary' 
                            : 'text-foreground'
                        }`}>
                          {conversation.name}
                        </h3>
                        <div className="flex items-center gap-1 ml-2">
                          <span className="text-xs text-muted-foreground px-1 py-0.5 bg-muted/50 rounded">
                            {getConversationTypeText(conversation)}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {conversation.lastMessageTime}
                          </span>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground truncate leading-tight">
                        {conversation.lastMessage || '暂无消息'}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* 空状态 */}
        {conversations.length === 0 && (
          <div className="text-center py-12 px-4">
            <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">暂无对话</h3>
            <p className="text-muted-foreground text-sm">
              {isCollapsed ? '无对话' : '通过通讯录开始与同事或AI助手的对话'}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default ConversationList
