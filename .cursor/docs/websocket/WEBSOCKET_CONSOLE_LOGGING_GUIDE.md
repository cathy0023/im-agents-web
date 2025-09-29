# WebSocket 控制台日志增强指南

## 🎯 概述

本文档说明了WebSocket系统的控制台日志增强功能，帮助开发者更好地调试和监控WebSocket连接。

## 🔧 增强功能

### 1. **详细的连接日志**
- 🎉 **连接成功**: 显示URL、状态、重连次数重置信息
- 🔌 **连接关闭**: 显示关闭码、原因、是否会重连
- ❌ **连接错误**: 显示错误事件和当前状态

### 2. **消息传输日志**
- 🚀 **发送消息**: 分组显示发送时间、消息类型、内容详情
- 📥 **接收消息**: 分组显示接收时间、原始数据、解析结果
- 💬 **聊天消息**: 显示消息ID、角色、代理ID、内容长度

### 3. **心跳机制日志**
- 💓 **发送心跳**: 显示时间、消息、超时设置
- 💚 **心跳响应**: 显示时间、状态、操作
- 💔 **心跳超时**: 显示超时时长、即将执行的操作

### 4. **重连机制日志**
- 🔄 **安排重连**: 显示重连次数、间隔、下次重连时间
- ⏰ **开始重连**: 显示当前重连次数
- 🚫 **重连失败**: 显示重连次数达到上限

### 5. **Store状态日志**
- 🎊 **状态更新**: Store层面的状态变化
- 📚 **消息历史**: 消息历史更新和数量统计
- ✅ **操作结果**: 发送成功/失败的反馈

## 📊 日志示例

### 连接建立过程
```
🎉 [WebSocket 连接成功] {
  时间: "2024/1/15 14:30:25",
  URL: "ws://192.168.10.19:8001/api/v1/websocket/user/...",
  状态: "connected",
  重连次数重置: 0
}

🎊 [Store] WebSocket 连接成功，更新状态
```

### 消息发送过程
```
🚀 [WebSocket 发送消息]
  📤 发送时间: 2024/1/15 14:30:30
  📝 消息类型: chat_message
  📄 消息内容: {"id":"..","type":"chat_message",...}
  🔍 消息详情: {id: "...", type: "chat_message", data: {...}}

✅ [Store] 消息发送成功
```

### 消息接收过程
```
📥 [WebSocket 接收消息]
  📨 接收时间: 2024/1/15 14:30:31
  📄 原始数据: {"type":"chat_message","data":{"content":"..."}}
  ✅ JSON 解析成功
  📝 消息类型: chat_message
  🔍 消息详情: {type: "chat_message", data: {...}}

📬 [Store] 收到 WebSocket 消息
  消息类型: chat_message
  消息内容: {type: "chat_message", ...}
  接收时间: 2024/1/15 14:30:31
```

### 心跳机制
```
💓 [WebSocket 发送心跳] {
  时间: "2024/1/15 14:30:35",
  消息: {id: "...", type: "heartbeat", data: {ping: true}},
  超时设置: "10000ms"
}

💚 [WebSocket 心跳响应] {
  时间: "2024/1/15 14:30:35",
  状态: "连接正常",
  操作: "清除超时定时器"
}
```

### 重连机制
```
🔄 [WebSocket 安排重连] {
  时间: "2024/1/15 14:31:00",
  当前重连次数: 1,
  最大重连次数: 5,
  重连间隔: "3000ms",
  下次重连时间: "2024/1/15 14:31:03"
}

⏰ [WebSocket 开始重连] {
  时间: "2024/1/15 14:31:03",
  重连次数: 1
}
```

## 🧪 测试工具

### WebSocket测试页面增强
访问 `/debug/websocket-test` 页面，现在包含：

1. **基础连接控制**
   - URL配置
   - 连接/断开按钮
   - 连接状态显示

2. **快速测试按钮**
   - 简单文本消息
   - JSON格式消息
   - 特殊字符消息
   - 心跳测试消息

3. **自动化测试序列**
   - 一键运行多个测试用例
   - 自动记录测试结果
   - 详细的测试日志

