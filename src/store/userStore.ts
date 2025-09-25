import { create } from 'zustand'
import { SessionManager } from '../lib/api'
import type { UserInfo } from '../types/user'

interface UserState {
  // 状态
  userInfo: UserInfo | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null

  // 动作
  setUserInfo: (userInfo: UserInfo | null) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  initializeSession: () => Promise<void>
  login: (token: string, remember?: boolean) => void
  logout: () => void
  clearError: () => void
}

export const useUserStore = create<UserState>((set, get) => ({
  // 初始状态
  userInfo: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  // 设置用户信息
  setUserInfo: (userInfo) => {
    set({
      userInfo,
      isAuthenticated: !!userInfo,
      error: null
    })
  },

  // 设置加载状态
  setLoading: (loading) => {
    set({ isLoading: loading })
  },

  // 设置错误信息
  setError: (error) => {
    set({ error })
  },

  // 清除错误信息
  clearError: () => {
    set({ error: null })
  },

  // 初始化session（应用启动时调用）
  initializeSession: async () => {
    const { setLoading, setUserInfo, setError } = get()
    
    try {
      setLoading(true)
      setError(null)
      
      const userInfo = await SessionManager.initializeSession()
      setUserInfo(userInfo)
      
      if (userInfo) {
        console.log('用户session初始化成功:', userInfo)
      } else {
        console.log('无有效session，用户未登录')
      }
    } catch (error) {
      console.error('Session初始化失败:', error)
      setError(error instanceof Error ? error.message : '初始化失败')
      setUserInfo(null)
    } finally {
      setLoading(false)
    }
  },

  // 登录 (基于Cookie)
  login: (sessionValue: string, options?: { expires?: number; remember?: boolean }) => {
    const { setLoading, setError } = get()
    
    setLoading(true)
    setError(null)
    
    try {
      // 设置session cookie
      const cookieOptions = options?.remember ? { 
        expires: options.expires || 7, // 默认7天
        path: '/'
      } : { path: '/' }; // session cookie
      
      SessionManager.setSessionCookie(sessionValue, cookieOptions)
      
      // 登录后需要重新初始化session以获取用户信息
      get().initializeSession()
    } catch (error) {
      console.error('登录失败:', error)
      setError('登录失败')
      setLoading(false)
    }
  },

  // 登出
  logout: () => {
    SessionManager.clearSession()
    set({
      userInfo: null,
      isAuthenticated: false,
      error: null
    })
    console.log('用户已登出')
  }
}))
