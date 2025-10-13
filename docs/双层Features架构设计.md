# 双层 Features 架构设计

## 🎯 设计理念

将原来的 `features/` 拆分为两层：
- **`core-features/`** - 基础能力模块（技术基础设施）
- **`business-features/`** - 业务功能模块（完整的业务功能）

每个模块都是**自包含**的，避免内容分散到不同文件夹。

## 📁 推荐目录结构

```
src/
├── app/                          # 应用程序配置
│   ├── index.tsx                # 应用入口
│   ├── provider.tsx             # 全局 Provider
│   └── router.tsx               # 路由配置
│
├── core-features/               # 基础能力模块 🔧
│   ├── websocket/              # WebSocket 基础能力 ⭐
│   │   ├── components/         # WebSocket 状态显示组件
│   │   │   ├── WebSocketStatus.tsx
│   │   │   └── index.ts
│   │   ├── hooks/              # WebSocket Hooks
│   │   │   ├── useWebSocket.ts
│   │   │   ├── useWebSocketStatus.ts
│   │   │   └── index.ts
│   │   ├── lib/                # WebSocket 核心逻辑
│   │   │   ├── websocket-client.ts
│   │   │   ├── websocket-manager.ts
│   │   │   └── index.ts
│   │   ├── stores/             # WebSocket 状态管理
│   │   │   ├── websocketStore.ts
│   │   │   └── index.ts
│   │   ├── types/              # WebSocket 类型定义
│   │   │   ├── websocket.ts
│   │   │   └── index.ts
│   │   ├── utils/              # WebSocket 工具函数
│   │   │   ├── message-parser.ts
│   │   │   └── index.ts
│   │   └── index.ts            # WebSocket 模块统一导出
│   │
│   ├── http-client/            # HTTP 客户端基础能力 ⭐
│   │   ├── components/         # API 相关组件
│   │   │   ├── ApiErrorBoundary.tsx
│   │   │   ├── LoadingSpinner.tsx
│   │   │   └── index.ts
│   │   ├── hooks/              # HTTP Hooks
│   │   │   ├── useApi.ts
│   │   │   ├── useMutation.ts
│   │   │   ├── useQuery.ts
│   │   │   └── index.ts
│   │   ├── lib/                # HTTP 客户端核心
│   │   │   ├── api-client.ts
│   │   │   ├── interceptors.ts
│   │   │   └── index.ts
│   │   ├── types/              # API 类型定义
│   │   │   ├── api.ts
│   │   │   ├── response.ts
│   │   │   └── index.ts
│   │   ├── utils/              # HTTP 工具函数
│   │   │   ├── error-handler.ts
│   │   │   ├── request-formatter.ts
│   │   │   └── index.ts
│   │   └── index.ts            # HTTP 模块统一导出
│   │
│   ├── i18n/                   # 国际化基础能力 ⭐
│   │   ├── components/         # 国际化组件
│   │   │   ├── LanguageSwitcher.tsx
│   │   │   ├── RTLProvider.tsx
│   │   │   └── index.ts
│   │   ├── hooks/              # 国际化 Hooks
│   │   │   ├── useI18n.ts
│   │   │   ├── useTranslation.ts
│   │   │   └── index.ts
│   │   ├── lib/                # i18n 核心配置
│   │   │   ├── i18n-config.ts
│   │   │   ├── resource-loader.ts
│   │   │   └── index.ts
│   │   ├── stores/             # 国际化状态
│   │   │   ├── i18nStore.ts
│   │   │   └── index.ts
│   │   ├── types/              # 国际化类型
│   │   │   ├── language.ts
│   │   │   ├── translation.ts
│   │   │   └── index.ts
│   │   ├── assets/             # 翻译资源 ⭐
│   │   │   └── locales/
│   │   │       ├── zh/
│   │   │       │   ├── common.json
│   │   │       │   ├── errors.json
│   │   │       │   └── ui.json
│   │   │       ├── en/
│   │   │       └── ar/
│   │   └── index.ts            # i18n 模块统一导出
│   │
│   ├── auth/                   # 认证基础能力 ⭐
│   │   ├── components/         # 认证组件
│   │   │   ├── ProtectedRoute.tsx
│   │   │   ├── AuthGuard.tsx
│   │   │   └── index.ts
│   │   ├── hooks/              # 认证 Hooks
│   │   │   ├── useAuth.ts
│   │   │   ├── usePermissions.ts
│   │   │   └── index.ts
│   │   ├── lib/                # 认证核心逻辑
│   │   │   ├── auth-client.ts
│   │   │   ├── token-manager.ts
│   │   │   └── index.ts
│   │   ├── stores/             # 认证状态
│   │   │   ├── authStore.ts
│   │   │   └── index.ts
│   │   ├── types/              # 认证类型
│   │   │   ├── user.ts
│   │   │   ├── permissions.ts
│   │   │   └── index.ts
│   │   └── index.ts            # 认证模块统一导出
│   │
│   └── theme/                  # 主题基础能力 ⭐
│       ├── components/
│       │   ├── ThemeToggle.tsx
│       │   ├── ThemeProvider.tsx
│       │   └── index.ts
│       ├── hooks/
│       │   ├── useTheme.ts
│       │   └── index.ts
│       ├── lib/
│       │   ├── theme-config.ts
│       │   └── index.ts
│       ├── stores/
│       │   ├── themeStore.ts
│       │   └── index.ts
│       ├── types/
│       │   ├── theme.ts
│       │   └── index.ts
│       └── index.ts
│
├── business-features/          # 业务功能模块 🎯
│   ├── chat/                  # 聊天业务功能 ⭐
│   │   ├── components/        # 聊天组件
│   │   │   ├── ChatArea.tsx
│   │   │   ├── ChatBubble.tsx
│   │   │   ├── MessageInput.tsx
│   │   │   ├── ConversationList.tsx
│   │   │   └── index.ts
│   │   ├── hooks/             # 聊天 Hooks
│   │   │   ├── useChat.ts
│   │   │   ├── useMessages.ts
│   │   │   ├── useWebSocketChat.ts  # 使用 core-features/websocket
│   │   │   └── index.ts
│   │   ├── api/               # 聊天 API
│   │   │   ├── messages.ts
│   │   │   ├── conversations.ts
│   │   │   └── index.ts
│   │   ├── stores/            # 聊天状态
│   │   │   ├── chatStore.ts
│   │   │   ├── conversationStore.ts
│   │   │   └── index.ts
│   │   ├── types/             # 聊天类型
│   │   │   ├── chat.ts
│   │   │   ├── message.ts
│   │   │   ├── conversation.ts
│   │   │   └── index.ts
│   │   ├── pages/             # 聊天页面
│   │   │   ├── ChatPage.tsx
│   │   │   ├── ChatHistory.tsx
│   │   │   └── index.ts
│   │   ├── routes/            # 聊天路由
│   │   │   └── index.tsx
│   │   ├── utils/             # 聊天工具函数
│   │   │   ├── message-formatter.ts
│   │   │   ├── conversation-utils.ts
│   │   │   └── index.ts
│   │   ├── assets/            # 聊天专属资源
│   │   │   └── locales/       # 聊天专属翻译
│   │   │       ├── zh.json
│   │   │       ├── en.json
│   │   │       └── ar.json
│   │   └── index.ts           # 聊天模块统一导出
│   │
│   ├── agents/                # AI助手业务功能 ⭐
│   │   ├── components/
│   │   │   ├── AgentList.tsx
│   │   │   ├── AgentCard.tsx
│   │   │   ├── AgentDebug.tsx
│   │   │   └── index.ts
│   │   ├── hooks/
│   │   │   ├── useAgents.ts
│   │   │   ├── useAgentInvoke.ts
│   │   │   └── index.ts
│   │   ├── api/
│   │   │   ├── agents.ts
│   │   │   └── index.ts
│   │   ├── stores/
│   │   │   ├── agentsStore.ts
│   │   │   └── index.ts
│   │   ├── types/
│   │   │   ├── agent.ts
│   │   │   └── index.ts
│   │   ├── pages/
│   │   │   ├── AgentsPage.tsx
│   │   │   ├── AgentDetail.tsx
│   │   │   └── index.ts
│   │   ├── routes/
│   │   │   └── index.tsx
│   │   ├── utils/
│   │   │   ├── agent-formatter.ts
│   │   │   └── index.ts
│   │   ├── assets/
│   │   │   └── locales/
│   │   │       ├── zh.json
│   │   │       ├── en.json
│   │   │       └── ar.json
│   │   └── index.ts
│   │
│   ├── contacts/              # 联系人业务功能 ⭐
│   │   ├── components/
│   │   │   ├── ContactsList.tsx
│   │   │   ├── ContactCard.tsx
│   │   │   ├── ContactChatArea.tsx
│   │   │   └── index.ts
│   │   ├── hooks/
│   │   │   ├── useContacts.ts
│   │   │   └── index.ts
│   │   ├── api/
│   │   │   ├── contacts.ts
│   │   │   └── index.ts
│   │   ├── stores/
│   │   │   ├── contactsStore.ts
│   │   │   └── index.ts
│   │   ├── types/
│   │   │   ├── contact.ts
│   │   │   └── index.ts
│   │   ├── pages/
│   │   │   ├── ContactsPage.tsx
│   │   │   └── index.ts
│   │   ├── routes/
│   │   │   └── index.tsx
│   │   ├── utils/
│   │   │   └── index.ts
│   │   ├── assets/
│   │   │   └── locales/
│   │   └── index.ts
│   │
│   └── analytics/             # 数据分析业务功能 ⭐
│       ├── components/
│       │   ├── ChartArea.tsx
│       │   ├── DataTable.tsx
│       │   └── index.ts
│       ├── hooks/
│       │   ├── useDataEyes.ts
│       │   ├── useAnalytics.ts
│       │   └── index.ts
│       ├── api/
│       │   ├── analytics.ts
│       │   └── index.ts
│       ├── stores/
│       │   ├── analyticsStore.ts
│       │   └── index.ts
│       ├── types/
│       │   ├── analytics.ts
│       │   └── index.ts
│       ├── pages/
│       │   ├── AnalyticsPage.tsx
│       │   └── index.ts
│       ├── routes/
│       │   └── index.tsx
│       ├── utils/
│       │   ├── chart-utils.ts
│       │   └── index.ts
│       ├── assets/
│       │   └── locales/
│       └── index.ts
│
├── components/                 # 全局通用组件
│   ├── ui/                    # shadcn UI 基础组件
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   └── index.ts
│   ├── layout/                # 全局布局组件
│   │   ├── AppLayout.tsx
│   │   ├── Header.tsx
│   │   ├── Sidebar.tsx
│   │   └── index.ts
│   └── feedback/              # 全局反馈组件
│       ├── ErrorBoundary.tsx
│       ├── Loading.tsx
│       └── index.ts
│
├── config/                    # 应用配置
│   ├── env.ts
│   ├── constants.ts
│   └── app.ts
│
├── utils/                     # 全局工具函数
│   ├── format.ts
│   ├── validation.ts
│   └── index.ts
│
├── types/                     # 全局类型定义
│   ├── common.ts
│   └── index.ts
│
├── assets/                    # 全局静态资源
│   ├── images/
│   ├── icons/
│   └── fonts/
│
├── styles/                    # 全局样式
│   ├── globals.css
│   └── components.css
│
├── App.tsx                    # 应用根组件
├── main.tsx                   # 程序入口
└── vite-env.d.ts             # 类型声明
```

