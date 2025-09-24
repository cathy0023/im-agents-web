import { create } from 'zustand';
import { createZhipuChatStream } from '../lib/sse';
import type { ChatMessage } from '../types/chat';

// 消息接口
export interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant' | 'system';
  timestamp: number;
  isStreaming?: boolean;
  agentId?: number;
}

// 聊天状态接口
export interface ChatState {
  // 消息相关
  messages: Message[];
  currentMessage: string;
  isLoading: boolean;
  isStreaming: boolean;
  
  // AI配置
  apiKey: string;
  selectedModel: string;
  selectedAgent: number;
  
  // 错误处理
  error: string | null;
  
  // 操作方法
  setCurrentMessage: (message: string) => void;
  sendMessage: () => Promise<void>;
  stopStreaming: () => void;
  clearMessages: () => void;
  setApiKey: (apiKey: string) => void;
  setSelectedModel: (model: string) => void;
  setSelectedAgent: (agentId: number) => void;
  setError: (error: string | null) => void;
  addMessage: (message: Omit<Message, 'id' | 'timestamp'>) => void;
  updateMessage: (id: string, updates: Partial<Message>) => void;
  clearAgentMessages: (agentId: number) => void;
}

// 可用模型
export const AVAILABLE_MODELS = [
  { id: 'glm-4', name: 'GLM-4', description: '智谱AI最新模型' },
  { id: 'glm-4v', name: 'GLM-4V', description: '支持图像理解' },
  { id: 'glm-3-turbo', name: 'GLM-3-Turbo', description: '快速响应版本' },
];

// Agent配置
export const AGENT_CONFIGS = {
  1: {
    name: 'HR智能助手',
    systemPrompt: '你是一个专业的HR智能助手，擅长处理人力资源相关问题，包括招聘、薪酬、培训、政策咨询等。请用专业、友好的语调回答用户问题。',
  },
  2: {
    name: 'DataEyes',
    systemPrompt: '你是DataEyes数据分析师，专门帮助用户分析各种业务数据，提供数据洞察和建议。请用专业、准确的方式分析数据并给出建议。',
  },
  3: {
    name: '对话助手',
    systemPrompt: '你是一个友好的对话助手，可以进行自然流畅的对话，帮助用户练习语言、讨论话题等。请保持自然、友善的对话风格。',
  },
  4: {
    name: 'Dr. Chen 心理测评师',
    systemPrompt: `你是Dr. Chen，一位经验丰富的心理咨询专家和指导老师，专门负责心理咨询对练训练。

当前训练场景：青少年学习焦虑咨询
角色设定：你现在扮演一位16岁的高中生，最近因为学习压力而感到焦虑。

你的任务是：
1. 以青少年的身份真实地表达学习焦虑的困扰
2. 根据学生的咨询回应，给出相应的反应和情感表达
3. 在对话结束后，以Dr. Chen的身份给出专业的评估和指导建议

回应要求：
- 作为来访者时：用青少年的语言风格，真实表达内心焦虑、学习压力等情感
- 表现出典型的青少年学习焦虑症状：担心考试、睡眠不好、注意力难集中、对未来担忧等
- 对咨询师的技巧做出自然反应，如果是好的共情和倾听，表现出信任和开放
- 如果咨询技巧不当，可以表现出抗拒或更加封闭

请始终保持角色的一致性和真实性，为学生提供专业的对练体验。`,
  },
  5: {
    name: 'Prof. Johnson 英语口语考官',
    systemPrompt: `你是Prof. Johnson，一位资深的英语口语考官和语言教学专家，专门负责英语口语对练训练。

当前训练场景：雅思口语考试模拟
角色设定：你是一位严谨但友善的雅思口语考官，正在进行Part 1-3的完整口语考试。

你的任务是：
1. 作为口语考官，按照雅思考试标准流程进行提问
2. 根据考生的回答水平，调整后续问题的难度
3. 在考试结束后，以Prof. Johnson的身份给出专业的评估和改进建议

考试流程：
Part 1 (4-5分钟)：个人信息和日常话题，如家乡、工作/学习、兴趣爱好等
Part 2 (3-4分钟)：话题卡演讲，给出话题让考生准备1分钟后讲2分钟
Part 3 (4-5分钟)：基于Part 2话题的深入讨论

评分标准：
- 流利度与连贯性：语言流畅程度、逻辑连接
- 词汇丰富性：词汇量和使用准确性
- 语法多样性与准确性：语法结构和正确性
- 发音：清晰度和自然度

回应要求：
- 使用标准的考官用语和提问方式
- 根据考生水平调整语速和词汇难度
- 保持专业、耐心、鼓励的态度
- 适时提供引导但不过度帮助

请严格按照雅思口语考试标准进行对练，为考生提供真实的考试体验。`,
  },
};

