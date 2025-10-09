import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import i18n from '@/i18n'
import type { Language } from '@/i18n/types'
import { LANGUAGES } from '@/i18n/types'

/**
 * i18n 状态接口
 */
interface I18nState {
  // 当前语言
  currentLanguage: Language
  
  // 是否正在加载
  isLoading: boolean
  
  // 切换语言
  changeLanguage: (lang: Language) => Promise<void>
  
  // 获取当前语言配置
  getCurrentLanguageConfig: () => typeof LANGUAGES[Language]
  
  // 获取文字方向（LTR/RTL）
  getTextDirection: () => 'ltr' | 'rtl'
}

/**
 * i18n Store - 使用 zustand 管理国际化状态
 */
export const useI18nStore = create<I18nState>()(
  persist(
    (set, get) => ({
      // 初始化为中文
      currentLanguage: 'zh',
      isLoading: false,

      // 切换语言
      changeLanguage: async (lang: Language) => {
        set({ isLoading: true })
        
        try {
          // 切换 i18next 语言
          await i18n.changeLanguage(lang)
          
          // 更新 HTML lang 属性
          document.documentElement.lang = lang
          
          // 更新文字方向
          const direction = LANGUAGES[lang].dir
          document.documentElement.dir = direction
          
          // 更新状态
          set({ 
            currentLanguage: lang, 
            isLoading: false 
          })
          
          console.log(`🌍 [i18n] Language changed to: ${lang} (${LANGUAGES[lang].nativeName})`)
        } catch (error) {
          console.error('🌍 [i18n] Failed to change language:', error)
          set({ isLoading: false })
        }
      },

      // 获取当前语言配置
      getCurrentLanguageConfig: () => {
        const { currentLanguage } = get()
        return LANGUAGES[currentLanguage]
      },

      // 获取文字方向
      getTextDirection: () => {
        const { currentLanguage } = get()
        return LANGUAGES[currentLanguage].dir
      },
    }),
    {
      name: 'i18n-storage', // localStorage key
      partialState: (state) => ({
        currentLanguage: state.currentLanguage, // 只持久化语言设置
      }),
    }
  )
)

