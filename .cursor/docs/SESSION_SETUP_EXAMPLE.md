# Session 设置示例

## 📋 快速设置指南

### 1. 配置 Session Cookie 名称

在应用启动时（通常在 `main.tsx` 或 `App.tsx` 中）配置 cookie 名称：

```typescript
import { SessionManager } from '@/lib/api'

// 根据你的原项目使用的 cookie 名称配置
SessionManager.setCookieName('your_session_cookie_name')

// 例如：
// SessionManager.setCookieName('laravel_session')  // Laravel 项目
// SessionManager.setCookieName('PHPSESSID')        // PHP 项目  
// SessionManager.setCookieName('connect.sid')      // Express.js 项目
```

### 2. 配置 Cookie 选项（可选）

```typescript
// 配置 cookie 默认选项
SessionManager.setDefaultOptions({
  path: '/',
  domain: '.yourdomain.com', // 如果需要支持子域名
  secure: true,              // 生产环境启用 HTTPS
  sameSite: 'lax'           // 跨站请求策略
})
```

### 3. 使用示例

```typescript
import { SessionManager } from '@/lib/api'
import { useUserStore } from '@/store/userStore'

// 在组件中
const { userInfo, isAuthenticated, initializeSession } = useUserStore()

// 检查是否有 session
if (SessionManager.hasSession()) {
  console.log('用户有 session')
  const sessionValue = SessionManager.getSessionValue()
  console.log('Session 值:', sessionValue)
}

// 手动初始化 session
await initializeSession()

// 检查认证状态
if (isAuthenticated) {
  console.log('用户已登录:', userInfo)
}
```

## 🔧 完整配置示例

### 在 main.tsx 中配置

```typescript
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import { SessionManager } from './lib/api'

// 配置 session cookie 名称
SessionManager.setCookieName('laravel_session') // 替换为你的实际 cookie 名称

// 可选：配置 cookie 选项
SessionManager.setDefaultOptions({
  path: '/',
  secure: process.env.NODE_ENV === 'production', // 生产环境启用
  sameSite: 'lax'
})

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
```

## 🐛 调试技巧

### 查看所有 Cookies

```typescript
// 在浏览器控制台或代码中
import { SessionManager } from '@/lib/api'

console.log('所有 cookies:', SessionManager.getAllCookies())
```

### 检查特定 Cookie

```typescript
// 检查当前配置的 session cookie
const hasSession = SessionManager.hasSession()
const sessionValue = SessionManager.getSessionValue()

console.log('Has session:', hasSession)
console.log('Session value:', sessionValue)
```

### 手动设置测试 Cookie

```typescript
// 用于测试的临时 session
SessionManager.setSessionCookie('test_session_value', {
  expires: 1 // 1天后过期
})
```

## ⚠️ 注意事项

1. **Cookie 名称**: 必须与原项目使用的 cookie 名称完全一致
2. **跨域配置**: 确保后端支持 `Access-Control-Allow-Credentials: true`
3. **HTTPS**: 生产环境建议启用 `secure: true`
4. **域名配置**: 如果需要跨子域名，正确配置 `domain` 选项

## 🔄 工作流程

```
1. 应用启动 -> 配置 cookie 名称
2. SessionManager.hasSession() -> 检查是否有 session cookie
3. 如果有 -> 调用 /webapi/profile/get 验证 session
4. 验证成功 -> 设置用户信息和认证状态
5. 验证失败 -> 返回 null，用户需要重新登录
```

这样配置后，你的 React 应用就能够读取并使用与原项目共享的 session cookie 了！