// 生成唯一ID
const generateId = () => Date.now().toString(36) + Math.random().toString(36).substr(2);

// 创建聊天store
export const useChatStore = create<ChatState>((set, get) => {
  let abortController: (() => void) | null = null;

  return {
    // 初始状态
    messages: [],
    currentMessage: '',
    isLoading: false,
    isStreaming: false,
    apiKey: localStorage.getItem('zhipu_api_key') || '596a400896fb4523a42fc3a6225c5808.iNBj9VvsNNrnMpK9',
    selectedModel: 'glm-4',
    selectedAgent: 1,
    error: null,

    // 设置当前输入的消息
    setCurrentMessage: (message: string) => {
      set({ currentMessage: message });
    },

    // 发送消息
    sendMessage: async () => {
      const state = get();
      const { currentMessage, apiKey, selectedModel, selectedAgent } = state;

      if (!currentMessage.trim()) {
        set({ error: '请输入消息内容' });
        return;
      }

      if (!apiKey) {
        set({ error: '请先设置API Key' });
        return;
      }

      // 添加用户消息
      const userMessage: Message = {
        id: generateId(),
        content: currentMessage.trim(),
        role: 'user',
        timestamp: Date.now(),
        agentId: selectedAgent,
      };

      // 创建AI回复消息占位符
      const aiMessage: Message = {
        id: generateId(),
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

      try {
        // 准备聊天消息
        const agentConfig = AGENT_CONFIGS[selectedAgent as keyof typeof AGENT_CONFIGS];
        const chatMessages: ChatMessage[] = [
          {
            role: 'system',
            content: agentConfig.systemPrompt,
          },
          // 只发送最近的10条消息以节省token
          ...state.messages
            .filter(msg => msg.agentId === selectedAgent)
            .slice(-10)
            .map(msg => ({
              role: msg.role as 'user' | 'assistant',
              content: msg.content,
            })),
          {
            role: 'user',
            content: currentMessage.trim(),
          },
        ];

        // 开始流式请求
        abortController = await createZhipuChatStream(
          {
            model: selectedModel,
            messages: chatMessages,
            temperature: 0.7,
            max_tokens: 2000,
          },
          apiKey,
          // onChunk: 接收到新的内容块
          (chunk: string) => {
            const currentState = get();
            const updatedMessages = currentState.messages.map(msg => 
              msg.id === aiMessage.id 
                ? { ...msg, content: msg.content + chunk }
                : msg
            );
            set({ messages: updatedMessages });
          },
          // onError: 发生错误
          (error: Error) => {
            set({ 
              error: error.message,
              isLoading: false,
              isStreaming: false,
            });
            // 移除失败的AI消息
            const currentState = get();
            const filteredMessages = currentState.messages.filter(msg => msg.id !== aiMessage.id);
            set({ messages: filteredMessages });
          },
          // onComplete: 完成
          () => {
            const currentState = get();
            const updatedMessages = currentState.messages.map(msg => 
              msg.id === aiMessage.id 
                ? { ...msg, isStreaming: false }
                : msg
            );
            set({ 
              messages: updatedMessages,
              isLoading: false,
              isStreaming: false,
            });
            abortController = null;
          }
        );

      } catch (error) {
        console.error('发送消息失败:', error);
        set({ 
          error: error instanceof Error ? error.message : '发送消息失败',
          isLoading: false,
          isStreaming: false,
        });
        
        // 移除失败的AI消息
        const currentState = get();
        const filteredMessages = currentState.messages.filter(msg => msg.id !== aiMessage.id);
        set({ messages: filteredMessages });
      }
    },

    // 停止流式输出
    stopStreaming: () => {
      if (abortController) {
        abortController();
        abortController = null;
      }
      set({ isLoading: false, isStreaming: false });
    },

    // 清空消息
    clearMessages: () => {
      set({ messages: [], error: null });
    },

    // 设置API Key
    setApiKey: (apiKey: string) => {
      localStorage.setItem('zhipu_api_key', apiKey);
      set({ apiKey, error: null });
    },

    // 设置模型
    setSelectedModel: (model: string) => {
      set({ selectedModel: model });
    },

    // 设置Agent
    setSelectedAgent: (agentId: number) => {
      set({ selectedAgent: agentId });
    },

    // 清空指定Agent的消息
    clearAgentMessages: (agentId: number) => {
      const state = get();
      const filteredMessages = state.messages.filter(msg => msg.agentId !== agentId);
      set({ messages: filteredMessages });
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
  };
});
