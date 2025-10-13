/**
 * 功能开关配置
 * 用于控制应用中各功能模块的启用/禁用
 */
export const featuresConfig = {
  /**
   * WebSocket 功能
   */
  websocket: {
    enabled: true,
    autoConnect: true,
    reconnectInterval: 3000,
  },

  /**
   * SSE (Server-Sent Events) 功能
   */
  sse: {
    enabled: true,
  },

  /**
   * 国际化
   */
  i18n: {
    enabled: true,
    defaultLanguage: 'zh' as const,
    supportedLanguages: ['zh', 'en', 'ar'] as const,
  },

  /**
   * 主题切换
   */
  theme: {
    enabled: true,
    defaultTheme: 'light' as const,
  },

  /**
   * 调试功能
   */
  debug: {
    enabled: import.meta.env.DEV,
    showAgentsDebug: import.meta.env.DEV,
  },

  /**
   * Agents 功能
   */
  agents: {
    enabled: true,
    showAgentList: true,
  },

  /**
   * 数据视图功能
   */
  dataEyes: {
    enabled: true,
    showCharts: true,
  },

  /**
   * 联系人功能
   */
  contacts: {
    enabled: true,
  },
} as const

export type FeaturesConfig = typeof featuresConfig

