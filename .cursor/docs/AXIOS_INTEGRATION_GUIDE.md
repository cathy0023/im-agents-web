# Axios 集成指南

本文档描述了项目中 Axios 的集成和使用方法。

## ✅ 已完成的更改

### 1. 📦 依赖安装
- 安装了 `axios` 依赖包
- 项目现在使用 axios 作为主要的 HTTP 客户端

### 2. 🔧 Vite 代理配置
**文件**: `vite.config.ts`
```typescript
server: {
  proxy: {
    '/webapi': {
      target: 'https://jirui.test.mgvai.cn',
      changeOrigin: true,
      secure: true,
      rewrite: (path) => path.replace(/^\/webapi/, '/webapi')
    }
  }
}
```
- 配置了 `/webapi` 路径的代理转发
- 所有以 `/webapi` 开头的请求都会被转发到 `https://jirui.test.mgvai.cn`

### 3. 🌐 API 客户端重构
**文件**: `src/lib/api.ts`

#### 新增功能:
- **WebApiClient 类**: 专门处理 `/webapi` 路径的请求
- **ZhipuApiClient 类**: 保留原有智谱AI功能，重构为使用 axios
- **统一的错误处理**: `handleApiError` 函数
- **请求/响应拦截器**: 自动添加认证头、性能监控、错误处理

#### 客户端实例:
```typescript
// Web API 客户端 (baseURL: '/webapi')
export const webApiClient = new WebApiClient()

// 智谱AI客户端 (baseURL: 'https://open.bigmodel.cn/api/paas/v4')
export const zhipuApiClient = new ZhipuApiClient()
```

#### 主要方法:
- `webApiClient.getUserInfo()` - 获取用户信息 (`/profile/get`)
- `webApiClient.get/post/put/delete()` - 通用HTTP方法
- `zhipuApiClient.get/post/put/delete()` - 智谱AI专用方法

### 4. 🔐 Session 管理 (基于 Cookie)
**文件**: `src/lib/api.ts` (SessionManager)

Session 管理基于 Cookie 实现，支持与原有项目共享 session：

```typescript
// 配置 session cookie 名称（默认: 'session'）
SessionManager.setCookieName('your_session_cookie_name')

// 配置 cookie 默认选项
SessionManager.setDefaultOptions({
  path: '/',
  domain: '.yourdomain.com',
  secure: true,
  sameSite: 'lax'
})

// 检查是否有 session cookie
SessionManager.hasSession()

// 获取 session 值
SessionManager.getSessionValue()

// 设置 session cookie
SessionManager.setSessionCookie(sessionValue, {
  expires: 7, // 7天后过期
  path: '/'
})

// 清除 session cookie
SessionManager.clearSession()

// 初始化 session（应用启动时调用）
SessionManager.initializeSession()

// 获取所有 cookies (调试用)
SessionManager.getAllCookies()
```

#### Session 工作原理:
1. **Cookie 自动携带**: WebAPI 客户端配置了 `withCredentials: true`，所有请求自动携带 cookie
2. **Session 验证**: 调用 `/webapi/profile/get` 接口验证 session 有效性
3. **错误处理**: Session 验证失败时不会自动清除 cookie，由用户决定处理方式

### 5. 👤 用户状态管理
**文件**: `src/store/userStore.ts`

新增用户状态管理 store:
- 用户信息存储
- 认证状态管理
- 自动session初始化
- 登录/登出功能

**主要方法**:
```typescript
const { userInfo, isAuthenticated, initializeSession, login, logout } = useUserStore()
```

### 6. 🔄 应用启动时的Session检查
**文件**: `src/App.tsx`

在应用启动时自动调用 `initializeSession()`:
- 检查本地是否有存储的 token
- 如果有token，自动调用 `/profile/get` 接口验证
- 设置用户信息和认证状态

### 7. 📡 SSE功能保留和优化
**文件**: `src/lib/sse.ts`

- 保留了原有的 `createZhipuChatStream` 函数
- 新增了通用的 `createStreamRequest` 函数
- 增强了错误处理和超时管理
- 与新的 axios 架构完全兼容

### 8. 📝 类型定义优化
**文件**: `src/types/user.ts`

新增完整的用户相关类型定义:
- `UserInfo` - 用户基本信息
- `LoginRequest/Response` - 登录相关
- `RegisterRequest/Response` - 注册相关
- `UserSettings` - 用户设置
- `UserApiService` - API接口类型

## 🚀 使用方法

### Web API 调用示例

