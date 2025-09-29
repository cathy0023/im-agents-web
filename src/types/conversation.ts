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

// API会话相关类型 (与后端API对应)
export interface ApiConversationInfo {
  display_name: string;
  user_id: string;
  org_legal_id: number;
  agent_type: string;
  agent_uuid: string;
  status: string;
  created_at: string;
  last_activity: string;
  message_count: number;
  timeout_seconds: number;
  conversation_id: string;
}

// API创建会话请求
export interface ApiCreateConversationRequest {
  agent_key: string;
  agent_uuid: string;
}

// API创建会话响应
export interface ApiCreateConversationResponse {
  conversation_id: string;
  action: string;
  message: string;
  conversation_info: ApiConversationInfo;
}

// 会话状态
export type ConversationStatus = 'active' | 'inactive' | 'timeout' | 'ended'

// 历史消息类型定义
export interface HistoryMessage {
  conversation_uuid: string;
  type: 'begin' | 'message' | 'end';
  content: string;
  sender_type: string;
  sender_name: string;
  timestamp: number;
  message_id: string;
}

// 获取历史消息响应类型
export interface GetHistoryMessagesResponse {
  user_id: string;
  agent_uuid: string;
  agent_type: string;
  data: HistoryMessage[];
  total_count: number;
  has_more: boolean;
  next_cursor: string | null;
  timestamp: number;
}