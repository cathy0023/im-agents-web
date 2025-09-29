# WebSocket 数据流转详解

## 🔄 完整数据流转图

```mermaid
graph TD
    %% 用户层
    A[用户操作] --> B[React组件]
    
    %% React组件层
    B --> C{操作类型}
    C -->|连接| D[useWebSocketActions.connect]
    C -->|发送消息| E[useWebSocketActions.sendMessage]
    C -->|获取状态| F[useWebSocketConnection]
    C -->|获取消息| G[useWebSocketMessages]
    
    %% Store层
    D --> H[WebSocketStore.connect]
    E --> I[WebSocketStore.sendMessage]
    F --> J[Store状态选择器]
    G --> K[Store消息选择器]
    
    %% Manager层
    H --> L[WebSocketManager.getInstance]
    I --> M[WebSocketManager.send]
    L --> N[WebSocketManager.connect]
    
    %% 原生WebSocket层
    N --> O[new WebSocket]
    M --> P[WebSocket.send]
    O --> Q[WebSocket事件]
    
    %% 事件回调流
    Q -->|onopen| R[Manager.onOpen回调]
    Q -->|onmessage| S[Manager.onMessage回调]
    Q -->|onclose| T[Manager.onClose回调]
    Q -->|onerror| U[Manager.onError回调]
    
    %% 状态更新流
    R --> V[Store.set连接状态]
    S --> W[Store.set消息历史]
    T --> X[Store.set断开状态]
    U --> Y[Store.set错误状态]
    
    %% React更新流
    V --> Z[组件重新渲染]
    W --> Z
    X --> Z
    Y --> Z
    
    %% 选择器返回
    J --> AA[返回连接状态]
    K --> BB[返回消息数据]
    AA --> B
    BB --> B
```

## 📋 详细时序图

### 连接建立时序

```mermaid
sequenceDiagram
    participant U as 用户
    participant C as React组件
    participant S as WebSocketStore
    participant M as WebSocketManager
    participant W as 原生WebSocket
    
    U->>C: 点击连接按钮
    C->>S: connect({ url: '...' })
    S->>S: 合并配置参数
    S->>M: getInstance(config)
    M->>M: 创建单例实例
    S->>M: setCallbacks(回调函数)
    S->>S: set({ wsManager })
    S->>M: connect()
    M->>W: new WebSocket(url)
    W->>M: onopen事件
    M->>S: 触发onOpen回调
    S->>S: set({ connectionStatus: 'connected' })
    S->>C: 状态变化通知
    C->>C: 重新渲染
    C->>U: 显示已连接状态
```

### 消息发送时序

```mermaid
sequenceDiagram
    participant U as 用户
    participant C as React组件
    participant S as WebSocketStore
    participant M as WebSocketManager
    participant W as 原生WebSocket
    
    U->>C: 输入消息并点击发送
    C->>S: sendMessage('Hello')
    S->>S: 检查连接状态
    S->>M: send('Hello')
    M->>M: 检查WebSocket状态
    M->>W: send('Hello')
    W-->>M: 发送成功
    M-->>S: 返回true
    S-->>C: 返回true
    C->>C: 清空输入框
    C->>U: 显示发送成功
```

### 消息接收时序

```mermaid
sequenceDiagram
    participant Server as 服务器
    participant W as 原生WebSocket
    participant M as WebSocketManager
    participant S as WebSocketStore
    participant C as React组件
    participant U as 用户
    
    Server->>W: 发送消息
    W->>M: onmessage事件
    M->>M: handleMessage(data)
    M->>M: 解析消息格式
    M->>S: 触发onMessage回调
    S->>S: set({ messageHistory: [...history, newMsg] })
    S->>C: 状态变化通知
    C->>C: 重新渲染消息列表
    C->>U: 显示新消息
```

## 🗂️ Store数据结构详解

### 完整状态结构
```typescript
interface WebSocketStoreState {
  // === 连接状态数据 ===
  connectionStatus: 'disconnected' | 'connecting' | 'connected' | 'reconnecting' | 'error'
  isConnected: boolean              // 快速判断标志
  lastConnectedAt: number | null    // 连接时间戳
  lastDisconnectedAt: number | null // 断开时间戳
  reconnectAttempts: number         // 重连计数
  error: string | null              // 错误信息
  
  // === 消息数据 ===
  messageHistory: WebSocketMessage[] // 所有消息历史
  lastMessage: WebSocketMessage | null // 最新消息
  
  // === Manager实例 ===
  wsManager: WebSocketManager | null // 管理器引用
  
  // === 操作方法 ===
  connect: (config?) => void
  disconnect: () => void
  sendMessage: (message) => boolean
  sendChatMessage: (content, role, agentId?) => boolean
  clearMessageHistory: () => void
  clearError: () => void
  resetConnection: () => void
}
```

### 数据存储时机表