4. **实时消息历史**
   - 显示发送和接收的消息
   - 时间戳记录
   - 消息类型区分

### 测试工具API
```typescript
import { TEST_MESSAGES, runWebSocketTests, WebSocketLogTester } from '@/utils/websocket-test-helper'

// 发送预定义测试消息
sendMessage(TEST_MESSAGES.SIMPLE_TEXT)
sendMessage(TEST_MESSAGES.JSON_MESSAGE)
sendMessage(TEST_MESSAGES.SPECIAL_CHARS)

// 运行自动化测试
const results = await runWebSocketTests(sendMessageFunction)

// 使用日志测试工具
const tester = WebSocketLogTester.getInstance()
tester.startLogging()
tester.logTestStep('1', '测试连接')
tester.logTestResult('连接测试', true, '连接成功')
tester.stopLogging()
```

## 🔍 如何查看日志

### 1. 打开开发者工具
- **Chrome/Edge**: 按 `F12` 或 `Ctrl+Shift+I`
- **Firefox**: 按 `F12` 或 `Ctrl+Shift+K`
- **Safari**: 按 `Cmd+Option+I`

### 2. 切换到Console标签
在开发者工具中点击 "Console" 标签

### 3. 过滤WebSocket日志
在控制台搜索框中输入：
- `[WebSocket]` - 查看所有WebSocket相关日志
- `[Store]` - 查看Store状态变化日志
- `🚀` - 查看发送消息日志
- `📥` - 查看接收消息日志
- `💓` - 查看心跳相关日志
- `🔄` - 查看重连相关日志

### 4. 展开分组日志
点击日志分组前的箭头展开查看详细信息

## 📋 日志级别说明

### 信息级别 (console.log)
- 🎉 连接成功
- 📤 消息发送
- 📥 消息接收
- 💓 心跳正常
- 🔄 重连尝试

### 警告级别 (console.warn)
- ⚠️ 连接状态异常
- 💔 心跳超时警告
- 🔌 非正常断开连接

### 错误级别 (console.error)
- ❌ 连接错误
- 💥 消息发送失败
- 🚫 重连失败
- 💀 致命错误

## 🎯 调试技巧

### 1. 监控连接状态
观察连接建立、维持、断开的完整过程

### 2. 追踪消息流
查看每条消息的发送和接收详情，包括时间戳和内容

### 3. 分析心跳机制
监控心跳发送频率和响应时间，判断连接质量

### 4. 诊断重连问题
查看重连触发原因、重连次数和成功率

### 5. 性能分析
通过时间戳分析消息传输延迟和处理时间

## 🔧 配置选项

### WebSocket配置
```typescript
const config = {
  url: 'ws://...',
  reconnectAttempts: 5,      // 最大重连次数
  reconnectInterval: 3000,   // 重连间隔(ms)
  heartbeat: {
    interval: 30000,         // 心跳间隔(ms)
    timeout: 10000,          // 心跳超时(ms)
    message: 'ping'
  },
  debug: true                // 开启调试模式
}
```

### 日志控制
- 开发环境默认开启所有日志
- 生产环境可通过配置控制日志级别
- 支持按模块过滤日志输出

## 📈 监控指标

通过控制台日志可以监控以下指标：

1. **连接稳定性**
   - 连接成功率
   - 断开频率
   - 重连成功率

2. **消息传输**
   - 发送成功率
   - 接收及时性
   - 消息丢失情况

3. **心跳健康**
   - 心跳响应时间
   - 心跳超时频率
   - 连接质量评估

4. **性能表现**
   - 消息处理延迟
   - 内存使用情况
   - 错误发生频率

## 🎉 总结

增强的WebSocket控制台日志系统提供了：

- ✅ **完整的连接生命周期追踪**
- ✅ **详细的消息传输记录**
- ✅ **实时的心跳监控**
- ✅ **智能的重连诊断**
- ✅ **便捷的测试工具**
- ✅ **直观的状态展示**

现在你可以通过浏览器控制台完全掌握WebSocket的运行状态，快速定位和解决连接问题！

---

**使用提示**: 访问 `http://localhost:5173/debug/websocket-test` 开始测试WebSocket功能并查看控制台日志。
