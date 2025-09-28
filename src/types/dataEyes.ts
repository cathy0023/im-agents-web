// DataEyes 聊天配置相关类型定义

export interface DataEyesConfig {
  chatEnabled: boolean        // 聊天功能是否启用
  isChatActive: boolean      // 聊天界面是否激活
  bubbleVisible: boolean     // 聊天气泡是否可见
  layoutMode: 'chart-only' | 'chat-active'  // 布局模式
}

export interface DataEyesLayoutProps {
  agentId: number
  chatEnabled?: boolean
  className?: string
  chatBubblePosition?: 'bottom-left' | 'bottom-side-left'
  isAgentListCollapsed?: boolean
}

export interface AdaptiveContainerProps {
  mode: 'chart-only' | 'chat-active'
  chatComponent?: React.ReactNode
  chartComponent: React.ReactNode
  transition?: {
    duration: number
    easing: string
  }
  splitRatio?: number // 默认0.5 (1:1分割)
}

export interface ChatBubblePosition {
  x: number
  y: number
}

export interface DataEyesPreferences {
  chatEnabled: boolean
  bubblePosition: 'bottom-left' | 'bottom-side-left'
  defaultChatActive: boolean
  animationEnabled: boolean
}
