# API 模块文档

## 📁 目录结构

```
src/api/
├── index.ts                    # 统一导出入口
├── client.ts                   # HTTP客户端基础层
├── types.ts                    # 通用API类型定义
└── modules/                    # 业务模块目录
    ├── index.ts                # 模块统一导出
    └── agents/                 # Agents业务模块
        └── index.ts            # Agents模块实现
```

## 🚀 快速开始

### 基本使用

```typescript
import { agentsApi } from '@/api'

// 获取agents列表
const response = await agentsApi.getAgentsList('user123')
console.log(response.agents)

// 获取单个agent详情
const agent = await agentsApi.getAgentDetail('agent456')
console.log(agent.agent_name)
```

### 在React组件中使用

```typescript
import React, { useEffect, useState } from 'react'
import { agentsApi } from '@/api'
import type { Agent } from '@/api'

const AgentsList: React.FC = () => {
  const [agents, setAgents] = useState<Agent[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const loadAgents = async () => {
      try {
        setLoading(true)
        const response = await agentsApi.getAgentsList('user123')
        setAgents(response.agents)
      } catch (error) {
        console.error('Failed to load agents:', error)
      } finally {
        setLoading(false)
      }
    }

    loadAgents()
  }, [])

  return (
    <div>
      {loading ? (
        <div>Loading...</div>
      ) : (
        agents.map(agent => (
          <div key={agent.uuid}>{agent.agent_name}</div>
        ))
      )}
    </div>
  )
}
```

## 📋 API 接口

### Agents模块

#### `getAgentsList(userId: string)`
获取指定用户的AI助手列表

**参数:**
- `userId`: 用户ID

**返回:**
```typescript
{
  agents: Agent[]
  total_count: number
  timestamp: number
}
```

#### `getAgentDetail(agentId: string)`
获取单个Agent的详细信息

**参数:**
- `agentId`: Agent ID

**返回:**
```typescript
Agent {
  agent_key: string
  agent_name: string
  agent_type: string
  description: string
  capabilities: string[]
  status: 'active' | 'inactive'
  avatar: string
  uuid: string
  config: AgentConfig
}
```

## 🔧 直接使用HTTP客户端

```typescript
import { webApiClient } from '@/api'

// 直接发送GET请求
const data = await webApiClient.get('/custom/endpoint')

// 直接发送POST请求
const result = await webApiClient.post('/custom/endpoint', { data: 'value' })
```

## 📡 API响应格式处理

### 标准响应格式
所有API接口返回统一的响应格式：
```typescript
{
  code: number,     // 状态码，200表示成功
  msg: string,      // 响应消息
  results: T        // 实际数据内容
}
```

### 自动响应处理
HTTP客户端会自动处理响应格式：
- **成功响应** (code: 200): 自动提取并返回 `results` 字段的内容
- **失败响应** (code ≠ 200): 自动抛出 `ApiError` 异常，包含错误信息

```typescript
// 示例：API返回
{
  "code": 200,
  "msg": "Success",
  "results": {
    "agents": [...],
    "total_count": 4,
    "timestamp": 1759136941
  }
}

// 客户端自动提取results内容
const response = await agentsApi.getAgentsList()
// response 直接是 results 的内容：
// { agents: [...], total_count: 4, timestamp: 1759136941 }
```

### 错误处理
```typescript
try {
  const data = await webApiClient.get('/some/endpoint')
} catch (error) {
  if (error instanceof ApiError) {
    console.log('错误码:', error.code)     // API返回的code
    console.log('错误信息:', error.message) // API返回的msg
    console.log('HTTP状态:', error.status)  // HTTP状态码
  }
}
```

## 🔐 Session管理

```typescript
import { SessionManager } from '@/api'

// 检查session
if (SessionManager.hasSession()) {
  const userInfo = await SessionManager.initializeSession()
}

// 设置session
SessionManager.setSessionCookie('session_value')

// 清除session
SessionManager.clearSession()
```

## 🎯 类型安全

所有API都提供完整的TypeScript类型支持：

```typescript
import type { Agent, AgentConfig, GetAgentsListResponse } from '@/api'
```

## 🔄 错误处理

所有API调用都会抛出标准化的错误：

```typescript
import { ApiError } from '@/api'

try {
  await agentsApi.getAgentsList('user123')
} catch (error) {
  if (error instanceof ApiError) {
    console.error('API Error:', error.message, error.status)
  }
}
```

## 📈 扩展新模块

要添加新的业务模块，请按照以下步骤：

1. 在 `src/api/modules/` 下创建新目录
2. 实现业务逻辑和类型定义
3. 在 `src/api/modules/index.ts` 中导出
4. 在 `src/api/index.ts` 中添加导出

示例：
```
src/api/modules/
├── agents/
├── chat/          # 新模块
└── user/          # 新模块
```
