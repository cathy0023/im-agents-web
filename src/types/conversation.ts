// 对话相关类型定义

// 对话类型
export type ConversationType = 'ai_agent' | 'contact' | 'group'

// 对话参与者类型
export type ParticipantType = 'user' | 'ai_agent' | 'contact'

// 对话参与者
export interface Participant {
  id: string
  name: string
  avatar: string
  type: ParticipantType
  status?: 'online' | 'offline' | 'busy'
}

// 对话信息
export interface Conversation {
  id: string
  type: ConversationType
  name: string
  participants: Participant[]
  lastMessage?: string
  lastMessageTime?: string
  unreadCount: number
  avatar: string
  // AI智能体特有属性
  agentId?: number
  // 联系人对话特有属性
  contactId?: string
  isActive?: boolean
}

// 消息类型
export interface Message {
  id: string
  conversationId: string
  senderId: string
  senderName: string
  senderType: ParticipantType
  content: string
  timestamp: Date
  type: 'text' | 'image' | 'file'
  status: 'sending' | 'sent' | 'delivered' | 'read'
}

// 创建对话请求
export interface CreateConversationRequest {
  type: ConversationType
  participantIds: string[]
  name?: string
}

// 对话列表过滤选项
export interface ConversationFilter {
  type?: ConversationType
  status?: 'active' | 'archived'
  hasUnread?: boolean
}
