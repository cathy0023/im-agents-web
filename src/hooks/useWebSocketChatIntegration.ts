import { useEffect } from 'react'
import { useWebSocketMessages } from '@/store/websocketStore'
import { useChatStore } from '@/store/chatStore'
import type { ReceiveChatMessage } from '@/types/chat-websocket'

/**
 * 检查消息是否是聊天消息类型
 * 注意：status 字段在 message.status，不在顶层
 */
function isReceiveChatMessage(message: unknown): message is ReceiveChatMessage {
  const msg = message as ReceiveChatMessage;
  return (
    msg &&
    msg.type === 'chat_message' &&
    msg.message &&
    msg.message.data &&
    typeof msg.message.data.content === 'string' &&
    msg.message.status &&
    ['finish', 'error', 'pending'].includes(msg.message.status)
  )
}

/**
 * WebSocket 聊天集成 Hook
 * 监听 WebSocket 消息并将聊天消息集成到聊天系统中
 */
export const useWebSocketChatIntegration = () => {
  const { lastMessage } = useWebSocketMessages()
  const { handleReceiveMessage, selectedAgent, conversationId } = useChatStore()

  console.log('🔄 [WebSocket Integration] Hook 渲染, lastMessage:', lastMessage);

  useEffect(() => {
    console.log('🎯 [WebSocket Integration] useEffect 触发, lastMessage:', lastMessage);
    
    if (!lastMessage) {
      console.log('⏭️ [WebSocket Integration] lastMessage 为空，跳过');
      return
    }

    console.log('🔗 [WebSocket Integration] 收到消息:', lastMessage.type);
    console.log('消息完整内容:', lastMessage);

    // 使用类型断言访问可能的属性
    const msg = lastMessage as ReceiveChatMessage;
    
    // 详细检查消息格式
    console.log('🔍 开始检查消息格式');
    console.log('1. lastMessage:', lastMessage);
    console.log('2. lastMessage.type:', lastMessage.type);
    console.log('3. msg.message:', msg.message);
    console.log('4. msg.message?.data:', msg.message?.data);
    console.log('5. msg.message?.data?.content:', msg.message?.data?.content);
    console.log('6. msg.message?.status:', msg.message?.status);
    
    const hasType = lastMessage.type === 'chat_message'
    const hasMessage = !!(msg.message && msg.message.data)
    const hasContent = typeof msg.message?.data?.content === 'string'
    const hasStatus = msg.message?.status && ['finish', 'error', 'pending'].includes(msg.message.status)
    
    console.log('✅ 检查结果:', {
      类型正确: hasType,
      有message: hasMessage,
      有content: hasContent,
      有status: hasStatus,
      '所有条件都满足': hasType && hasMessage && hasContent && hasStatus
    })

    // 检查是否是聊天消息
    const isChatMsg = isReceiveChatMessage(lastMessage)
    console.log('🎯 是否是聊天消息:', isChatMsg)
    
    if (isChatMsg) {
      console.log('✅ 准备调用 handleReceiveMessage');
      handleReceiveMessage(lastMessage)
      console.log('✅ handleReceiveMessage 调用完成');
    } else {
      console.warn('⚠️ 不是聊天消息，跳过处理');
      console.warn('失败原因分析:');
      if (!hasType) console.warn('- 类型不是 chat_message');
      if (!hasMessage) console.warn('- message 或 message.data 不存在');
      if (!hasContent) console.warn('- content 不是字符串');
      if (!hasStatus) console.warn('- status 不在允许的值中');
    }
  }, [lastMessage, handleReceiveMessage, selectedAgent, conversationId])

  return {
    isIntegrationActive: !!conversationId,
    selectedAgent,
    conversationId
  }
}
