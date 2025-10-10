# WebSocket 系统架构文档

## 📋 目录
- [系统概述](#系统概述)
- [架构图](#架构图)
- [核心组件](#核心组件)
- [数据流详解](#数据流详解)
- [关键代码位置](#关键代码位置)
- [问题排查指南](#问题排查指南)
- [日志说明](#日志说明)

---

## 系统概述

本项目使用 WebSocket 实现实时聊天功能，采用分层架构：
- **WebSocket 管理器层**：底层 WebSocket 连接管理
- **状态管理层**：zustand store 管理连接状态和消息
- **业务逻辑层**：聊天功能的业务处理
- **UI 层**：React 组件展示和交互

---

## 架构图

```
┌─────────────────────────────────────────────────────────────┐
│                         应用启动                              │
│                        App.tsx                               │
│                 调用 connect() 初始化连接                      │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                   WebSocket Store                            │
│              src/store/websocketStore.ts                     │
│  • 管理连接状态 (connected/connecting/reconnecting/error)    │
│  • 存储消息历史                                               │
│  • 提供操作方法 (connect/disconnect/sendMessage)             │
└────────────┬──────────────────────┬─────────────────────────┘
             │                      │
             ▼                      ▼
┌────────────────────┐    ┌────────────────────────────┐
│  WebSocket Manager │    │     Chat Store             │
│  src/lib/websocket.ts│  │  src/store/chatStore.ts    │
│  • 原生 WebSocket  │    │  • 聊天消息管理             │
│  • 心跳机制        │    │  • 发送/接收消息            │
│  • 自动重连        │    │  • 流式输出处理             │
│  • 消息收发        │    │  • 历史消息加载             │
└────────┬───────────┘    └────────┬───────────────────┘
         │                         │
         │                         │
         ▼                         ▼
┌────────────────────┐    ┌────────────────────────────┐
│   WebSocket 集成   │    │    UI 组件                  │
│  useWebSocketChat  │◄───│  MessageInput              │
│  Integration.ts    │    │  ChatArea                  │
│  • 监听消息        │    │  MessageLayout             │
│  • 集成到聊天系统  │    │  • 显示消息                 │
└────────────────────┘    │  • 用户输入                 │
                          │  • 连接状态提示             │
                          └────────────────────────────┘
```

---

## 核心组件

### 1. WebSocket 管理器 (`src/lib/websocket.ts`)

**职责**：
- 管理原生 WebSocket 连接
- 实现心跳机制（30秒/次）
- 自动重连（最多5次）
- 消息收发

**核心方法**：
```typescript
class WebSocketManager {
  connect()           // 建立连接
  disconnect()        // 断开连接
  send(message)       // 发送消息
  isConnected()       // 检查连接状态
  setCallbacks()      // 设置事件回调
}
```

**关键特性**：
- 单例模式，全局唯一实例
- 自动 JSON 解析/序列化
- 支持纯文本和结构化消息
- 心跳超时检测（10秒）

---

### 2. WebSocket Store (`src/store/websocketStore.ts`)

**职责**：
- 管理 WebSocket 连接状态
- 存储消息历史（最多1000条）
- 提供 React Hook 接口
- 同步状态到 UI

**核心状态**：
```typescript
{
  connectionStatus: 'connected' | 'connecting' | 'reconnecting' | 'error' | 'disconnected'
  isConnected: boolean
  messageHistory: WebSocketMessage[]
  lastMessage: WebSocketMessage | null
  error: string | null
}
```

**核心方法**：
```typescript
connect(config?)           // 连接
disconnect()               // 断开
sendMessage(message)       // 发送消息
sendChatMessage()          // 发送聊天消息
syncStatus()              // 同步状态
```

**React Hooks**：
```typescript
useWebSocketConnection()   // 获取连接状态
useWebSocketMessages()     // 获取消息历史
useWebSocketActions()      // 获取操作方法
useChatMessages(agentId)  // 获取指定 Agent 的聊天消息
```

---

### 3. Chat Store (`src/store/chatStore.ts`)

**职责**：
- 管理聊天消息（UI 层面）
- 处理消息发送逻辑
- 处理流式输出
- 加载历史消息

**核心方法**：
```typescript
sendMessage()              // 发送消息
handleReceiveMessage()     // 处理接收的消息
addHistoryMessages()       // 添加历史消息
updateMessage()            // 更新消息内容（流式输出）
```

---

### 4. WebSocket 集成 Hook (`src/hooks/useWebSocketChatIntegration.ts`)

**职责**：
- 监听 WebSocket 消息
- 过滤聊天消息
- 调用 chatStore 处理消息

**工作流程**：
```typescript
lastMessage 变化 
  → 检查消息类型 
  → 如果是聊天消息 
  → 调用 chatStore.handleReceiveMessage()
```

---

### 5. 连接确保 Hook (`src/hooks/useEnsureWebSocketConnected.ts`)

**职责**：
- 在组件加载时确保 WebSocket 已连接
- 自动同步状态
- 前3秒定期检查（500ms/次）

**使用场景**：
- MessageInput 组件
- MessageLayout 组件

---

## 数据流详解

### 📤 发送消息流程

```
用户输入消息 → 点击发送
         │
         ▼
MessageInput 组件
         │
         ▼
chatStore.sendMessage()
         │
         ├─ 1. 验证：检查消息、Agent、会话ID
         ├─ 2. 检查：WebSocket 连接状态
         ├─ 3. 添加：用户消息到 UI
         ├─ 4. 创建：AI 消息占位符（streaming=true）
         ├─ 5. 构建：WebSocket 消息
         │     {
         │       type: 'chat_message',
         │       message: {
         │         data: { content: '...' },
         │         id: '...',
         │         agent_uuid: '...',
         │         conversation_uuid: '...'
         │       }
         │     }
         ▼
wsStore.sendMessage(wsMessage)
         │
         ▼
WebSocketManager.send()
         │
         ▼
通过 WebSocket 发送到服务器
```

**关键代码**：
```typescript
// src/store/chatStore.ts:143-159
const wsMessage: SendChatMessage = {
  type: 'chat_message',
  message: {
    data: { content: currentMessage.trim() },
    id: Date.now().toString(),
    agent_uuid: selectedAgent,
    conversation_uuid: conversationId
  }
};
wsStore.sendMessage(wsMessage);
```

---

### 📥 接收消息流程

```
服务器发送消息
         │
         ▼
WebSocketManager.onmessage
         │
         ├─ 1. 解析：JSON.parse(data)
         ├─ 2. 验证：消息格式
         ├─ 3. 心跳：检查是否是 pong
         │     └─ 是 → 清除心跳超时
         └─ 4. 回调：触发 onMessage
                │
                ▼
wsStore 回调 → 添加到 messageHistory
                │
                ▼
useWebSocketChatIntegration 监听 lastMessage
                │
                ├─ 1. 检查：是否是聊天消息
                │     - type === 'chat_message'
                │     - status in ['finish', 'error', 'pending']
                ├─ 2. 过滤：非聊天消息跳过
                └─ 3. 调用：chatStore.handleReceiveMessage()
                        │
                        ▼
chatStore.handleReceiveMessage()
                        │
                        ├─ 1. 查找：流式消息占位符
                        ├─ 2. 提取：消息内容
                        ├─ 3. 更新：
                        │     - pending → 追加内容
                        │     - finish → 停止流式输出
                        │     - error → 显示错误
                        └─ 4. 刷新：UI 显示
```

**关键代码**：
```typescript
// src/store/chatStore.ts:256-340
handleReceiveMessage: (wsMessage: ReceiveChatMessage) => {
  // 查找流式消息占位符
  const streamingMessage = state.messages.find(
    m => m.role === 'assistant' && 
         m.isStreaming && 
         m.agentId === state.selectedAgent
  );
  
  // 根据状态处理
  if (wsMessage.status === 'pending') {
    // 追加内容
  } else if (wsMessage.status === 'finish') {
    // 完成流式输出
  } else if (wsMessage.status === 'error') {
    // 显示错误
  }
}
```

---

### 🔄 连接建立流程

```
应用启动
    │
    ▼
App.tsx useEffect
    │
    └─ connect() ──────┐
                       │
                       ▼
            wsStore.connect()
                       │
                       ├─ 1. 检查：是否已连接
                       ├─ 2. 创建：WebSocketManager 实例
                       ├─ 3. 设置：事件回调
                       │     - onOpen → 更新状态为 'connected'
                       │     - onClose → 更新状态为 'disconnected'
                       │     - onError → 更新状态为 'error'
                       │     - onMessage → 添加到消息历史
                       └─ 4. 连接：wsManager.connect()
                                   │
                                   ▼
                       WebSocketManager.connect()
                                   │
                                   ├─ 1. 设置状态：'connecting'
                                   ├─ 2. 创建：new WebSocket(url)
                                   ├─ 3. 监听：onopen/onclose/onerror/onmessage
                                   └─ 4. 成功：
                                         ├─ 设置状态：'connected'
                                         ├─ 触发：onOpen 回调
                                         └─ 启动：心跳机制
```

---

### 💓 心跳机制

```
连接成功
    │
    ▼
启动心跳定时器（30秒）
    │
    └─ 每 30 秒 ──┐
                  │
                  ▼
       发送心跳消息
       {
         type: 'heartbeat',
         message: { data: { content: 'ping' } }
       }
                  │
                  ├─ 设置：10秒超时定时器
                  │
                  ├─ 收到 pong ──→ 清除超时定时器 ──→ 继续
                  │
                  └─ 超时 ──→ 关闭连接 ──→ 触发重连
```

---

### 🔄 自动重连流程

```
连接关闭/错误
    │
    ▼
检查：是否主动关闭
    │
    ├─ 是（code=1000）──→ 停止
    │
    └─ 否 ──→ 检查重连次数
              │
              ├─ < 5 次 ──→ 安排重连
              │            │
              │            └─ 3 秒后 ──→ 重新连接
              │                         │
              │                         └─ 重连次数 +1
              │
              └─ ≥ 5 次 ──→ 停止重连
                          │
                          └─ 设置状态：'error'
```

---

## 关键代码位置

### 配置文件
| 文件 | 说明 |
|------|------|
| `.env` | WebSocket 服务器地址配置 |
| `src/types/websocket.ts` | WebSocket 基础类型定义 |
| `src/types/chat-websocket.ts` | 聊天消息类型定义 |

### 核心逻辑
| 文件 | 说明 | 关键行号 |
|------|------|---------|
| `src/lib/websocket.ts` | WebSocket 管理器 | 75:连接, 200:事件监听, 365:心跳 |
| `src/store/websocketStore.ts` | WebSocket 状态管理 | 89:连接方法, 232:发送消息 |
| `src/store/chatStore.ts` | 聊天逻辑 | 87:发送消息, 256:接收消息 |

### UI 组件
| 文件 | 说明 |
|------|------|
| `src/components/MessageInput.tsx` | 消息输入框 |
| `src/components/ChatArea.tsx` | 聊天消息显示 |
| `src/components/layout/MessageLayout.tsx` | 消息页面布局 |

### Hooks
| 文件 | 说明 |
|------|------|
| `src/hooks/useWebSocketChatIntegration.ts` | WebSocket 消息集成 |
| `src/hooks/useEnsureWebSocketConnected.ts` | 确保连接 |

---

## 问题排查指南

### 问题 1：无法连接

**症状**：状态一直显示"连接中"或"重连中"

**排查步骤**：
1. **检查 WebSocket 服务器**
   ```bash
   # 测试服务器是否可达
   telnet 192.168.10.19 8001
   ```

2. **检查环境变量**
   ```bash
   # .env 文件
   VITE_WS_URL=ws://192.168.10.19:8001/api/v1/websocket/user/[userId]
   ```

3. **查看控制台日志**
   - 搜索：`❌ [WebSocket 连接错误]`
   - 查看错误详情

4. **检查网络**
   - 防火墙设置
   - 代理配置
   - CORS 策略

**相关代码**：
- `src/store/websocketStore.ts:32-58` - 地址配置
- `src/lib/websocket.ts:75-105` - 连接逻辑

---

### 问题 2：连接成功但状态显示不对

**症状**：能收到消息（控制台有日志），但 UI 显示"未连接"

**排查步骤**：
1. **检查状态同步**
   - 控制台搜索：`🔄 [Store] 同步 WebSocket 状态`
   - 查看 `管理器状态` 和 `是否连接` 是否一致

2. **强制同步状态**
   - 在控制台执行：
     ```javascript
     useWebSocketStore.getState().syncStatus()
     ```

3. **检查回调设置**
   - 控制台搜索：`🔧 [WebSocket] 设置事件回调`
   - 确认包含：`onOpen`, `onClose`, `onError`, `onMessage`

**相关代码**：
- `src/hooks/useEnsureWebSocketConnected.ts:17-40` - 自动同步
- `src/store/websocketStore.ts:319-339` - syncStatus 方法

---

### 问题 3：发送消息失败

**症状**：点击发送后提示"WebSocket未连接"或无反应

**排查步骤**：
1. **检查连接状态**
   ```javascript
   useWebSocketStore.getState().isConnected  // 应该为 true
   ```

2. **检查 Agent 和会话 ID**
   ```javascript
   useChatStore.getState().selectedAgent      // 不能为空
   useChatStore.getState().conversationId     // 不能为 null
   ```

3. **查看发送日志**
   - 控制台搜索：`📤 [ChatStore] 发送WebSocket消息`
   - 检查消息结构是否正确

4. **检查消息格式**
   ```javascript
   {
     type: 'chat_message',
     message: {
       data: { content: '...' },
       id: '...',
       agent_uuid: '...',
       conversation_uuid: '...'
     }
   }
   ```

**相关代码**：
- `src/store/chatStore.ts:87-180` - 发送消息逻辑
- `src/types/chat-websocket.ts:15-31` - 消息类型定义

---

### 问题 4：收不到消息或消息不显示

**症状**：服务器发送了消息，但 UI 不显示

**排查步骤**：
1. **检查 WebSocket 消息**
   - 开发者工具 → Network → WS
   - 查看 Messages 标签
   - 确认收到了消息

2. **检查消息格式**
   - 控制台搜索：`📥 [WebSocket 接收消息]`
   - 确认消息类型是 `chat_message`
   - 确认 status 是 `pending`/`finish`/`error`

3. **检查消息集成**
   - 控制台搜索：`🔗 [WebSocket Chat Integration]`
   - 确认 `是否是聊天消息` 为 `true`
   - 确认调用了 `handleReceiveMessage`

4. **检查消息处理**
   - 控制台搜索：`📦 [ChatStore] 接收到的消息`
   - 确认找到了流式消息占位符
   - 确认消息被添加到了 messages

**相关代码**：
- `src/lib/websocket.ts:255-326` - 消息接收
- `src/hooks/useWebSocketChatIntegration.ts:24-74` - 消息集成
- `src/store/chatStore.ts:256-340` - 消息处理

---

### 问题 5：流式输出不工作

**症状**：消息一次性显示，没有逐字输出

**排查步骤**：
1. **检查后端是否支持流式输出**
   - 后端应该分多次发送 status='pending' 的消息
   - 最后发送 status='finish' 的消息

2. **检查消息占位符**
   - 控制台搜索：`🔍 查找流式消息占位符`
   - 确认找到了 `isStreaming=true` 的消息

3. **检查内容追加**
   - 控制台搜索：`📝 [ChatStore] 追加消息内容`
   - 确认每次 pending 状态都在追加内容

4. **检查完成标记**
   - 控制台搜索：`✅ [ChatStore] 消息接收完成`
   - 确认收到 finish 状态

**相关代码**：
- `src/store/chatStore.ts:280-335` - 流式输出处理

---

## 日志说明

### 关键日志标识

| 日志前缀 | 位置 | 说明 |
|---------|------|------|
| `🎉 [WebSocket 连接成功]` | websocket.ts | 连接建立成功 |
| `🔌 [WebSocket 连接关闭]` | websocket.ts | 连接关闭 |
| `❌ [WebSocket 连接错误]` | websocket.ts | 连接错误 |
| `📤 [ChatStore] 发送WebSocket消息` | chatStore.ts | 发送消息 |
| `📥 [WebSocket 接收消息]` | websocket.ts | 接收消息 |
| `🔗 [WebSocket Chat Integration]` | useWebSocketChatIntegration.ts | 消息集成 |
| `📦 [ChatStore] 接收到的消息` | chatStore.ts | 处理接收消息 |
| `💓 [WebSocket 心跳]` | websocket.ts | 心跳相关 |
| `🔄 [Store] 同步 WebSocket 状态` | websocketStore.ts | 状态同步 |

### 日志级别

- **🎉 成功**：绿色，正常操作成功
- **📤📥 信息**：蓝色，消息收发
- **⚠️ 警告**：黄色，非致命问题
- **❌ 错误**：红色，需要处理的错误

### 如何使用日志排查问题

1. **连接问题**：搜索 `[WebSocket 连接]`
2. **发送问题**：搜索 `📤 [ChatStore]`
3. **接收问题**：搜索 `📥 [WebSocket 接收]` 和 `🔗 [WebSocket Chat Integration]`
4. **状态问题**：搜索 `🔄 [Store] 同步`
5. **心跳问题**：搜索 `💓 [WebSocket 心跳]`

---

## 环境变量配置

### `.env` 文件

```bash
# WebSocket 服务器地址
VITE_WS_URL=ws://192.168.10.19:8001/api/v1/websocket/user/97772489-34af-4179-83ca-00993b382605

# 开发环境标识
VITE_NODE_ENV=development
```

**注意**：
- 修改 `.env` 后需要重启开发服务器
- 生产环境使用 `wss://` 协议（加密）

---

## 最佳实践

1. **连接管理**
   - 应用启动时自动连接
   - 组件卸载时不断开（由管理器统一管理）
   - 使用 `useEnsureWebSocketConnected` 确保连接

2. **消息发送**
   - 发送前检查连接状态
   - 验证 Agent 和会话 ID
   - 使用类型安全的消息结构

3. **错误处理**
   - 捕获所有 WebSocket 错误
   - 提供用户友好的错误提示
   - 自动重连机制

4. **性能优化**
   - 消息历史限制 1000 条
   - 使用 React.memo 优化组件渲染
   - 合理使用 useMemo/useCallback

---

## 技术栈

- **WebSocket**：原生 WebSocket API
- **状态管理**：zustand
- **TypeScript**：类型安全
- **React Hooks**：函数式组件
- **单例模式**：WebSocket 管理器

---

## 更新日志

- **2025-09-30**：创建文档，详细说明数据流和问题排查
