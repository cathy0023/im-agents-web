# WebSocket 聊天功能使用指南

## 🎉 功能概述

已成功实现基于WebSocket的实时聊天功能，完全替代了之前的智谱AI临时方案。

## ✅ 已完成的工作

### 1. 移除智谱AI相关代码
- ✅ 删除 `src/types/chat.ts` (智谱AI类型定义)
- ✅ 移除 `src/lib/sse.ts` 中的 `createZhipuChatStream` 函数
- ✅ 移除 `src/api/client.ts` 中的 `ZhipuApiClient` 类
- ✅ 移除 `chatStore` 中的智谱AI调用逻辑和配置

### 2. 实现WebSocket聊天通信
- ✅ 创建 `src/types/chat-websocket.ts` - WebSocket聊天协议类型定义
- ✅ 更新 `chatStore.sendMessage()` - 使用WebSocket发送消息
- ✅ 实现 `chatStore.handleReceiveMessage()` - 处理WebSocket接收的消息
- ✅ 更新 `useWebSocketChatIntegration` Hook - 集成WebSocket消息到聊天系统

## 📋 WebSocket 聊天协议

### 发送消息格式

```typescript
{
  "type": "chat_message",
  "message": {
    "data": {
      "content": "用户发了一条消息"
    }
  },
  "id": "1234567890",
  "timestamp": 1609459200000,
  "agent_uuid": "550e8400-e29b-41d4-a716-446655440001",
  "conversation_uuid": "hdskdhjsadhaj"
}
```

### 接收消息格式

```typescript
{
  "type": "chat_message",
  "message": {
    "data": {
      "content": "主要内容"
    }
  },
  "id": "550e8400-e29b-41d4-a716-446655440001",
  "chat_uuid": "xxxxxxxxx",  // 所属聊天窗uid
  "status": "finish" | "error" | "pending",  // 消息状态
  "component_name": ""  // 组件名称，空字符串表示普通消息
}
```

### 消息状态说明

- **pending**: 消息进行中（流式输出）
- **finish**: 消息完成
- **error**: 发生错误

## 🔧 使用方法

### 1. 发送消息

聊天Store会自动处理消息发送：

```typescript
const { sendMessage, setCurrentMessage } = useChatStore()

// 设置消息内容
setCurrentMessage('你好，我想问一个问题')

// 发送消息（会自动通过WebSocket发送）
await sendMessage()
```

### 2. 接收消息

消息接收由 `useWebSocketChatIntegration` Hook自动处理：

```typescript
// 在需要聊天功能的组件中使用
function ChatComponent() {
  useWebSocketChatIntegration()  // 自动集成WebSocket消息
  
  // 其他组件逻辑...
}
```

### 3. 流式输出

系统支持流式输出，会自动处理：

1. 发送消息后，创建一个空的AI消息占位符，标记为 `isStreaming: true`
2. 收到 `status: 'pending'` 的消息时，追加内容到占位符
3. 收到 `status: 'finish'` 的消息时，标记为完成 `isStreaming: false`
4. 收到 `status: 'error'` 的消息时，显示错误并移除占位符

## 🎯 核心代码文件

### 类型定义
- `src/types/chat-websocket.ts` - WebSocket聊天协议类型

### 状态管理
- `src/store/chatStore.ts` - 聊天状态管理
  - `sendMessage()` - 发送消息
  - `handleReceiveMessage()` - 处理接收的消息

### WebSocket集成
- `src/hooks/useWebSocketChatIntegration.ts` - WebSocket消息集成Hook

## 🔍 调试信息

### 控制台日志

系统会输出详细的控制台日志：

```
📤 [ChatStore] 发送WebSocket消息: {...}
✅ [ChatStore] 消息已发送，等待回复...
📥 [ChatStore] 接收到WebSocket消息: {...}
📝 [ChatStore] 追加消息内容: xxx
✅ [ChatStore] 消息接收完成
```

### 错误处理

所有错误都会被捕获并显示：

```
❌ [ChatStore] 发送消息失败: ...
❌ [ChatStore] 消息接收错误: ...
```

## ⚠️ 注意事项

### 必需的前置条件

1. **WebSocket连接**: 必须先建立WebSocket连接
2. **Agent选择**: 必须选择一个Agent (`selectedAgent`)
3. **会话ID**: 必须有有效的会话ID (`conversationId`)

### 错误提示

系统会在以下情况显示错误：

- WebSocket未连接
- 未选择Agent
- 会话ID不存在
- 消息内容为空

## 🧪 测试建议

### 1. 基础消息测试
- 发送简单文本消息
- 验证消息正确显示
- 检查消息时间戳

### 2. 流式输出测试
- 发送较长的消息
- 观察流式输出效果
- 验证最终消息完整性

### 3. 错误处理测试
- 断开WebSocket连接
- 发送空消息
- 未选择Agent时发送

### 4. 并发测试
- 快速连续发送多条消息
- 验证消息顺序
- 检查消息不丢失

## 📝 示例代码

### 完整的聊天组件示例

```typescript
import { useChatStore } from '@/store/chatStore'
import { useWebSocketChatIntegration } from '@/hooks/useWebSocketChatIntegration'

function ChatArea() {
  // 启用WebSocket聊天集成
  useWebSocketChatIntegration()
  
  const { 
    messages, 
    currentMessage, 
    isLoading,
    setCurrentMessage, 
    sendMessage 
  } = useChatStore()
  
  const handleSend = async () => {
    if (!currentMessage.trim()) return
    await sendMessage()
  }
  
  return (
    <div>
      {/* 消息列表 */}
      <div className="messages">
        {messages.map(msg => (
          <div key={msg.id} className={msg.role}>
            {msg.content}
            {msg.isStreaming && <span>...</span>}
          </div>
        ))}
      </div>
      
      {/* 输入框 */}
      <input
        value={currentMessage}
        onChange={(e) => setCurrentMessage(e.target.value)}
        onKeyPress={(e) => e.key === 'Enter' && handleSend()}
        disabled={isLoading}
      />
      
      {/* 发送按钮 */}
      <button onClick={handleSend} disabled={isLoading}>
        {isLoading ? '发送中...' : '发送'}
      </button>
    </div>
  )
}
```

## 🎊 总结

✅ 智谱AI相关代码已完全移除  
✅ WebSocket聊天通信已完全实现  
✅ 支持实时消息发送和接收  
✅ 支持流式输出  
✅ 完善的错误处理  
✅ 详细的调试日志  

现在你的应用已经完全基于WebSocket进行聊天通信！
