# WebSocket 集成说明

## 概述

本项目已成功集成 WebSocket 功能，提供实时双向通信能力。WebSocket 系统采用单例模式设计，确保全局只有一个连接实例，并包含完整的心跳机制、自动重连和错误处理功能。

## 核心特性

### ✅ 已实现功能

1. **单例模式 WebSocket 管理器**
   - 全局唯一连接实例
   - 自动连接管理
   - 资源清理和销毁

2. **心跳机制**
   - 30秒间隔心跳检测
   - 10秒心跳超时处理
   - 自动连接健康检查

3. **自动重连机制**
   - 最多5次重连尝试
   - 3秒重连间隔
   - 指数退避策略

4. **完整的状态管理**
   - 基于 zustand 的状态管理
   - 连接状态追踪
   - 消息历史记录

5. **类型安全**
   - 完整的 TypeScript 类型定义
   - 消息类型守卫函数
   - 严格的类型检查

## 文件结构

```
src/
├── types/
│   └── websocket.ts          # WebSocket 类型定义
├── lib/
│   └── websocket.ts          # WebSocket 单例管理器
├── store/
│   └── websocketStore.ts     # WebSocket 状态管理
├── utils/
│   └── websocket-test-helper.ts # WebSocket 测试工具
└── components/
    ├── WebSocketTest.tsx     # WebSocket 测试页面
    └── MessageInput.tsx      # 集成 WebSocket 的消息输入
```

## 使用方法

### 1. 基础连接

```typescript
import { useWebSocketActions, useWebSocketConnection } from '@/store/websocketStore'

const MyComponent = () => {
  const { connect, disconnect } = useWebSocketActions()
  const { isConnected, connectionStatus } = useWebSocketConnection()

  // 连接 WebSocket
  const handleConnect = () => {
    connect({
      url: 'wss://jirui.test.mgvai.cn/ws?session=',
      reconnectAttempts: 5,
      reconnectInterval: 3000,
      heartbeat: {
        interval: 30000,
        timeout: 10000,
        message: 'ping'
      }
    })
  }

  return (
    <div>
      <button onClick={handleConnect} disabled={isConnected}>
        连接
      </button>
      <span>状态: {connectionStatus}</span>
    </div>
  )
}
```

### 2. 发送消息

```typescript
import { useWebSocketActions } from '@/store/websocketStore'

const ChatComponent = () => {
  const { sendMessage, sendChatMessage } = useWebSocketActions()

  // 发送聊天消息
  const sendChat = () => {
    sendChatMessage('Hello World', 'user', 1)
  }

  // 发送自定义消息
  const sendCustom = () => {
    sendMessage({
      id: Date.now().toString(),
      type: 'system_message',
      timestamp: Date.now(),
      data: {
        content: 'Custom message',
        level: 'info'
      }
    })
  }

  return (
    <div>
      <button onClick={sendChat}>发送聊天消息</button>
      <button onClick={sendCustom}>发送自定义消息</button>
    </div>
  )
}
```

### 3. 接收消息

```typescript
import { useChatMessages, useSystemMessages } from '@/store/websocketStore'

const MessageDisplay = () => {
  const chatMessages = useChatMessages(1) // 获取 agentId=1 的聊天消息
  const systemMessages = useSystemMessages() // 获取系统消息

  return (
    <div>
      <h3>聊天消息</h3>
      {chatMessages.map(msg => (
        <div key={msg.id}>
          <strong>{msg.data.role}:</strong> {msg.data.content}
        </div>
      ))}

      <h3>系统消息</h3>
      {systemMessages.map(msg => (
        <div key={msg.id}>
          <span className={`level-${msg.data.level}`}>
            {msg.data.content}
          </span>
        </div>
      ))}
    </div>
  )
}
```

### 4. 连接状态监控

