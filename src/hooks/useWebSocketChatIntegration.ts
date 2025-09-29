import { useEffect } from 'react'
import { useWebSocketMessages } from '@/store/websocketStore'
import { useChatStore } from '@/store/chatStore'
import { isChatMessage } from '@/types/websocket'

/**
 * WebSocket 聊天集成 Hook
 * 监听 WebSocket 消息并将聊天消息集成到聊天系统中
 */
export const useWebSocketChatIntegration = () => {
  const { lastMessage } = useWebSocketMessages()
  const { addWebSocketMessage, selectedAgent, conversationId } = useChatStore()

  useEffect(() => {
    if (!lastMessage) return

    console.group('🔗 [WebSocket Chat Integration] 处理新消息')
    console.log('消息类型:', lastMessage.type)
    console.log('消息ID:', lastMessage.id)
    console.log('当前选中Agent:', selectedAgent)
    console.log('当前会话ID:', conversationId)
    console.log('消息详情:', lastMessage)

    // 检查是否是聊天消息
    if (isChatMessage(lastMessage)) {
      console.log('✅ 检测到聊天消息，准备集成到聊天系统')
      
      // 检查消息是否属于当前选中的agent
      const messageAgentId = lastMessage.data.agentId
      if (messageAgentId && messageAgentId !== selectedAgent) {
        console.log('⚠️ 消息不属于当前选中的agent，跳过处理', {
          messageAgentId,
          selectedAgent
        })
        console.groupEnd()
        return
      }

      // 将WebSocket消息添加到聊天记录
      addWebSocketMessage(lastMessage)
      console.log('✅ WebSocket消息已添加到聊天记录')
    } else {
      console.log('ℹ️ 非聊天消息，跳过处理')
    }

    console.groupEnd()
  }, [lastMessage, addWebSocketMessage, selectedAgent, conversationId])

  return {
    isIntegrationActive: !!conversationId,
    selectedAgent,
    conversationId
  }
}
