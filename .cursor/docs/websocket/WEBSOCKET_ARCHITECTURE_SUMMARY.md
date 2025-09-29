# WebSocket 架构总结

## 🎯 整理完成

经过系统性的代码整理，现在项目中的WebSocket功能已经完全统一，使用单一的架构模式。

## 🏗️ 统一架构

### 核心组件
```
src/
├── types/websocket.ts           # 类型定义
├── lib/websocket.ts            # WebSocketManager 单例管理器
├── store/websocketStore.ts     # Zustand 状态管理
├── utils/websocket-test-helper.ts # 测试工具
└── components/
    ├── WebSocketTest.tsx       # 测试页面
    └── MessageInput.tsx        # 消息输入（使用chatStore）
```

### 数据流向
```
用户操作 → Store Actions → WebSocketManager → 原生WebSocket
                ↓
            Store State ← WebSocketManager ← 服务器响应
                ↓
            React组件更新
```

## ✅ 已删除的冗余文件

1. **src/components/WebSocketDebugger.tsx** - 功能与WebSocketTest重复
2. **src/components/WebSocketStatus.tsx** - 未被使用的状态指示器
3. **src/hooks/useWebSocketRecovery.ts** - 功能已集成到WebSocketManager
4. **WEBSOCKET_INFINITE_LOOP_CASE_STUDY.md** - 过时的问题分析文档

## 🔧 统一的使用方式

### 1. 连接管理
```typescript
import { useWebSocketActions, useWebSocketConnection } from '@/store/websocketStore'

const MyComponent = () => {
  const { connect, disconnect, sendMessage } = useWebSocketActions()
  const { isConnected, connectionStatus, error } = useWebSocketConnection()
  
  // 连接WebSocket
  const handleConnect = () => {
    connect({
      url: 'ws://example.com/ws',
      debug: true
    })
  }
  
  // 发送消息
  const handleSend = () => {
    sendMessage('Hello WebSocket!')
  }
}
```

### 2. 消息监听
```typescript
import { useWebSocketMessages } from '@/store/websocketStore'

const MyComponent = () => {
  const { messageHistory, lastMessage } = useWebSocketMessages()
  
  // 监听所有消息
  useEffect(() => {
    if (lastMessage) {
      console.log('收到新消息:', lastMessage)
    }
  }, [lastMessage])
}
```

### 3. 聊天消息
```typescript
import { useChatMessages } from '@/store/websocketStore'

const ChatComponent = () => {
  const chatMessages = useChatMessages(agentId) // 过滤特定代理的消息
  
  return (
    <div>
      {chatMessages.map(msg => (
        <div key={msg.id}>{msg.data.content}</div>
      ))}
    </div>
  )
}
```

## 🎮 测试和调试

### 测试页面
- **路径**: `/debug/websocket-test` (仅开发环境)
- **功能**: 
  - 连接控制
  - 快速测试按钮
  - 自动化测试序列
  - 详细控制台日志

### 控制台日志
所有WebSocket操作都会在浏览器控制台输出详细日志：
- 🎉 连接成功
- 🚀 发送消息
- 📥 接收消息
- 💓 心跳机制
- 🔄 重连过程

## 🔒 类型安全

### 消息类型
```typescript
// 聊天消息
interface ChatWebSocketMessage {
  id: string
  type: 'chat_message'
  timestamp: number
  data: {
    content: string
    role: 'user' | 'assistant'
    agentId?: number
  }
}

// 系统消息
interface SystemWebSocketMessage {
  id: string
  type: 'system_message'
  timestamp: number
  data: {
    content: string
    level: 'info' | 'warning' | 'error'
  }
}
```

### 类型守卫
```typescript
import { isChatMessage, isSystemMessage } from '@/types/websocket'

if (isChatMessage(message)) {
  // message 现在是 ChatWebSocketMessage 类型
  console.log(message.data.content)
}
```

## ⚙️ 配置选项

### WebSocket配置
```typescript
interface WebSocketConfig {
  url: string                    // WebSocket URL
  reconnectAttempts?: number     // 重连次数 (默认: 5)
  reconnectInterval?: number     // 重连间隔 (默认: 3000ms)
  heartbeat?: {
    interval: number             // 心跳间隔 (默认: 30000ms)
    timeout: number              // 心跳超时 (默认: 10000ms)
    message: string              // 心跳消息 (默认: 'ping')
  }
  debug?: boolean                // 调试模式 (默认: false)
}
```

## 🚀 性能优化

### 单例模式
- WebSocketManager使用单例模式，确保全局只有一个连接实例
- 避免重复连接和资源浪费

### 状态管理优化
- 使用Zustand的选择器模式，避免不必要的重新渲染
- 分离连接状态、消息状态和操作方法的Hook

### 内存管理
- 消息历史限制在1000条，防止内存泄漏
- 组件卸载时自动清理定时器和连接

## 🔧 维护指南

### 添加新消息类型
1. 在 `src/types/websocket.ts` 中定义新的消息接口
2. 更新 `WebSocketMessage` 联合类型
3. 添加对应的类型守卫函数
4. 在WebSocketManager中处理新消息类型

### 扩展功能
1. 在 `WebSocketStoreState` 接口中添加新的状态或方法
2. 在store实现中添加对应的逻辑
3. 如需要，创建新的Hook选择器

### 调试问题
1. 启用调试模式: `connect({ debug: true })`
2. 查看浏览器控制台的详细日志
3. 使用 `/debug/websocket-test` 页面进行测试
4. 检查网络面板的WebSocket连接状态

## 📊 架构优势

### ✅ 优点
- **统一性**: 全局使用同一套WebSocket接口
- **类型安全**: 完整的TypeScript类型支持
- **可维护性**: 清晰的架构分层和职责分离
- **可测试性**: 完整的测试工具和日志系统
- **性能**: 单例模式和状态优化
- **可扩展性**: 模块化设计，易于扩展新功能

### 🎯 最佳实践
- 始终通过Store操作WebSocket，不直接使用WebSocketManager
- 使用对应的Hook选择器获取所需状态，避免过度订阅
- 在开发时启用debug模式，生产环境关闭
- 定期清理消息历史，避免内存积累
- 使用类型守卫确保消息类型安全

## 🔄 升级路径

如果需要升级或修改WebSocket功能：

1. **向后兼容**: 保持现有的Store接口不变
2. **渐进式升级**: 可以在WebSocketManager内部升级实现
3. **测试验证**: 使用测试页面验证所有功能正常
4. **文档更新**: 及时更新相关文档

---

**总结**: 现在项目拥有了一个统一、类型安全、高性能的WebSocket架构，所有组件都通过标准化的Store接口进行WebSocket操作，确保了代码的一致性和可维护性。