| 操作 | 存储内容 | 触发时机 | 存储位置 |
|------|----------|----------|----------|
| **连接建立** | `wsManager`, `connectionStatus`, `isConnected`, `lastConnectedAt` | WebSocket.onopen | Store |
| **连接断开** | `connectionStatus`, `isConnected`, `lastDisconnectedAt`, `error` | WebSocket.onclose | Store |
| **消息接收** | `messageHistory`, `lastMessage` | WebSocket.onmessage | Store |
| **重连开始** | `connectionStatus`, `reconnectAttempts` | Manager.scheduleReconnect | Store |
| **错误发生** | `connectionStatus`, `error` | WebSocket.onerror | Store |
| **手动清理** | `messageHistory`, `lastMessage` | 用户操作 | Store |

## 🎯 Hook选择器设计

### 性能优化的选择器模式

```typescript
// ✅ 细粒度选择器 - 只订阅需要的状态
export const useWebSocketConnection = () => {
  const connectionStatus = useWebSocketStore(state => state.connectionStatus)
  const isConnected = useWebSocketStore(state => state.isConnected)
  const error = useWebSocketStore(state => state.error)
  // 只有这些状态变化时才重新渲染
  return { connectionStatus, isConnected, error }
}

// ❌ 粗粒度选择器 - 订阅整个状态
export const useWebSocketAll = () => {
  const allState = useWebSocketStore(state => state)
  // 任何状态变化都会重新渲染，性能差
  return allState
}
```

### 专用Hook设计

```typescript
// 连接状态Hook
export const useWebSocketConnection = () => ({
  connectionStatus,    // 连接状态
  isConnected,        // 是否已连接
  error,              // 错误信息
  reconnectAttempts,  // 重连次数
  lastConnectedAt,    // 连接时间
  lastDisconnectedAt  // 断开时间
})

// 消息管理Hook
export const useWebSocketMessages = () => ({
  messageHistory,     // 所有消息
  lastMessage,        // 最新消息
  clearMessageHistory // 清空方法
})

// 操作方法Hook
export const useWebSocketActions = () => ({
  connect,           // 连接方法
  disconnect,        // 断开方法
  sendMessage,       // 发送消息
  sendChatMessage,   // 发送聊天消息
  clearError,        // 清除错误
  resetConnection    // 重置连接
})

// 过滤消息Hook
export const useChatMessages = (agentId?: number) => {
  // 使用useMemo缓存过滤结果
  return React.useMemo(() => {
    return messageHistory.filter(msg => 
      msg.type === 'chat_message' && 
      (agentId === undefined || msg.data.agentId === agentId)
    )
  }, [messageHistory, agentId])
}
```

## 🔍 实际使用场景分析

### 场景1：连接状态指示器
```typescript
const ConnectionIndicator = () => {
  // 只需要连接状态，不关心消息
  const { connectionStatus, isConnected } = useWebSocketConnection()
  
  return (
    <div className={`indicator ${isConnected ? 'connected' : 'disconnected'}`}>
      {connectionStatus}
    </div>
  )
}
```
**存储**: 连接状态变化时存储  
**取用**: 组件渲染时取用连接状态

### 场景2：消息发送器
```typescript
const MessageSender = () => {
  const { sendMessage } = useWebSocketActions()
  const { isConnected } = useWebSocketConnection()
  
  const handleSend = (text: string) => {
    if (isConnected) {
      sendMessage(text)
    }
  }
}
```
**存储**: 不需要存储，只使用操作方法  
**取用**: 取用发送方法和连接状态

### 场景3：消息历史显示
```typescript
const MessageHistory = () => {
  const { messageHistory } = useWebSocketMessages()
  
  return (
    <div>
      {messageHistory.map(msg => (
        <div key={msg.id}>{msg.content}</div>
      ))}
    </div>
  )
}
```
**存储**: 每次收到消息时存储到历史  
**取用**: 组件渲染时取用消息历史

### 场景4：特定代理的聊天
```typescript
const AgentChat = ({ agentId }: { agentId: number }) => {
  const chatMessages = useChatMessages(agentId)
  
  return (
    <div>
      {chatMessages.map(msg => (
        <div key={msg.id}>{msg.data.content}</div>
      ))}
    </div>
  )
}
```
**存储**: 所有消息存储在统一历史中  
**取用**: 通过过滤Hook取用特定代理的消息

## 💡 设计优势总结

### 1. 单一数据源 (Single Source of Truth)
- 所有WebSocket相关状态都在一个Store中
- 避免状态不一致的问题

### 2. 响应式更新
- 状态变化自动触发组件重新渲染
- 无需手动管理状态同步

### 3. 性能优化
- 细粒度选择器避免不必要的重新渲染
- useMemo缓存计算结果

### 4. 类型安全
- 完整的TypeScript类型定义
- 编译时错误检查

### 5. 易于测试
- 状态和逻辑分离
- 可以独立测试Store逻辑

### 6. 可扩展性
- 新增状态或方法只需修改Store
- 组件无需修改即可获得新功能

这种设计让WebSocket的使用变得简单、高效、可维护！🚀