```typescript
import { useWebSocketConnection } from '@/store/websocketStore'

const App = () => {
  const { connectionStatus, isConnected, error } = useWebSocketConnection()
  
  return (
    <div>
      <header>
        <h1>我的应用</h1>
        <div className="flex items-center space-x-2">
          <div className={`w-2 h-2 rounded-full ${
            isConnected ? 'bg-emerald-500' : 'bg-red-500'
          }`} />
          <span>{connectionStatus}</span>
        </div>
      </header>
      {/* 其他内容 */}
    </div>
  )
}
```

## 消息格式

### 聊天消息
```typescript
{
  id: string
  type: 'chat_message'
  timestamp: number
  data: {
    content: string
    role: 'user' | 'assistant'
    agentId?: number
  }
}
```

### 系统消息
```typescript
{
  id: string
  type: 'system_message'
  timestamp: number
  data: {
    content: string
    level: 'info' | 'warning' | 'error'
  }
}
```

### 心跳消息
```typescript
{
  id: string
  type: 'heartbeat'
  timestamp: number
  data: {
    ping: boolean
  }
}
```

## 配置选项

```typescript
interface WebSocketConfig {
  url: string                    // WebSocket 连接地址
  reconnectAttempts?: number     // 重连尝试次数 (默认: 5)
  reconnectInterval?: number     // 重连间隔毫秒 (默认: 3000)
  heartbeat?: {
    interval: number             // 心跳间隔毫秒 (默认: 30000)
    timeout: number              // 心跳超时毫秒 (默认: 10000)
    message: string              // 心跳消息 (默认: 'ping')
  }
  debug?: boolean                // 调试模式 (默认: false)
}
```

## 调试工具

项目提供了完整的 WebSocket 测试页面，访问 `/debug/websocket-test` 即可使用，提供以下功能：

- 连接状态实时监控
- 自定义消息发送
- 快速测试按钮（简单文本、JSON、特殊字符、心跳）
- 自动化测试序列
- 详细的控制台日志输出
- 消息历史查看

使用方法：
```typescript
// 在开发环境中访问
// http://localhost:5173/debug/websocket-test

// 或在代码中使用 WebSocket Store
import { useWebSocketActions, useWebSocketConnection } from '@/store/websocketStore'

const MyComponent = () => {
  const { connect, sendMessage } = useWebSocketActions()
  const { isConnected } = useWebSocketConnection()
  
  // 连接和发送消息
}
```

## 集成到聊天系统

WebSocket 已完全集成到现有的聊天系统中：

1. **MessageInput 组件** - 自动使用 WebSocket 发送消息，HTTP 作为备选
2. **ChatArea 组件** - 同时显示 HTTP 和 WebSocket 消息
3. **状态指示器** - 实时显示连接状态

## 错误处理

系统包含完善的错误处理机制：

- 连接失败自动重试
- 心跳超时检测
- 消息发送失败提示
- 网络异常恢复

## 性能优化

- 消息历史限制 (最多1000条)
- 自动清理过期连接
- 内存泄漏防护
- 定时器管理

## 安全考虑

- Session cookie 自动获取
- 连接 URL 验证
- 消息格式校验
- XSS 防护

## 后续扩展

系统设计支持以下扩展：

1. **组件渲染消息** - 支持服务端推送 React 组件
2. **文件传输** - 支持二进制数据传输
3. **房间管理** - 支持多房间聊天
4. **权限控制** - 支持基于角色的消息过滤

## 故障排除

### 常见问题

1. **连接失败**
   - 检查 session cookie 是否存在
   - 验证 WebSocket URL 是否正确
   - 确认网络连接正常

2. **消息发送失败**
   - 检查连接状态
   - 验证消息格式
   - 查看控制台错误信息

3. **心跳超时**
   - 检查网络稳定性
   - 调整心跳间隔设置
   - 查看服务端日志

### 调试步骤

1. 启用调试模式：`connect({ debug: true })`
2. 使用 WebSocket 测试页面
3. 查看浏览器控制台日志
4. 检查网络面板 WebSocket 连接

## 总结

WebSocket 集成已完成，提供了完整的实时通信能力。系统具有良好的可扩展性、稳定性和易用性，可以满足当前和未来的业务需求。

