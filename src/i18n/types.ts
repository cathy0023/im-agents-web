/**
 * 支持的语言类型
 */
export type Language = 'zh' | 'en' | 'ar'

/**
 * 语言配置信息
 */
export interface LanguageConfig {
  code: Language
  name: string
  nativeName: string
  dir: 'ltr' | 'rtl' // 文字方向
  flag: string // emoji 旗帜
}

/**
 * 所有支持的语言配置
 */
export const LANGUAGES: Record<Language, LanguageConfig> = {
  zh: {
    code: 'zh',
    name: 'Chinese',
    nativeName: '简体中文',
    dir: 'ltr',
    flag: '🇨🇳',
  },
  en: {
    code: 'en',
    name: 'English',
    nativeName: 'English',
    dir: 'ltr',
    flag: '🇺🇸',
  },
  ar: {
    code: 'ar',
    name: 'Arabic',
    nativeName: 'العربية',
    dir: 'rtl',
    flag: '🇸🇦',
  },
}

/**
 * 翻译命名空间
 */
export type TranslationNamespace = 'common' | 'chat' | 'agents' | 'ui'

