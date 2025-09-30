/**
 * WebSocket 聊天通信协议类型定义
 * 基于后端提供的协议结构
 */

// ==================== 发送消息 ====================

/**
 * 发送给后端的消息数据结构
 */
export interface ChatMessageData {
  content: string                // 消息内容
}

/**
 * 发送消息的 message 内部结构
 */
export interface SendMessagePayload {
  data: ChatMessageData           // 消息数据
  id: string                      // 消息唯一ID，通过 Date.now().toString() 生成
  agent_uuid: string              // Agent UUID，如 '550e8400-e29b-41d4-a716-446655440001'
  conversation_uuid: string       // 会话UUID，如 'hdskdhjsadhaj'
}

/**
 * 发送消息的完整结构
 */
export interface SendChatMessage {
  type: 'chat_message'            // 消息类型固定为 'chat_message'
  message: SendMessagePayload     // 消息负载，包含 data、id、agent_uuid、conversation_uuid
}

// ==================== 接收消息 ====================

/**
 * Agent回复的消息数据
 */
export interface AgentMessageData {
  content: string                 // 回复内容
  sender_name?: string            // 发送者名称
  timestamp?: number              // 时间戳
}

/**
 * Agent回复的消息结构（包含实际后端返回的所有字段）
 */
export interface AgentMessage {
  data: AgentMessageData
  id: string                      // 消息ID（在 message 内部）
  status: 'finish' | 'error' | 'pending'  // 消息状态（在 message 内部）
  component_name?: string         // 组件名称
  conversation_uuid?: string      // 会话UUID
  timestamp?: number              // 时间戳
  type?: string                   // 消息类型（可能在 message 内部重复）
}

/**
 * 从后端接收的消息完整结构
 */
export interface ReceiveChatMessage {
  type: 'chat_message'            // 消息类型
  message: AgentMessage           // Agent的消息（包含 status、id 等字段）
  timestamp?: number              // 外层时间戳
}

// ==================== 消息状态 ====================

/**
 * 消息状态枚举
 */
export type ChatMessageStatus = 'finish' | 'error' | 'pending'

/**
 * 消息状态说明：
 * - pending: 进行中
 * - finish: 结束对话的结果提示
 * - error: 错误消息
 */

// ==================== 辅助类型 ====================

/**
 * 本地聊天消息（用于UI显示）
 */
export interface LocalChatMessage {
  id: string
  content: string
  role: 'user' | 'assistant'
  timestamp: number
  agentId: string
  conversationId: string
  isStreaming?: boolean
  status?: ChatMessageStatus
  componentName?: string
}

/**
 * 发送消息的参数
 */
export interface SendMessageParams {
  content: string
  agentUuid: string
  conversationUuid: string
}

/**
 * WebSocket 聊天事件回调
 */
export interface ChatWebSocketCallbacks {
  onMessageReceived?: (message: ReceiveChatMessage) => void
  onMessageSent?: (message: SendChatMessage) => void
  onError?: (error: Error) => void
  onStatusChange?: (status: ChatMessageStatus, message: ReceiveChatMessage) => void
}
