# WebSocket 聊天消息流程调试指南

## 🔍 完整的消息流转过程

### 1️⃣ 发送消息流程

```
用户输入消息 
  ↓
MessageInput.tsx (handleSend)
  ↓
chatStore.sendMessage()
  ↓
构建 SendChatMessage {
  type: 'chat_message',
  message: { data: { content } },
  id: Date.now().toString(),
  timestamp: Date.now(),
  agent_uuid: selectedAgent,      // ⚠️ 必须设置
  conversation_uuid: conversationId // ⚠️ 必须设置
}
  ↓
wsStore.sendMessage(wsMessage)
  ↓
WebSocketManager.send() → 发送到服务器
```

### 2️⃣ 接收消息流程

```
WebSocket 服务器发送消息
  ↓
WebSocketManager.onmessage
  ↓
handleMessage() → 解析JSON
  ↓
callbacks.onMessage(message)
  ↓
websocketStore 更新 messageHistory 和 lastMessage
  ↓
useWebSocketChatIntegration Hook 监听 lastMessage
  ↓
检查消息类型 isReceiveChatMessage()
  ↓
chatStore.handleReceiveMessage(wsMessage)
  ↓
查找 streamingMessage (role='assistant', isStreaming=true)
  ↓
根据 status 更新消息:
  - pending: 追加内容
  - finish: 完成并设置 isStreaming=false
  - error: 显示错误并移除占位符
  ↓
ChatArea 显示更新后的消息
```

## ⚠️ 常见问题和检查点

### 问题1: 消息发送后没有收到回复

**检查清单:**

1. **conversationId 是否已设置？**
   ```typescript
   // 在 AgentList.tsx 中切换 agent 时会创建 conversation
   // 检查控制台日志：
   console.log('当前 conversationId:', conversationId)
   ```

2. **WebSocket 是否已连接？**
   ```typescript
   // 检查顶部 Header 的连接状态指示器
   // 应该显示 🟢 已连接
   ```

3. **消息是否成功发送到服务器？**
   ```typescript
   // 查看控制台日志：
   // 📤 [ChatStore] 发送WebSocket消息: {...}
   // ✅ [ChatStore] 消息已发送，等待回复...
   ```

### 问题2: 收到消息但没有显示

**检查清单:**

1. **是否收到 WebSocket 消息？**
   ```typescript
   // 查看控制台日志：
   // 📥 [WebSocket 接收消息]
   // 📬 [Store] 收到 WebSocket 消息
   ```

2. **消息类型是否正确？**
   ```typescript
   // 检查消息格式：
   {
     type: 'chat_message',           // ✅ 必须是这个类型
     message: {
       data: {
         content: '回复内容'          // ✅ 必须有内容
       }
     },
     status: 'pending' | 'finish',   // ✅ 必须有状态
     id: '...',
     chat_uuid: '...'
   }
   ```

3. **useWebSocketChatIntegration 是否被调用？**
   ```typescript
   // 查看控制台日志：
   // 🔗 [WebSocket Chat Integration] 处理新消息
   // ✅ 检测到聊天消息，准备集成到聊天系统
   ```

4. **是否找到了 streamingMessage 占位符？**
   ```typescript
   // 查看控制台日志：
   // 📥 [ChatStore] 接收到WebSocket消息
   // 如果显示：⚠️ [ChatStore] 未找到对应的流式消息占位符
   // 说明没有找到 AI 消息占位符
   ```

### 问题3: streamingMessage 未找到

**原因分析:**

发送消息时会创建一个 AI 消息占位符：
```typescript
const aiMessage: Message = {
  id: generateId(),
  content: '',
  role: 'assistant',      // ✅ 角色必须是 assistant
  timestamp: Date.now(),
  isStreaming: true,      // ✅ 必须设置为 true
  agentId: selectedAgent, // ✅ 必须匹配当前选中的 agent
}
```

接收消息时查找条件：
```typescript
const streamingMessage = state.messages.find(
  msg => 
    msg.role === 'assistant' &&      // 必须是 assistant
    msg.isStreaming &&               // 必须正在流式输出
    msg.agentId === state.selectedAgent  // 必须是当前 agent
)
```

**可能原因:**
1. `selectedAgent` 未设置或与发送时不一致
2. AI 消息占位符未成功创建
3. `isStreaming` 标志未设置
4. 消息已完成（`isStreaming: false`）

## 🐛 调试步骤

### 第1步: 检查发送流程

打开浏览器控制台（F12），发送一条消息，检查以下日志：

```
✅ 应该看到:
📤 [ChatStore] 发送WebSocket消息: {
  type: "chat_message",
  agent_uuid: "xxx",
  conversation_uuid: "xxx"
}
✅ [ChatStore] 消息已发送，等待回复...
```

### 第2步: 检查 WebSocket 连接

```
✅ 应该看到:
🎉 [WebSocket 连接成功] {
  时间: "...",
  状态: "connected"
}
```

### 第3步: 检查接收流程

等待服务器回复，检查以下日志：

```
✅ 应该看到:
📥 [WebSocket 接收消息] {
  消息类型: "chat_message",
  消息ID: "...",
  接收时间: "..."
}

🔗 [WebSocket Chat Integration] 处理新消息
✅ 检测到聊天消息，准备集成到聊天系统

📥 [ChatStore] 接收到WebSocket消息: {...}
📝 [ChatStore] 追加消息内容: "..."
```

