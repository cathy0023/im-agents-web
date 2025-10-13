import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'

// 导入翻译资源
import zhCommon from './resources/zh/common.json'
import zhChat from './resources/zh/chat.json'
import zhAgents from './resources/zh/agents.json'
import zhUI from './resources/zh/ui.json'

import enCommon from './resources/en/common.json'
import enChat from './resources/en/chat.json'
import enAgents from './resources/en/agents.json'
import enUI from './resources/en/ui.json'

import arCommon from './resources/ar/common.json'
import arChat from './resources/ar/chat.json'
import arAgents from './resources/ar/agents.json'
import arUI from './resources/ar/ui.json'

// 翻译资源配置
const resources = {
  zh: {
    common: zhCommon,
    chat: zhChat,
    agents: zhAgents,
    ui: zhUI,
  },
  en: {
    common: enCommon,
    chat: enChat,
    agents: enAgents,
    ui: enUI,
  },
  ar: {
    common: arCommon,
    chat: arChat,
    agents: arAgents,
    ui: arUI,
  },
}

// i18n 配置
i18n
  .use(LanguageDetector) // 自动检测用户语言
  .use(initReactI18next) // 将 i18n 传递给 react-i18next
  .init({
    resources,
    fallbackLng: 'zh', // 默认语言：中文
    defaultNS: 'common', // 默认命名空间
    ns: ['common', 'chat', 'agents', 'ui'], // 所有命名空间
    
    interpolation: {
      escapeValue: false, // React 已经安全处理
    },
    
    detection: {
      // 检测顺序
      order: ['localStorage', 'navigator', 'htmlTag'],
      // 缓存语言设置
      caches: ['localStorage'],
      // localStorage 的 key
      lookupLocalStorage: 'i18nextLng',
    },
    
    // 调试模式（仅开发环境）
    debug: process.env.NODE_ENV === 'development',
  })

export default i18n