## 🔑 核心设计原则

### 1. 双层分离原则

```typescript
// 基础能力模块 - 技术导向
core-features/
├── websocket/     # WebSocket 技术能力
├── http-client/   # HTTP 客户端技术能力
├── i18n/          # 国际化技术能力
├── auth/          # 认证技术能力
└── theme/         # 主题技术能力

// 业务功能模块 - 业务导向
business-features/
├── chat/          # 聊天业务功能
├── agents/        # AI助手业务功能
├── contacts/      # 联系人业务功能
└── analytics/     # 数据分析业务功能
```

### 2. 自包含原则

每个模块（无论是基础能力还是业务功能）都包含完整的技术栈：

```typescript
// 每个模块的标准结构
[module-name]/
├── components/    # 模块专属组件
├── hooks/         # 模块专属 Hooks
├── lib/           # 模块核心逻辑 (仅基础能力模块)
├── api/           # 模块 API 接口 (仅业务功能模块)
├── stores/        # 模块状态管理
├── types/         # 模块类型定义
├── pages/         # 模块页面 (仅业务功能模块)
├── routes/        # 模块路由 (仅业务功能模块)
├── utils/         # 模块工具函数
├── assets/        # 模块专属资源
└── index.ts       # 模块统一导出
```

### 3. 依赖关系原则