### 第4步: 检查状态变量

在控制台执行以下命令检查状态：

```javascript
// 检查 chatStore 状态
const chatStore = window.__ZUSTAND_STORES__?.chatStore?.getState?.()
console.log('selectedAgent:', chatStore?.selectedAgent)
console.log('conversationId:', chatStore?.conversationId)
console.log('messages:', chatStore?.messages)
console.log('isLoading:', chatStore?.isLoading)
console.log('isStreaming:', chatStore?.isStreaming)

// 检查 WebSocket 状态
const wsStore = window.__ZUSTAND_STORES__?.websocketStore?.getState?.()
console.log('isConnected:', wsStore?.isConnected)
console.log('lastMessage:', wsStore?.lastMessage)
```

## 🔧 常见解决方案

### 解决方案1: conversationId 未设置

**症状:** 发送消息时提示 "会话ID不存在"

**解决:**
1. 切换到其他 agent 再切换回来
2. 检查 AgentList.tsx 是否正确创建了 conversation
3. 查看控制台是否有会话创建失败的错误

### 解决方案2: 消息类型不匹配

**症状:** 收到消息但 `isReceiveChatMessage()` 返回 false

**解决:**
检查服务器返回的消息格式是否符合：
```typescript
{
  type: 'chat_message',  // 必须
  message: {             // 必须
    data: {              // 必须
      content: string    // 必须
    }
  },
  status: 'pending' | 'finish' | 'error',  // 必须
  id: string,
  chat_uuid: string
}
```

### 解决方案3: streamingMessage 未找到

**症状:** 控制台显示 "⚠️ [ChatStore] 未找到对应的流式消息占位符"

**解决:**
1. 检查 `selectedAgent` 是否设置正确
2. 检查发送消息时是否成功创建了 AI 占位符
3. 检查占位符的 `agentId` 是否与当前 `selectedAgent` 一致

## 📊 完整的日志示例

### 正常流程的日志：

```
1. 发送消息:
📤 [ChatStore] 发送WebSocket消息: {
  type: "chat_message",
  message: { data: { content: "你好" } },
  id: "1234567890",
  timestamp: 1609459200000,
  agent_uuid: "550e8400-e29b-41d4-a716-446655440001",
  conversation_uuid: "hdskdhjsadhaj"
}
✅ [ChatStore] 消息已发送，等待回复...

2. 接收消息 (pending):
📥 [WebSocket 接收消息]
🔗 [WebSocket Chat Integration] 处理新消息
✅ 检测到聊天消息，准备集成到聊天系统
📥 [ChatStore] 接收到WebSocket消息
📝 [ChatStore] 追加消息内容: "你"

3. 接收消息 (pending):
📝 [ChatStore] 追加消息内容: "好"

4. 接收消息 (finish):
✅ [ChatStore] 消息接收完成
```

## 🎯 关键代码位置

1. **发送消息**: `src/store/chatStore.ts` (line 90-185)
2. **接收消息**: `src/store/chatStore.ts` (line 265-323)
3. **WebSocket 集成**: `src/hooks/useWebSocketChatIntegration.ts`
4. **WebSocket 管理**: `src/lib/websocket.ts`
5. **消息显示**: `src/components/ChatArea.tsx`
6. **会话创建**: `src/components/AgentList.tsx`

## 💡 临时调试代码

在 `src/hooks/useWebSocketChatIntegration.ts` 中添加更详细的日志：

```typescript
useEffect(() => {
  if (!lastMessage) {
    console.log('🔍 [Debug] lastMessage 为空')
    return
  }

  console.group('🔗 [WebSocket Chat Integration] 处理新消息')
  console.log('消息类型:', lastMessage.type)
  console.log('消息完整内容:', JSON.stringify(lastMessage, null, 2))
  console.log('当前选中Agent:', selectedAgent)
  console.log('当前会话ID:', conversationId)
  
  const isChat = isReceiveChatMessage(lastMessage)
  console.log('是否是聊天消息:', isChat)
  
  if (isChat) {
    console.log('准备调用 handleReceiveMessage')
    handleReceiveMessage(lastMessage)
  }
  
  console.groupEnd()
}, [lastMessage, handleReceiveMessage, selectedAgent, conversationId])
```

在 `src/store/chatStore.ts` 的 `handleReceiveMessage` 中添加：

```typescript
handleReceiveMessage: (wsMessage: ReceiveChatMessage) => {
  const state = get();
  
  console.group('📥 [ChatStore Debug] handleReceiveMessage')
  console.log('消息内容:', wsMessage)
  console.log('当前 selectedAgent:', state.selectedAgent)
  console.log('当前所有消息:', state.messages)
  
  // 查找正在流式输出的AI消息
  const streamingMessage = state.messages.find(
    msg => msg.role === 'assistant' && msg.isStreaming && msg.agentId === state.selectedAgent
  );
  
  console.log('找到的 streamingMessage:', streamingMessage)
  
  if (!streamingMessage) {
    console.warn('⚠️ 未找到对应的流式消息占位符');
    console.log('查找条件:', {
      role: 'assistant',
      isStreaming: true,
      agentId: state.selectedAgent
    })
    console.groupEnd()
    return;
  }
  
  // ... 其余代码
  console.groupEnd()
}
```

---

使用这个调试指南，你应该能够快速定位消息未显示的问题！
