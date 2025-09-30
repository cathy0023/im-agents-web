import { useEffect } from 'react'
import { useWebSocketMessages } from '@/store/websocketStore'
import { useChatStore } from '@/store/chatStore'
import type { ReceiveChatMessage } from '@/types/chat-websocket'

/**
 * 检查消息是否是聊天消息类型
 */
function isReceiveChatMessage(message: any): message is ReceiveChatMessage {
  return (
    message &&
    message.type === 'chat_message' &&
    message.message &&
    message.message.data &&
    typeof message.message.data.content === 'string' &&
    ['finish', 'error', 'pending'].includes(message.status)
  )
}

/**
 * WebSocket 聊天集成 Hook
 * 监听 WebSocket 消息并将聊天消息集成到聊天系统中
 */
export const useWebSocketChatIntegration = () => {
  const { lastMessage } = useWebSocketMessages()
  const { handleReceiveMessage, selectedAgent, conversationId } = useChatStore()

  useEffect(() => {
    if (!lastMessage) {
      console.log('🔍 [WebSocket Chat Integration] lastMessage 为空，等待消息...')
      return
    }

    console.group('🔗 [WebSocket Chat Integration] 处理新消息')
    console.log('⏰ 时间:', new Date().toLocaleString())
    console.log('📝 消息类型:', lastMessage.type)
    console.log('🆔 消息ID:', lastMessage.id)
    console.log('👤 当前选中Agent:', selectedAgent)
    console.log('💬 当前会话ID:', conversationId)
    console.log('📦 消息完整内容:', JSON.stringify(lastMessage, null, 2))

    // 检查消息格式
    const hasType = lastMessage.type === 'chat_message'
    const hasMessage = lastMessage.message && lastMessage.message.data
    const hasContent = lastMessage.message?.data?.content
    const hasStatus = lastMessage.status && ['finish', 'error', 'pending'].includes(lastMessage.status)
    
    console.log('🔍 消息格式检查:', {
      hasType,
      hasMessage,
      hasContent,
      hasStatus,
      actualType: lastMessage.type,
      actualStatus: (lastMessage as any).status
    })

    // 检查是否是聊天消息
    const isChatMsg = isReceiveChatMessage(lastMessage)
    console.log('✅ 是否是聊天消息:', isChatMsg)
    
    if (isChatMsg) {
      console.log('✅ 检测到聊天消息，准备集成到聊天系统')
      console.log('📤 调用 handleReceiveMessage...')
      
      // 将WebSocket消息传递给chatStore处理
      handleReceiveMessage(lastMessage)
      console.log('✅ WebSocket消息已传递给ChatStore处理')
    } else {
      console.warn('⚠️ 非聊天消息，跳过处理')
      console.log('原因: 消息格式不符合聊天消息要求')
    }

    console.groupEnd()
  }, [lastMessage, handleReceiveMessage, selectedAgent, conversationId])

  return {
    isIntegrationActive: !!conversationId,
    selectedAgent,
    conversationId
  }
}
