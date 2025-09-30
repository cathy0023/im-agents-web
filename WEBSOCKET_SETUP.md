# WebSocket 连接设置指南

## 🎯 概述

WebSocket 连接已经成功集成到应用中，现在会在应用启动时自动连接。

## 🔧 功能特性

### ✅ 已完成的功能

1. **自动连接检测** - 应用启动时自动检测最佳WebSocket连接
2. **连接状态显示** - 在顶部Header中显示实时连接状态
3. **自动重连机制** - 连接断开时自动尝试重连（最多5次）
4. **心跳机制** - 每30秒发送心跳包保持连接活跃
5. **错误处理** - 完善的错误处理和用户提示
6. **测试工具** - 专门的WebSocket测试页面

### 🎨 用户界面

- **状态指示器**: 在顶部Header中央显示WebSocket连接状态
  - 🟢 已连接
  - 🟡 连接中...
  - 🔄 重连中...
  - 🔴 连接错误
  - ⚪ 未连接

- **重连按钮**: 连接失败时显示重连按钮

## 🚀 使用方法

### 1. 查看连接状态

启动应用后，在顶部Header中央可以看到WebSocket连接状态指示器。

### 2. 测试连接

访问 `/debug/websocket-test` 页面（仅开发环境）进行详细的WebSocket连接测试。

### 3. 手动重连

如果连接失败，点击状态指示器旁边的"重连"按钮。

## ⚙️ 配置选项

### 环境变量配置

可以通过环境变量 `VITE_WS_URL` 指定WebSocket服务器地址：

```bash
VITE_WS_URL=ws://your-server:8001/api/v1/websocket/user/your-user-id
```

### 自动检测逻辑

如果没有配置环境变量，应用会按以下顺序尝试连接：

1. **公共测试服务器**: `wss://echo.websocket.org` (开发环境)
2. **本地开发服务器**: `ws://localhost:8001/api/v1/websocket/user/{userId}`
3. **当前域名服务器**: 基于当前访问域名构建WebSocket URL

## 🔍 调试信息

### 控制台日志

WebSocket连接会输出详细的控制台日志，包括：

- 连接尝试和结果
- 消息发送和接收
- 心跳机制状态
- 重连尝试
- 错误信息

### 测试页面

开发环境下可以访问 `/debug/websocket-test` 页面：

- 实时连接状态
- 手动发送测试消息
- 消息历史记录
- 自动化测试功能

## 🛠️ 故障排除

### 常见问题

1. **连接失败**
   - 检查WebSocket服务器是否运行
   - 确认防火墙设置
   - 查看浏览器控制台错误信息

2. **频繁断线**
   - 检查网络稳定性
   - 确认服务器配置
   - 调整心跳间隔设置

3. **消息发送失败**
   - 确认连接状态为"已连接"
   - 检查消息格式
   - 查看控制台错误日志

### 技术支持

如果遇到问题，请：

1. 打开浏览器开发者工具 (F12)
2. 查看Console标签页的错误信息
3. 访问 `/debug/websocket-test` 页面进行诊断
4. 提供详细的错误信息和复现步骤

## 📝 开发说明

### 核心文件

- `src/store/websocketStore.ts` - WebSocket状态管理
- `src/lib/websocket.ts` - WebSocket管理器
- `src/components/WebSocketStatus.tsx` - 状态显示组件
- `src/utils/websocket-connection-test.ts` - 连接测试工具

### 集成方式

WebSocket已经集成到聊天系统中，通过 `useWebSocketChatIntegration` Hook 自动处理消息同步。

---

🎉 **WebSocket连接已成功设置！** 现在可以在应用中看到实时的连接状态，并享受稳定的WebSocket通信功能。
