import { useTranslation } from 'react-i18next'
import { useI18nStore } from '@/store/i18nStore'
import type { TranslationNamespace } from '@/i18n/types'

/**
 * 自定义 i18n Hook
 * 封装 react-i18next 的 useTranslation，提供更好的类型支持和便捷方法
 * 
 * @param ns - 命名空间，默认为 'common'
 * @returns 翻译函数和相关状态
 * 
 * @example
 * ```tsx
 * const { t, currentLanguage, changeLanguage } = useI18n('chat')
 * 
 * return <div>{t('send')}</div>
 * ```
 */
export const useI18n = (ns: TranslationNamespace = 'common') => {
  const { t, i18n, ready } = useTranslation(ns)
  const { 
    currentLanguage, 
    changeLanguage, 
    getCurrentLanguageConfig,
    getTextDirection,
    isLoading 
  } = useI18nStore()

  return {
    // 翻译函数
    t,
    
    // i18next 实例
    i18n,
    
    // 是否准备就绪
    ready,
    
    // 当前语言
    currentLanguage,
    
    // 切换语言
    changeLanguage,
    
    // 获取当前语言配置
    languageConfig: getCurrentLanguageConfig(),
    
    // 文字方向
    textDirection: getTextDirection(),
    
    // 是否为 RTL 语言
    isRTL: getTextDirection() === 'rtl',
    
    // 是否正在加载
    isLoading,
  }
}

/**
 * 使用多个命名空间的翻译
 * 
 * @param namespaces - 命名空间数组
 * @returns 翻译函数和相关状态
 * 
 * @example
 * ```tsx
 * const { t } = useI18nMultiple(['common', 'chat'])
 * 
 * return (
 *   <div>
 *     <div>{t('common:loading')}</div>
 *     <div>{t('chat:send')}</div>
 *   </div>
 * )
 * ```
 */
export const useI18nMultiple = (namespaces: TranslationNamespace[]) => {
  const { t, i18n, ready } = useTranslation(namespaces)
  const { 
    currentLanguage, 
    changeLanguage, 
    getCurrentLanguageConfig,
    getTextDirection,
    isLoading 
  } = useI18nStore()

  return {
    t,
    i18n,
    ready,
    currentLanguage,
    changeLanguage,
    languageConfig: getCurrentLanguageConfig(),
    textDirection: getTextDirection(),
    isRTL: getTextDirection() === 'rtl',
    isLoading,
  }
}