```typescript
// 依赖方向
business-features/* → core-features/*
business-features/* → components/
core-features/* → components/

// 禁止的依赖
core-features/* ❌→ business-features/*
business-features/chat ❌→ business-features/agents
```

## 🔄 模块间通信

### 1. 业务功能使用基础能力

```typescript
// business-features/chat/hooks/useWebSocketChat.ts
import { useWebSocket } from '@/core-features/websocket'
import { useI18n } from '@/core-features/i18n'

export const useWebSocketChat = () => {
  const { connect, sendMessage, isConnected } = useWebSocket()
  const { t } = useI18n()
  
  const sendChatMessage = (message: string, agentId: string) => {
    sendMessage({
      type: 'chat_message',
      data: { message, agentId }
    })
  }
  
  return {
    isConnected,
    sendChatMessage,
    statusText: t('chat.connection_status')
  }
}
```

### 2. 业务功能间通信

```typescript
// 通过全局事件系统
// business-features/chat/hooks/useChat.ts
import { appEvents } from '@/utils/events'

export const useChat = () => {
  const sendMessage = async (message: string) => {
    // 发送消息
    await chatApi.sendMessage(message)
    
    // 通知其他业务模块
    appEvents.emit('chat:message_sent', { message })
  }
}

// business-features/agents/hooks/useAgents.ts
import { appEvents } from '@/utils/events'

export const useAgents = () => {
  useEffect(() => {
    const handleChatMessage = (data: { message: string }) => {
      // 响应聊天消息，可能触发 AI 助手
      console.log('收到聊天消息:', data.message)
    }
    
    appEvents.on('chat:message_sent', handleChatMessage)
    return () => appEvents.off('chat:message_sent', handleChatMessage)
  }, [])
}
```

