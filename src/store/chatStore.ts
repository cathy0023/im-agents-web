import { create } from 'zustand';
import type { DataEyesConfig } from '../types/dataEyes';
import type { ChatWebSocketMessage, WebSocketMessage } from '../types/websocket';
import type { HistoryMessage } from '../types/conversation';
import type { SendChatMessage, ReceiveChatMessage } from '../types/chat-websocket';
import { useWebSocketStore } from './websocketStore';

// 消息接口
export interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant' | 'system';
  timestamp: number;
  isStreaming?: boolean;
  agentId?: string;
}

// 聊天状态接口
export interface ChatState {
  // 消息相关
  messages: Message[];
  currentMessage: string;
  isLoading: boolean;
  isStreaming: boolean;
  isLoadingHistory: boolean; // 历史消息加载状态
  
  // Agent和会话管理
  selectedAgent: string;
  conversationId: string | null;
  
  // 错误处理
  error: string | null;
  
  // DataEyes 专用配置
  dataEyesConfig: DataEyesConfig;
  
  // 操作方法
  setCurrentMessage: (message: string) => void;
  sendMessage: () => Promise<void>;
  stopStreaming: () => void;
  clearMessages: () => void;
  setSelectedAgent: (agentId: string) => void;
  setConversationId: (conversationId: string | null) => void;
  setError: (error: string | null) => void;
  addMessage: (message: Omit<Message, 'id' | 'timestamp'>) => void;
  updateMessage: (id: string, updates: Partial<Message>) => void;
  clearAgentMessages: (agentId: string) => void;
  addWebSocketMessage: (wsMessage: ChatWebSocketMessage) => void;
  addHistoryMessages: (historyMessages: HistoryMessage[], agentId: string) => void;
  handleReceiveMessage: (wsMessage: ReceiveChatMessage) => void;
  setLoadingHistory: (loading: boolean) => void;
  
  // DataEyes 专用操作
  toggleDataEyesChat: () => void;
  setDataEyesChatEnabled: (enabled: boolean) => void;
  setDataEyesLayoutMode: (mode: 'chart-only' | 'chat-active') => void;
}


// 生成唯一ID
const generateId = () => Date.now().toString(36) + Math.random().toString(36).substr(2);

