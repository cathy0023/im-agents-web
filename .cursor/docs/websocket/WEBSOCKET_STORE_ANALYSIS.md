# WebSocket Store 设计分析

## 🤔 为什么需要 WebSocket Store？

### 核心问题
在React应用中，WebSocket连接面临几个关键挑战：

1. **状态共享问题**: 多个组件需要知道WebSocket的连接状态
2. **消息分发问题**: 收到的消息需要分发给不同的组件
3. **生命周期管理**: WebSocket连接需要跨组件生命周期存在
4. **重新渲染优化**: 避免不必要的组件重新渲染

## 🏗️ 架构设计理念

### 三层架构
```
React组件层 (UI)
    ↕️
Store层 (状态管理)
    ↕️
Manager层 (WebSocket管理)
    ↕️
原生WebSocket (底层连接)
```

### 职责分离
- **WebSocketManager**: 负责底层WebSocket连接管理
- **WebSocketStore**: 负责状态管理和React集成
- **React组件**: 负责UI展示和用户交互

## 📊 数据流转详解

### 1. 连接建立流程

#### 用户操作 → Store → Manager
```typescript
// 1. 用户点击连接按钮
const { connect } = useWebSocketActions()
connect({ url: 'ws://...' })

// 2. Store接收请求
connect: (configOverrides = {}) => {
  // 合并配置
  const config = { ...DEFAULT_WS_CONFIG, ...configOverrides }
  
  // 创建Manager实例
  const wsManager = WebSocketManager.getInstance(config)
  
  // 设置回调函数
  wsManager.setCallbacks({
    onOpen: () => set({ connectionStatus: 'connected' }),
    onMessage: (msg) => set({ messageHistory: [...history, msg] })
  })
  
  // 存储Manager实例到Store
  set({ wsManager })
  
  // 开始连接
  wsManager.connect()
}
```

#### Manager → 原生WebSocket → Store
```typescript
// 3. Manager创建原生WebSocket
this.ws = new WebSocket(url)

// 4. 原生WebSocket事件 → Manager回调 → Store状态更新
this.ws.onopen = () => {
  this.callbacks.onOpen?.() // 触发Store的onOpen回调
}

// 5. Store更新状态
set((state) => ({
  ...state,
  connectionStatus: 'connected',
  isConnected: true,
  lastConnectedAt: Date.now()
}))
```

### 2. 消息发送流程

#### 组件 → Store → Manager → WebSocket
```typescript
// 1. 组件发送消息
const { sendMessage } = useWebSocketActions()
sendMessage('Hello WebSocket!')

// 2. Store处理发送请求
sendMessage: (message) => {
  const { wsManager, isConnected } = get()
  
  if (!wsManager || !isConnected) {
    console.warn('WebSocket 未连接')
    return false
  }
  
  // 委托给Manager发送
  return wsManager.send(message)
}

// 3. Manager发送到原生WebSocket
public send(message: string): boolean {
  if (this.ws?.readyState === WebSocket.OPEN) {
    this.ws.send(message)
    return true
  }
  return false
}
```

### 3. 消息接收流程

#### WebSocket → Manager → Store → 组件
```typescript
// 1. 原生WebSocket接收消息
this.ws.onmessage = (event) => {
  this.handleMessage(event.data)
}

// 2. Manager处理消息
private handleMessage(data: string): void {
  const message = this.parseMessage(data)
  
  // 触发Store的消息回调
  this.callbacks.onMessage?.(message)
}

// 3. Store更新消息历史
onMessage: (message) => {
  set((state) => {
    const newHistory = [...state.messageHistory, message]
    return {
      ...state,
      messageHistory: newHistory,
      lastMessage: message
    }
  })
}

// 4. 组件自动重新渲染
const { messageHistory } = useWebSocketMessages()
// messageHistory变化 → 组件重新渲染
```

## 🗄️ Store中存储的数据

### 连接状态数据
```typescript
interface WebSocketState {
  connectionStatus: 'disconnected' | 'connecting' | 'connected' | 'reconnecting' | 'error'
  isConnected: boolean           // 快速判断是否已连接
  lastConnectedAt: number | null // 最后连接时间
  lastDisconnectedAt: number | null // 最后断开时间
  reconnectAttempts: number      // 当前重连次数
  error: string | null           // 错误信息
}
```

### 消息数据
```typescript
interface MessageState {
  messageHistory: WebSocketMessage[]  // 所有消息历史
  lastMessage: WebSocketMessage | null // 最新消息（用于快速访问）
}
```

### Manager实例
```typescript
interface ManagerState {
  wsManager: WebSocketManager | null // Manager实例引用
}
```

## 🔄 什么时候存储什么？

### 存储时机和内容

#### 1. 连接建立时存储
```typescript
// 存储：Manager实例、连接状态、连接时间
set({
  wsManager: managerInstance,
  connectionStatus: 'connected',
  isConnected: true,
  lastConnectedAt: Date.now(),
  error: null
})
```

#### 2. 消息接收时存储
```typescript
// 存储：消息历史、最新消息
set((state) => ({
  ...state,
  messageHistory: [...state.messageHistory, newMessage],
  lastMessage: newMessage
}))
```