```typescript
import { webApiClient } from '@/lib/api'

// 获取用户信息
try {
  const userInfo = await webApiClient.getUserInfo()
  console.log('用户信息:', userInfo)
} catch (error) {
  console.error('获取用户信息失败:', error)
}

// 通用 GET 请求
const data = await webApiClient.get('/some/endpoint')

// 通用 POST 请求
const result = await webApiClient.post('/some/endpoint', { data: 'value' })
```

### 智谱AI调用示例

```typescript
import { zhipuApiClient } from '@/lib/api'

// 设置API Key
zhipuApiClient.setApiKey('your-api-key')

// 发送聊天请求
const response = await zhipuApiClient.post('/chat/completions', {
  model: 'glm-4',
  messages: [{ role: 'user', content: 'Hello' }]
})
```

### Session管理示例 (基于 Cookie)

```typescript
import { SessionManager } from '@/lib/api'
import { useUserStore } from '@/store/userStore'

// 配置 session cookie 名称（在应用启动时配置）
SessionManager.setCookieName('laravel_session') // 或其他项目使用的cookie名称

// 在组件中使用用户状态
const { userInfo, isAuthenticated, login, logout } = useUserStore()

// 手动设置 session（通常在登录成功后调用）
login('session_value_from_server', { 
  remember: true,  // 是否持久化
  expires: 7       // 过期天数
})

// 手动操作 session cookie
SessionManager.setSessionCookie('new_session_value', {
  expires: 30,     // 30天后过期
  secure: true,    // HTTPS环境
  sameSite: 'lax'
})

// 检查 session 状态
if (SessionManager.hasSession()) {
  const sessionValue = SessionManager.getSessionValue()
  console.log('当前 session:', sessionValue)
}

// 登出（清除 session cookie）
logout()

// 调试：查看所有 cookies
console.log('所有 cookies:', SessionManager.getAllCookies())
```

## 🔧 配置说明

### 环境变量
- `VITE_ZHIPU_API_KEY` - 智谱AI的API Key (可选)

### 请求拦截器功能
- 自动添加 `Authorization` 头
- 请求性能监控和日志
- 自动错误处理

### 响应拦截器功能
- 统一错误处理
- 401错误自动处理
- 性能监控和日志

## 🛠️ 开发注意事项

1. **本地开发**: 所有 `/webapi` 请求会自动代理到 `https://jirui.test.mgvai.cn`
2. **认证**: session 基于 Cookie 存储，支持与原项目共享
3. **跨域配置**: WebAPI 客户端配置了 `withCredentials: true`，自动携带 cookie
4. **Cookie 配置**: 需要根据实际项目配置正确的 cookie 名称
5. **错误处理**: 所有API错误都通过 `ApiError` 类统一处理
6. **SSE流**: 保留原有流式处理功能，兼容新架构
7. **类型安全**: 全部使用 TypeScript 严格类型检查

### Session Cookie 配置指南

#### 在应用启动时配置 Cookie 名称
```typescript
// 在 main.tsx 或 App.tsx 中
import { SessionManager } from '@/lib/api'

// 根据实际项目配置 cookie 名称
SessionManager.setCookieName('laravel_session')  // Laravel 项目
// 或
SessionManager.setCookieName('PHPSESSID')        // PHP 项目
// 或
SessionManager.setCookieName('connect.sid')      // Express.js 项目
```

#### 配置 Cookie 选项
```typescript
// 配置 cookie 默认选项
SessionManager.setDefaultOptions({
  path: '/',
  domain: '.yourdomain.com', // 支持子域名
  secure: true,              // 生产环境启用 HTTPS
  sameSite: 'lax'           // 跨站请求策略
})
```

## 📋 API接口清单

### Web API (`/webapi`)
- `GET /profile/get` - 获取用户信息

### 智谱AI API
- `POST /chat/completions` - 聊天接口 (支持SSE流式)

## 🔍 调试和监控

所有API请求都会在控制台输出日志:
- `[API Request]` - 请求开始
- `[API Response]` - 请求完成 (包含耗时)
- `[API Error]` - 请求失败 (包含错误详情)

## ✅ 验证清单

- [x] axios 依赖已安装
- [x] Vite 代理配置正确
- [x] API 客户端功能正常
- [x] Session 管理工作正常
- [x] 用户状态管理集成
- [x] 应用启动时自动检查session
- [x] SSE功能保留并优化
- [x] 类型定义完整
- [x] 项目可以正常构建
- [x] 没有lint错误

## 🎯 下一步建议

1. **测试登录流程**: 实现完整的登录表单和认证流程
2. **API接口扩展**: 根据后端API添加更多接口封装
3. **错误处理优化**: 添加用户友好的错误提示组件
4. **缓存策略**: 为频繁请求的数据添加缓存机制
5. **离线支持**: 添加网络状态检测和离线处理
