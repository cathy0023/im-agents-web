import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Conversation, Message, Participant, CreateConversationRequest } from '@/types/conversation'
import type { Contact } from '@/types/contacts'

interface ConversationState {
  // 对话列表
  conversations: Conversation[]
  // 当前选中的对话
  currentConversation: Conversation | null
  // 消息记录（按对话ID分组）
  messages: Record<string, Message[]>
  // 用户信息（当前登录用户）
  currentUser: Participant
  // 是否已初始化AI对话
  isAIInitialized: boolean
  
  // Actions
  setCurrentConversation: (conversation: Conversation | null) => void
  createConversation: (request: CreateConversationRequest, contact?: Contact) => Conversation
  addMessage: (conversationId: string, message: Omit<Message, 'id' | 'timestamp'>) => void
  markAsRead: (conversationId: string) => void
  updateConversation: (conversationId: string, updates: Partial<Conversation>) => void
  getConversationById: (id: string) => Conversation | undefined
  getMessagesByConversationId: (conversationId: string) => Message[]
  // 从联系人创建对话
  createContactConversation: (contact: Contact) => Conversation
  // 初始化AI智能体对话
  initializeAIConversations: () => void
  // 清理重复对话
  cleanupDuplicateConversations: () => void
  // 重置所有对话（调试用）
  resetConversations: () => void
  // 只删除联系人对话，保留AI对话
  clearContactConversations: () => void
}

// 默认用户信息（模拟当前登录用户）
const DEFAULT_USER: Participant = {
  id: 'current_user',
  name: '我',
  avatar: 'ME',
  type: 'user',
  status: 'online'
}

