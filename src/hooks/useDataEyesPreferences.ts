import { useState, useEffect } from 'react'
import type { DataEyesPreferences } from '@/types/dataEyes'

// 默认偏好设置
const DEFAULT_PREFERENCES: DataEyesPreferences = {
  chatEnabled: true,
  bubblePosition: 'bottom-left',
  defaultChatActive: false,
  animationEnabled: !window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

// 本地存储key
const STORAGE_KEY = 'dataEyesPreferences'

/**
 * DataEyes用户偏好设置Hook
 */
export const useDataEyesPreferences = () => {
  const [preferences, setPreferences] = useState<DataEyesPreferences>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored)
        return { ...DEFAULT_PREFERENCES, ...parsed }
      }
    } catch (error) {
      console.warn('Failed to load DataEyes preferences:', error)
    }
    return DEFAULT_PREFERENCES
  })

  // 保存偏好设置到localStorage
  const updatePreferences = (updates: Partial<DataEyesPreferences>) => {
    const newPreferences = { ...preferences, ...updates }
    setPreferences(newPreferences)
    
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newPreferences))
    } catch (error) {
      console.warn('Failed to save DataEyes preferences:', error)
    }
  }

  return {
    preferences,
    updatePreferences
  }
}

/**
 * 响应式断点Hook
 */
export const useResponsiveBreakpoints = () => {
  const [breakpoint, setBreakpoint] = useState<'mobile' | 'tablet' | 'desktop'>(() => {
    if (typeof window === 'undefined') return 'desktop'
    
    const width = window.innerWidth
    if (width < 768) return 'mobile'
    if (width < 1024) return 'tablet'
    return 'desktop'
  })

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth
      if (width < 768) {
        setBreakpoint('mobile')
      } else if (width < 1024) {
        setBreakpoint('tablet')
      } else {
        setBreakpoint('desktop')
      }
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return {
    breakpoint,
    isMobile: breakpoint === 'mobile',
    isTablet: breakpoint === 'tablet',
    isDesktop: breakpoint === 'desktop'
  }
}

/**
 * 动画偏好Hook
 */
export const useAnimationPreferences = () => {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(
    () => window.matchMedia('(prefers-reduced-motion: reduce)').matches
  )

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches)
    }

    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])

  return {
    prefersReducedMotion,
    animationEnabled: !prefersReducedMotion
  }
}
