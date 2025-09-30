# 🚀 WebSocket 聊天问题快速调试步骤

## 📋 现在请按照以下步骤操作

### 步骤1: 打开浏览器控制台
1. 按 `F12` 打开开发者工具
2. 切换到 `Console` 标签页
3. 清空控制台（点击🚫图标）

### 步骤2: 发送一条测试消息
1. 确保已选择一个 Agent
2. 在输入框输入：`你好`
3. 点击发送或按 `Enter`

### 步骤3: 观察控制台输出

你应该看到以下日志序列：

#### ✅ 第1组：发送消息
```
📤 [ChatStore] 发送WebSocket消息: {
  type: "chat_message",
  message: { data: { content: "你好" } },
  agent_uuid: "...",
  conversation_uuid: "..."
}
✅ [ChatStore] 消息已发送，等待回复...
```

**检查点：**
- [ ] `agent_uuid` 有值吗？
- [ ] `conversation_uuid` 有值吗？

#### ✅ 第2组：接收WebSocket消息
```
📥 [WebSocket 接收消息]
📨 接收时间: ...
📄 原始数据: ...
```

**检查点：**
- [ ] 是否收到了服务器的回复？
- [ ] 原始数据的格式是什么？

#### ✅ 第3组：WebSocket集成处理
```
🔗 [WebSocket Chat Integration] 处理新消息
📝 消息类型: chat_message
🆔 消息ID: ...
👤 当前选中Agent: ...
💬 当前会话ID: ...
📦 消息完整内容: { ... }

🔍 消息格式检查: {
  hasType: true/false,
  hasMessage: true/false,
  hasContent: true/false,
  hasStatus: true/false,
  actualType: "...",
  actualStatus: "..."
}

✅ 是否是聊天消息: true/false
```

**检查点：**
- [ ] `hasType` 是 `true` 吗？
- [ ] `hasMessage` 是 `true` 吗？
- [ ] `hasContent` 是 `true` 吗？
- [ ] `hasStatus` 是 `true` 吗？
- [ ] `是否是聊天消息` 是 `true` 吗？

#### ✅ 第4组：ChatStore处理消息
```
📥 [ChatStore] handleReceiveMessage
⏰ 时间: ...
📦 接收到的消息: { ... }
📝 消息内容: "..."
🎯 消息状态: pending/finish/error
👤 当前 selectedAgent: "..."
💬 当前 conversationId: "..."
📚 当前所有消息数量: 2

🔍 查找流式消息占位符，条件: {
  role: "assistant",
  isStreaming: true,
  agentId: "..."
}
✅ 找到的流式消息: { id: "...", content: "", ... }

📝 提取的内容: "..."
📝 [ChatStore] 追加消息内容: "..."
📊 更新后的消息总数: 2
```

**检查点：**
- [ ] `找到的流式消息` 有值吗？
- [ ] `提取的内容` 有内容吗？
- [ ] 看到 `追加消息内容` 日志了吗？

## 🐛 常见问题诊断

### 问题A: 没有看到 `📤 [ChatStore] 发送WebSocket消息`

**可能原因：**
1. `selectedAgent` 未设置
2. `conversationId` 未设置  
3. WebSocket 未连接

**解决方法：**
```javascript
// 在控制台执行
const chatStore = useChatStore.getState()
console.log('selectedAgent:', chatStore.selectedAgent)
console.log('conversationId:', chatStore.conversationId)

const wsStore = useWebSocketStore.getState()
console.log('isConnected:', wsStore.isConnected)
```

### 问题B: 消息发送了但没收到回复

**可能原因：**
1. WebSocket连接断开
2. 服务器未响应
3. 网络问题

**解决方法：**
1. 查看顶部Header的连接状态（应该是绿色🟢）
2. 检查Network标签的WebSocket连接
3. 查看是否有服务器错误

### 问题C: 收到消息但 `是否是聊天消息: false`

**可能原因：**
消息格式不符合要求

**请复制控制台的 `消息格式检查` 部分，告诉我：**
```
哪些字段是 false？
actualType 的值是什么？
actualStatus 的值是什么？
```

### 问题D: `未找到对应的流式消息占位符`

**可能原因：**
1. `selectedAgent` 在发送和接收时不一致
2. AI 占位符未创建成功
3. 占位符已经完成（`isStreaming: false`）

**请查看日志中的：**
```
📊 当前所有消息: [
  { id: "...", role: "...", isStreaming: ..., agentId: "..." },
  ...
]
```

**检查：**
- [ ] 是否有 `role: "assistant"` 的消息？
- [ ] `isStreaming` 是 `true` 吗？
- [ ] `agentId` 与当前 `selectedAgent` 一致吗？

## 📸 请提供以下信息

如果消息还是没有显示，请提供：

1. **完整的控制台日志截图** （从发送消息开始到接收消息结束）

2. **消息格式检查的结果：**
```
🔍 消息格式检查: {
  hasType: ?,
  hasMessage: ?,
  hasContent: ?,
  hasStatus: ?,
  actualType: "?",
  actualStatus: "?"
}
```

3. **服务器返回的原始消息内容：**
```
📦 消息完整内容: { ... }
```

4. **是否找到流式消息占位符：**
```
✅ 找到的流式消息: ...
```

## 🎯 下一步

根据你的日志输出，我们可以精确定位问题在哪一步！

**最可能的问题：**
1. ❌ 服务器返回的消息格式与预期不符
2. ❌ `selectedAgent` 或 `conversationId` 未正确设置
3. ❌ WebSocket 消息类型不匹配

现在请发送一条测试消息，并把控制台的日志发给我！