// 生成唯一ID
const generateId = () => `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

export const useConversationStore = create<ConversationState>()(
  persist(
    (set, get) => ({
      conversations: [],
      currentConversation: null,
      messages: {},
      currentUser: DEFAULT_USER,
      isAIInitialized: false,

      setCurrentConversation: (conversation) => {
        set({ currentConversation: conversation })
        // 自动标记为已读
        if (conversation) {
          get().markAsRead(conversation.id)
        }
      },

      createConversation: (request, contact) => {
        const newConversation: Conversation = {
          id: generateId(),
          type: request.type,
          name: request.name || (contact ? contact.name : '新对话'),
          participants: request.participantIds.map(id => {
            if (id === 'current_user') return DEFAULT_USER
            if (contact && contact.id === id) {
              return {
                id: contact.id,
                name: contact.name,
                avatar: contact.avatar,
                type: 'contact',
                status: contact.status
              }
            }
            return {
              id,
              name: `用户${id}`,
              avatar: id.toUpperCase().slice(0, 2),
              type: 'contact'
            }
          }),
          lastMessage: '',
          lastMessageTime: new Date().toLocaleTimeString(),
          unreadCount: 0,
          avatar: contact?.avatar || 'GR',
          contactId: contact?.id,
          isActive: true
        }

        set(state => ({
          conversations: [newConversation, ...state.conversations],
          messages: {
            ...state.messages,
            [newConversation.id]: []
          }
        }))

        return newConversation
      },

      addMessage: (conversationId, messageData) => {
        const message: Message = {
          ...messageData,
          id: generateId(),
          timestamp: new Date(),
          conversationId
        }

        set(state => {
          const updatedMessages = {
            ...state.messages,
            [conversationId]: [...(state.messages[conversationId] || []), message]
          }

          // 更新对话的最后消息信息并将其移到最前面
          let updatedConversation: Conversation | null = null
          const otherConversations = state.conversations.filter(conv => {
            if (conv.id === conversationId) {
              const isCurrentUserMessage = message.senderId === DEFAULT_USER.id
              updatedConversation = {
                ...conv,
                lastMessage: message.content,
                lastMessageTime: message.timestamp.toLocaleTimeString(),
                unreadCount: isCurrentUserMessage ? conv.unreadCount : conv.unreadCount + 1
              }
              return false // 从原位置移除
            }
            return true
          })

          // 将更新的对话放到最前面
          const updatedConversations = updatedConversation 
            ? [updatedConversation, ...otherConversations]
            : state.conversations

          return {
            messages: updatedMessages,
            conversations: updatedConversations
          }
        })
      },

      markAsRead: (conversationId) => {
        set(state => ({
          conversations: state.conversations.map(conv =>
            conv.id === conversationId
              ? { ...conv, unreadCount: 0 }
              : conv
          )
        }))
      },

      updateConversation: (conversationId, updates) => {
        set(state => ({
          conversations: state.conversations.map(conv =>
            conv.id === conversationId
              ? { ...conv, ...updates }
              : conv
          )
        }))
      },

      getConversationById: (id) => {
        return get().conversations.find(conv => conv.id === id)
      },

      getMessagesByConversationId: (conversationId) => {
        return get().messages[conversationId] || []
      },

      createContactConversation: (contact) => {
        // 检查是否已存在与该联系人的对话
        const existingConversation = get().conversations.find(
          conv => conv.contactId === contact.id && conv.type === 'contact'
        )

        if (existingConversation) {
          // 如果对话已存在，将其移到最前面（最新）
          set(state => ({
            conversations: [
              existingConversation,
              ...state.conversations.filter(conv => conv.id !== existingConversation.id)
            ]
          }))
          return existingConversation
        }

        // 创建新对话
        const newConversation = get().createConversation(
          {
            type: 'contact',
            participantIds: ['current_user', contact.id],
            name: contact.name
          },
          contact
        )

        return newConversation
      },

      initializeAIConversations: () => {
        const { isAIInitialized, conversations } = get()
        
        // 如果已经初始化过，直接返回
        if (isAIInitialized) {
          return
        }

        // 检查是否已经有AI对话存在（防止重复）
        const existingAIAgentIds = conversations
          .filter(conv => conv.type === 'ai_agent' && conv.agentId)
          .map(conv => conv.agentId)

        console.log('现有AI智能体ID:', existingAIAgentIds)

        const aiAgents = [
          {
            id: 1,
            name: 'HR',
            avatar: 'HR',
            message: '当然，我可以为专业和友好的深度采访客户的人力资源相关问题',
            time: '昨天'
          },
          {
            id: 2,
            name: 'DataEyes',
            avatar: 'DE',
            message: '纯数据分析专家',
            time: '10:30'
          },
          {
            id: 3,
            name: '心理测评师小王',
            avatar: 'XW',
            message: '专注心理测评与咨询服务',
            time: '09:15'
          }
        ].filter(agent => !existingAIAgentIds.includes(agent.id))

        console.log('需要添加的AI智能体:', aiAgents)

        // 如果没有需要添加的AI对话，只标记已初始化
        if (aiAgents.length === 0) {
          set({ isAIInitialized: true })
          return
        }

        const newAIConversations: Conversation[] = aiAgents.map(agent => ({
          id: `ai_${agent.id}`,
          type: 'ai_agent',
          name: agent.name,
          participants: [
            DEFAULT_USER,
            {
              id: `ai_${agent.id}`,
              name: agent.name,
              avatar: agent.avatar,
              type: 'ai_agent',
              status: 'online'
            }
          ],
          lastMessage: agent.message,
          lastMessageTime: agent.time,
          unreadCount: agent.id === 2 ? 2 : 0,
          avatar: agent.avatar,
          agentId: agent.id,
          isActive: true
        }))

        console.log('创建新的AI对话:', newAIConversations)

        set(state => ({
          // 将AI对话添加到现有对话的末尾，保持联系人对话在前
          conversations: [...state.conversations, ...newAIConversations],
          messages: {
            ...state.messages,
            ...newAIConversations.reduce((acc, conv) => {
              acc[conv.id] = []
              return acc
            }, {} as Record<string, Message[]>)
          },
          isAIInitialized: true
        }))
      },

      cleanupDuplicateConversations: () => {
        set(state => {
          console.log('清理前的对话数量:', state.conversations.length)
          console.log('清理前的对话列表:', state.conversations.map(c => ({ id: c.id, name: c.name, type: c.type, agentId: c.agentId, contactId: c.contactId })))
          
          // 创建去重映射
          const uniqueConversations = new Map<string, Conversation>()
          
          // 对于AI智能体，使用agentId作为唯一标识
          // 对于联系人，使用contactId作为唯一标识
          state.conversations.forEach(conv => {
            let key: string
            if (conv.type === 'ai_agent' && conv.agentId) {
              key = `ai_${conv.agentId}`
            } else if (conv.type === 'contact' && conv.contactId) {
              key = `contact_${conv.contactId}`
            } else {
              key = conv.id // 兜底使用ID
            }
            
            // 如果已存在，保留最新的（通常是最后添加的）
            if (!uniqueConversations.has(key) || conv.id > (uniqueConversations.get(key)?.id || '')) {
              uniqueConversations.set(key, conv)
            }
          })
          
          const cleanedConversations = Array.from(uniqueConversations.values())
          console.log('清理后的对话数量:', cleanedConversations.length)
          console.log('清理后的对话列表:', cleanedConversations.map(c => ({ id: c.id, name: c.name, type: c.type, agentId: c.agentId, contactId: c.contactId })))
          
          return {
            conversations: cleanedConversations
          }
        })
      },

      resetConversations: () => {
        set({
          conversations: [],
          messages: {},
          currentConversation: null,
          isAIInitialized: false
        })
      },

      clearContactConversations: () => {
        set(state => {
          // 只保留AI对话，删除所有联系人对话
          const aiConversations = state.conversations.filter(conv => conv.type === 'ai_agent')
          
          // 清理对应的消息记录
          const updatedMessages = Object.keys(state.messages).reduce((acc, convId) => {
            if (aiConversations.some(conv => conv.id === convId)) {
              acc[convId] = state.messages[convId]
            }
            return acc
          }, {} as Record<string, Message[]>)
          
          console.log('清理前联系人对话数量:', state.conversations.filter(c => c.type === 'contact').length)
          console.log('清理后AI对话数量:', aiConversations.length)
          
          return {
            conversations: aiConversations,
            messages: updatedMessages,
            currentConversation: state.currentConversation?.type === 'contact' ? null : state.currentConversation
          }
        })
      }
    }),
    {
      name: 'conversation-store',
      partialize: (state) => ({
        conversations: state.conversations,
        messages: state.messages,
        currentUser: state.currentUser,
        isAIInitialized: state.isAIInitialized
      })
    }
  )
)