## 📊 与当前项目的迁移映射

### 当前结构 → 双层 Features 结构

```typescript
// 基础能力迁移
src/lib/websocket.ts              → src/core-features/websocket/lib/websocket-client.ts
src/lib/utils.ts                  → src/core-features/theme/lib/theme-config.ts
src/store/websocketStore.ts       → src/core-features/websocket/stores/websocketStore.ts
src/store/themeStore.ts           → src/core-features/theme/stores/themeStore.ts
src/store/i18nStore.ts            → src/core-features/i18n/stores/i18nStore.ts
src/hooks/useI18n.ts              → src/core-features/i18n/hooks/useI18n.ts
src/i18n/                         → src/core-features/i18n/assets/locales/

// 业务功能迁移
src/components/chat/              → src/business-features/chat/components/
src/components/agents/            → src/business-features/agents/components/
src/components/contacts/          → src/business-features/contacts/components/
src/components/dataEyes/          → src/business-features/analytics/components/
src/store/chatStore.ts            → src/business-features/chat/stores/chatStore.ts
src/store/agentsStore.ts          → src/business-features/agents/stores/agentsStore.ts
src/types/chat-websocket.ts       → src/business-features/chat/types/chat.ts
src/types/contacts.ts             → src/business-features/contacts/types/contact.ts

// 全局组件保持
src/components/ui/                → src/components/ui/ (保持)
src/components/layout/Header.tsx  → src/components/layout/Header.tsx (保持)
src/components/common/            → src/components/ (重新分类)
```

## 🎯 使用示例

### 基础能力模块使用

```typescript
// 使用 WebSocket 基础能力
import { useWebSocket, WebSocketStatus } from '@/core-features/websocket'

// 使用 HTTP 客户端基础能力
import { useApi, ApiErrorBoundary } from '@/core-features/http-client'

// 使用国际化基础能力
import { useI18n, LanguageSwitcher } from '@/core-features/i18n'

// 使用认证基础能力
import { useAuth, ProtectedRoute } from '@/core-features/auth'

// 使用主题基础能力
import { useTheme, ThemeToggle } from '@/core-features/theme'
```

### 业务功能模块使用

```typescript
// 使用聊天业务功能
import { ChatArea, useChat } from '@/business-features/chat'

// 使用 Agents 业务功能
import { AgentList, useAgents } from '@/business-features/agents'

// 使用联系人业务功能
import { ContactsList, useContacts } from '@/business-features/contacts'

// 使用数据分析业务功能
import { ChartArea, useAnalytics } from '@/business-features/analytics'
```

## ✅ 设计优势

### 1. 高内聚性 ⭐
- 每个模块的所有相关代码都在同一个目录下
- 不再有内容分散到不同文件夹的问题

### 2. 清晰的职责分离
- **基础能力模块**：提供技术基础设施，可复用
- **业务功能模块**：实现具体业务功能，自包含

### 3. 更好的可维护性
- 修改某个功能只需在对应模块内操作
- 删除某个模块不影响其他模块

### 4. 团队协作友好
- 基础设施团队维护 `core-features/`
- 业务团队维护 `business-features/`
- 各团队职责清晰，减少冲突

### 5. 扩展性强
- 新增基础能力：在 `core-features/` 下创建新模块
- 新增业务功能：在 `business-features/` 下创建新模块
- 每个模块都有标准的目录结构

这个设计既保持了模块的自包含性，又明确区分了基础能力和业务功能，是一个更加合理的架构方案！
