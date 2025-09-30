# WebSocket 自动重连已禁用

## 📝 修改说明

已按照要求**禁用 WebSocket 自动重连功能**。

## 🔧 具体修改

### 1. **禁用连接关闭时的自动重连**

**文件**：`src/lib/websocket.ts:217-228`

```typescript
this.ws.onclose = (event) => {
  console.log('🔌 [WebSocket 连接关闭]', `code: ${event.code}`, event.reason || '')
  this.setConnectionStatus('disconnected')
  this.stopHeartbeat()
  this.callbacks.onClose?.(event)
  
  // 🚫 已禁用自动重连，需要手动重连
  // 如果需要重连，请使用 resetConnection() 或 forceReconnect() 方法
  if (event.code !== 1000 && !this.isDestroyed) {
    console.warn('⚠️ [WebSocket] 连接已断开，自动重连已禁用。请手动重连。')
  }
}
```

**变更**：
- ❌ 移除了 `this.scheduleReconnect()` 调用
- ✅ 添加警告日志，提示用户手动重连

### 2. **禁用连接失败时的自动重连**

**文件**：`src/lib/websocket.ts:99-105`

```typescript
} catch (error) {
  this.log(`WebSocket 连接失败: ${error}`)
  this.setConnectionStatus('error')
  this.callbacks.onError?.(error as Event)
  // 🚫 已禁用自动重连
  console.warn('⚠️ [WebSocket] 连接失败，自动重连已禁用。请手动重连。')
}
```

**变更**：
- ❌ 移除了 `this.scheduleReconnect()` 调用
- ✅ 添加警告日志

### 3. **更新心跳超时提示**

**文件**：`src/lib/websocket.ts:331-335`

```typescript
// 设置心跳超时定时器（不会自动重连，只是关闭连接）
this.heartbeatTimeoutTimer = setTimeout(() => {
  console.warn('💔 [WebSocket 心跳超时] - 连接将被关闭，不会自动重连')
  this.ws?.close(1001, '心跳超时')
}, this.config.heartbeat!.timeout)
```

**变更**：
- ✅ 明确说明不会自动重连

### 4. **禁用 scheduleReconnect 方法**

**文件**：`src/lib/websocket.ts:351-361`

```typescript
/**
 * 安排重连（已禁用自动调用）
 * 此方法仅供内部使用，不会被自动调用
 * 如需重连，请使用 forceReconnect() 或通过 UI 手动触发
 */
private scheduleReconnect(): void {
  // 🚫 自动重连已禁用
  console.warn('⚠️ [WebSocket] scheduleReconnect 已被禁用，请使用手动重连')
  this.setConnectionStatus('error')
  this.callbacks.onReconnectFailed?.()
}
```

**变更**：
- ❌ 移除了所有重连逻辑
- ✅ 直接设置为 error 状态
- ✅ 调用失败回调

## 📊 现在的行为

### ❌ **不会自动重连的情况**

1. ✅ WebSocket 连接关闭（任何 code ≠ 1000）
2. ✅ WebSocket 连接失败
3. ✅ 心跳超时
4. ✅ 网络中断
5. ✅ 服务器错误

### ✅ **需要手动重连**

**方法 1：使用 WebSocketStatus 组件的重连按钮**
```tsx
<WebSocketStatus showReconnectButton={true} />
```

UI 会显示"重连"按钮，点击即可重连。

**方法 2：通过代码调用**
```typescript
// 方式1：强制重连
const { resetConnection } = useWebSocketActions()
resetConnection()

// 方式2：直接访问 WebSocket 管理器
const wsManager = WebSocketManager.getInstance()
wsManager.forceReconnect()
```

## 📋 控制台日志变化

### 连接关闭时

**之前**（自动重连）：
```
🔌 [WebSocket 连接关闭] code: 1006
🔄 [WebSocket 重连] 第 1/5 次
[WebSocket] 连接状态变更: disconnected → reconnecting
```

**现在**（不自动重连）：
```
🔌 [WebSocket 连接关闭] code: 1006
⚠️ [WebSocket] 连接已断开，自动重连已禁用。请手动重连。
[WebSocket] 连接状态变更: connected → disconnected
```

### 心跳超时时

**之前**：
```
💔 [WebSocket 心跳超时]
🔄 [WebSocket 重连] 第 1/5 次
```

**现在**：
```
💔 [WebSocket 心跳超时] - 连接将被关闭，不会自动重连
🔌 [WebSocket 连接关闭] code: 1001 心跳超时
⚠️ [WebSocket] 连接已断开，自动重连已禁用。请手动重连。
```

## 🔍 UI 状态显示

WebSocket 断开后，UI 会显示：
- 状态：🔴 **连接错误**
- 按钮：**重连**（可点击）

## ⚙️ 如果需要恢复自动重连

如果将来需要恢复自动重连功能，可以：

1. 在 `onclose` 事件中恢复调用：
```typescript
if (event.code !== 1000 && !this.isDestroyed) {
  this.scheduleReconnect()  // 恢复这行
}
```

2. 在 `catch` 块中恢复调用：
```typescript
catch (error) {
  this.setConnectionStatus('error')
  this.callbacks.onError?.(error as Event)
  this.scheduleReconnect()  // 恢复这行
}
```

3. 恢复 `scheduleReconnect` 方法的完整实现

## ✅ 测试建议

1. **断开网络**，观察是否不再自动重连
2. **点击重连按钮**，确认手动重连功能正常
3. **查看控制台日志**，确认显示警告信息
4. **等待心跳超时**（40秒），确认不自动重连

## 📅 修改日期

2025-09-30

---

**注意**：现在 WebSocket 断开后需要手动点击"重连"按钮才能恢复连接。