// 创建聊天store
export const useChatStore = create<ChatState>((set, get) => {
  return {
    // 初始状态
    messages: [],
    currentMessage: '',
    isLoading: false,
    isStreaming: false,
    isLoadingHistory: false,
    selectedAgent: '',
    conversationId: null,
    error: null,
    
    // DataEyes 初始配置
    dataEyesConfig: {
      chatEnabled: true,
      isChatActive: false,
      bubbleVisible: true,
      layoutMode: 'chart-only'
    },

    // 设置当前输入的消息
    setCurrentMessage: (message: string) => {
      set({ currentMessage: message });
    },

    // 发送消息 - 使用WebSocket通信
    sendMessage: async () => {
      const state = get();
      const { currentMessage, selectedAgent, conversationId } = state;

      if (!currentMessage.trim()) {
        set({ error: '请输入消息内容' });
        return;
      }

      if (!selectedAgent) {
        set({ error: '请选择一个Agent' });
        return;
      }

      if (!conversationId) {
        set({ error: '会话ID不存在' });
        return;
      }

      // 获取WebSocket Store
      const wsStore = useWebSocketStore.getState();
      
      if (!wsStore.isConnected) {
        set({ error: 'WebSocket未连接，请等待连接成功' });
        return;
      }

      // 添加用户消息到UI
      const userMessage: Message = {
        id: generateId(),
        content: currentMessage.trim(),
        role: 'user',
        timestamp: Date.now(),
        agentId: selectedAgent,
      };

      // 创建AI回复消息占位符
      const aiMessageId = generateId();
      const aiMessage: Message = {
        id: aiMessageId,
        content: '',
        role: 'assistant',
        timestamp: Date.now(),
        isStreaming: true,
        agentId: selectedAgent,
      };

      set({
        messages: [...state.messages, userMessage, aiMessage],
        currentMessage: '',
        isLoading: true,
        isStreaming: true,
        error: null,
      });

      console.log('📤 [ChatStore] 准备发送消息');
      console.log('用户消息:', userMessage);
      console.log('AI消息占位符:', aiMessage);
      console.log('selectedAgent:', selectedAgent);
      console.log('conversationId:', conversationId);

      try {
        // 构建发送给后端的WebSocket消息 - 修正后的结构
        const wsMessage: SendChatMessage = {
          type: 'chat_message',
          message: {
            data: {
              content: currentMessage.trim()
            },
            id: Date.now().toString(),
            agent_uuid: selectedAgent,
            conversation_uuid: conversationId
          }
        };

        console.log('📤 [ChatStore] 发送WebSocket消息:', wsMessage);

        // 发送WebSocket消息
        const success = wsStore.sendMessage(wsMessage as WebSocketMessage);

        if (!success) {
          throw new Error('WebSocket消息发送失败');
        }

      } catch (error) {
        console.error('❌ [ChatStore] 发送消息失败:', error);
        set({ 
          error: error instanceof Error ? error.message : '发送消息失败',
          isLoading: false,
          isStreaming: false,
        });
        
        // 移除失败的AI消息
        const currentState = get();
        const filteredMessages = currentState.messages.filter(msg => msg.id !== aiMessageId);
        set({ messages: filteredMessages });
      }
    },

    // 停止流式输出
    stopStreaming: () => {
      set({ isLoading: false, isStreaming: false });
    },

    // 清空消息
    clearMessages: () => {
      set({ messages: [], error: null });
    },

    // 设置Agent
    setSelectedAgent: (agentId: string) => {
      set({ selectedAgent: agentId });
    },

    // 设置会话ID
    setConversationId: (conversationId: string | null) => {
      set({ conversationId });
    },

    // 设置错误
    setError: (error: string | null) => {
      set({ error });
    },

    // 添加消息
    addMessage: (message: Omit<Message, 'id' | 'timestamp'>) => {
      const newMessage: Message = {
        ...message,
        id: generateId(),
        timestamp: Date.now(),
      };
      const state = get();
      set({ messages: [...state.messages, newMessage] });
    },

    // 更新消息
    updateMessage: (id: string, updates: Partial<Message>) => {
      const state = get();
      const updatedMessages = state.messages.map(msg => 
        msg.id === id ? { ...msg, ...updates } : msg
      );
      set({ messages: updatedMessages });
    },

    // 清空指定Agent的消息
    clearAgentMessages: (agentId: string) => {
      const state = get();
      const filteredMessages = state.messages.filter(msg => msg.agentId !== agentId);
      set({ messages: filteredMessages });
    },

    // 添加WebSocket消息到聊天记录
    addWebSocketMessage: (wsMessage: ChatWebSocketMessage) => {
      const state = get();
      
      // 将WebSocket消息转换为聊天消息格式
      const chatMessage: Message = {
        id: wsMessage.id,
        content: wsMessage.data.content,
        role: wsMessage.data.role,
        timestamp: wsMessage.timestamp,
        agentId: wsMessage.data.agentId?.toString() || state.selectedAgent,
        isStreaming: false
      };

      console.log('ChatStore: 添加WebSocket消息到聊天记录:', {
        messageId: chatMessage.id,
        role: chatMessage.role,
        agentId: chatMessage.agentId,
        contentLength: chatMessage.content.length,
        timestamp: new Date(chatMessage.timestamp).toLocaleString()
      });

      set({ 
        messages: [...state.messages, chatMessage],
        error: null // 清除之前的错误
      });
    },

    // 处理从WebSocket接收到的消息（非流式，一次性返回完整内容）
    handleReceiveMessage: (wsMessage: ReceiveChatMessage) => {
      const state = get();
      
      console.log('📥 [ChatStore] 处理接收消息');
      console.log('当前所有消息:', state.messages.map(m => ({
        id: m.id,
        role: m.role,
        isStreaming: m.isStreaming,
        agentId: m.agentId,
        contentLength: m.content.length
      })));
      console.log('当前 selectedAgent:', state.selectedAgent);
      console.log('消息内容:', wsMessage.message?.data?.content);
      console.log('消息状态:', wsMessage.message?.status);
      
      // 查找正在loading的AI消息占位符
      const loadingMessage = state.messages.find(
        msg => msg.role === 'assistant' && msg.isStreaming && msg.agentId === state.selectedAgent
      );
      
      console.log('找到的loading消息:', loadingMessage);
      
      if (!loadingMessage) {
        console.warn('⚠️ [ChatStore] 未找到loading消息占位符，无法更新');
        return;
      }
      
      const content = wsMessage.message?.data?.content || '';
      const status = wsMessage.message?.status;
      
      // 根据消息状态处理（非流式，直接设置完整内容）
      if (status === 'pending' || status === 'finish') {
        // pending或finish状态都直接显示完整内容
        // 注意：后端一次性返回的消息状态可能是pending
        const updatedMessages = state.messages.map(msg => 
          msg.id === loadingMessage.id
            ? { 
                ...msg, 
                content: content, // 直接设置完整内容，不追加
                isStreaming: false 
              }
            : msg
        );
        set({ 
          messages: updatedMessages,
          isLoading: false,
          isStreaming: false
        });
        console.log(`✅ [ChatStore] 消息接收完成 (${status})，内容长度:`, content.length);
        
      } else if (status === 'error') {
        // 错误消息
        console.error('❌ [ChatStore] 消息接收错误:', content);
        set({ 
          error: content || '消息接收失败',
          isLoading: false,
          isStreaming: false
        });
        // 移除失败的AI消息
        const filteredMessages = state.messages.filter(msg => msg.id !== loadingMessage.id);
        set({ messages: filteredMessages });
      }
    },
    
    // 设置历史消息加载状态
    setLoadingHistory: (loading: boolean) => {
      set({ isLoadingHistory: loading });
    },
    
    // 添加历史消息到聊天记录
    addHistoryMessages: (historyMessages: HistoryMessage[], agentId: string) => {
      const state = get();
      const convertedMessages: Message[] = [];
      
      console.log('ChatStore: 开始处理历史消息，消息数量:', historyMessages.length);
      
      // 按对话分组处理历史消息
      let currentConversation: HistoryMessage[] = [];
      
      historyMessages.forEach((historyMsg) => {
        if (historyMsg.type === 'begin') {
          // 添加对话分割标记（除了第一个对话）
          if (historyMessages.length > 0) {
            const separatorMessage: Message = {
              id: `separator-${historyMsg.conversation_uuid}-${historyMsg.timestamp}`,
              content: new Date(historyMsg.timestamp * 1000).toLocaleString('zh-CN', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                hour12: false
              }).replace(/\//g, '-'),
              role: 'system',
              timestamp: historyMsg.timestamp * 1000,
              agentId: agentId,
              isStreaming: false
            };
            convertedMessages.push(separatorMessage);
          }
          
          // 开始新的对话
          currentConversation = [historyMsg];
        } else if (historyMsg.type === 'end') {
          // 结束当前对话，处理整个对话
          currentConversation.push(historyMsg);
          
          // 处理当前对话中的消息
          const conversationMessages = currentConversation.filter(msg => msg.type === 'message');
          conversationMessages.forEach(msg => {
            const chatMessage: Message = {
              id: msg.message_id || `history-${msg.conversation_uuid}-${msg.timestamp}`,
              content: msg.content,
              role: msg.sender_type === 'user' ? 'user' : 'assistant',
              timestamp: msg.timestamp * 1000, // 转换为毫秒
              agentId: agentId,
              isStreaming: false
            };
            convertedMessages.push(chatMessage);
          });
          
          currentConversation = [];
        } else if (historyMsg.type === 'message') {
          // 添加到当前对话
          currentConversation.push(historyMsg);
        }
      });
      
      console.log('ChatStore: 历史消息转换完成，转换后消息数量:', convertedMessages.length);
      
      // 清除该agent的现有消息，然后添加历史消息
      const filteredMessages = state.messages.filter(msg => msg.agentId !== agentId);
      
      set({ 
        messages: [...filteredMessages, ...convertedMessages],
        error: null,
        isLoadingHistory: false // 加载完成
      });
    },
    
    // DataEyes 专用操作方法
    toggleDataEyesChat: () => {
      const state = get();
      const newChatActive = !state.dataEyesConfig.isChatActive;
      set({
        dataEyesConfig: {
          ...state.dataEyesConfig,
          isChatActive: newChatActive,
          bubbleVisible: !newChatActive,
          layoutMode: newChatActive ? 'chat-active' : 'chart-only'
        }
      });
    },

    setDataEyesChatEnabled: (enabled: boolean) => {
      const state = get();
      set({
        dataEyesConfig: {
          ...state.dataEyesConfig,
          chatEnabled: enabled,
          // 如果禁用聊天，也要关闭聊天状态
          isChatActive: enabled ? state.dataEyesConfig.isChatActive : false,
          bubbleVisible: enabled,
          layoutMode: enabled && state.dataEyesConfig.isChatActive ? 'chat-active' : 'chart-only'
        }
      });
    },

    setDataEyesLayoutMode: (mode: 'chart-only' | 'chat-active') => {
      const state = get();
      set({
        dataEyesConfig: {
          ...state.dataEyesConfig,
          layoutMode: mode,
          isChatActive: mode === 'chat-active',
          bubbleVisible: mode === 'chart-only'
        }
      });
    },
  };
});