#### 3. 连接断开时存储
```typescript
// 存储：断开状态、断开时间、错误信息
set({
  connectionStatus: 'disconnected',
  isConnected: false,
  lastDisconnectedAt: Date.now(),
  error: event.code !== 1000 ? '连接异常断开' : null
})
```

#### 4. 重连时存储
```typescript
// 存储：重连状态、重连次数
set({
  connectionStatus: 'reconnecting',
  reconnectAttempts: attempt
})
```

## 📤 什么时候取用什么？

### 组件使用场景

#### 1. 连接状态监控组件
```typescript
const StatusComponent = () => {
  // 取用：连接状态、错误信息
  const { connectionStatus, error, isConnected } = useWebSocketConnection()
  
  return (
    <div className={isConnected ? 'text-green-500' : 'text-red-500'}>
      {connectionStatus}
    </div>
  )
}
```

#### 2. 消息发送组件
```typescript
const SendComponent = () => {
  // 取用：发送方法、连接状态
  const { sendMessage } = useWebSocketActions()
  const { isConnected } = useWebSocketConnection()
  
  const handleSend = () => {
    if (isConnected) {
      sendMessage('Hello!')
    }
  }
}
```

#### 3. 消息显示组件
```typescript
const MessageComponent = () => {
  // 取用：消息历史、最新消息
  const { messageHistory, lastMessage } = useWebSocketMessages()
  
  // 监听新消息
  useEffect(() => {
    if (lastMessage) {
      console.log('收到新消息:', lastMessage)
    }
  }, [lastMessage])
  
  return (
    <div>
      {messageHistory.map(msg => <div key={msg.id}>{msg.content}</div>)}
    </div>
  )
}
```

#### 4. 聊天组件（过滤特定消息）
```typescript
const ChatComponent = ({ agentId }: { agentId: number }) => {
  // 取用：过滤后的聊天消息
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

## 🎯 Store的核心价值

### 1. 状态统一管理
```typescript
// ❌ 没有Store：每个组件都要管理WebSocket状态
const Component1 = () => {
  const [ws, setWs] = useState<WebSocket | null>(null)
  const [connected, setConnected] = useState(false)
  const [messages, setMessages] = useState([])
  // 重复的状态管理逻辑...
}

// ✅ 有Store：统一的状态管理
const Component1 = () => {
  const { isConnected } = useWebSocketConnection()
  const { messageHistory } = useWebSocketMessages()
  // 简洁的状态获取
}
```

### 2. 跨组件通信
```typescript
// 组件A发送消息
const ComponentA = () => {
  const { sendMessage } = useWebSocketActions()
  return <button onClick={() => sendMessage('Hello')}>发送</button>
}

// 组件B接收消息
const ComponentB = () => {
  const { lastMessage } = useWebSocketMessages()
  useEffect(() => {
    if (lastMessage) {
      // 处理新消息
    }
  }, [lastMessage])
}
```

### 3. 性能优化
```typescript
// 选择性订阅，避免不必要的重新渲染
const ConnectionStatus = () => {
  // 只订阅连接状态，消息变化不会触发重新渲染
  const { connectionStatus } = useWebSocketConnection()
  return <div>{connectionStatus}</div>
}

const MessageList = () => {
  // 只订阅消息，连接状态变化不会触发重新渲染
  const { messageHistory } = useWebSocketMessages()
  return <div>{messageHistory.length} 条消息</div>
}
```

### 4. 生命周期管理
```typescript
// Store确保WebSocket连接跨组件生命周期存在
const App = () => {
  const { connect } = useWebSocketActions()
  
  useEffect(() => {
    // 应用启动时连接
    connect()
    
    // 组件卸载时，WebSocket连接仍然存在
    // 其他组件可以继续使用
  }, [])
}
```

## 🔧 设计模式总结

### Observer Pattern (观察者模式)
- **WebSocketManager**: 被观察者，管理WebSocket连接
- **WebSocketStore**: 观察者，监听Manager的状态变化
- **React组件**: 观察者，监听Store的状态变化

### Singleton Pattern (单例模式)
- **WebSocketManager**: 确保全局只有一个WebSocket连接
- **WebSocketStore**: 通过Zustand确保全局状态一致性

### Facade Pattern (外观模式)
- **WebSocketStore**: 为复杂的WebSocket操作提供简单的接口
- **Hook函数**: 为组件提供更细粒度的状态访问

## 🎉 总结

WebSocket Store的存在解决了以下核心问题：

1. **状态共享**: 多个组件可以共享WebSocket连接状态
2. **消息分发**: 统一的消息接收和分发机制
3. **性能优化**: 选择性订阅，减少不必要的重新渲染
4. **生命周期**: WebSocket连接独立于组件生命周期
5. **代码复用**: 避免在每个组件中重复WebSocket逻辑
6. **类型安全**: 统一的TypeScript类型定义
7. **调试友好**: 集中的状态管理便于调试和监控

这种设计让WebSocket的使用变得简单、高效、可维护！
