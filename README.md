# IM Agents Web

基于 React + TypeScript + Tailwind CSS + shadcn UI 构建的企业级智能对话系统前端。

## ✨ 特性

- 🎨 现代化的UI设计，类似企业微信界面
- 🌓 支持深色/浅色主题切换
- 🌍 完整的国际化支持（中文/英文/阿拉伯文）
- 🔄 支持 RTL（从右到左）布局
- 📱 完全响应式布局
- 🎯 完整的TypeScript类型支持
- 🚀 基于Vite构建，极速开发体验
- 🎪 使用shadcn UI组件库
- 🔌 WebSocket实时通信
- 🤖 多智能体（Agent）支持
- 📊 数据可视化分析

## 📂 项目结构

```
src/
├── api/                      # API接口层
│   ├── client.ts            # HTTP客户端基础层
│   ├── types.ts             # API类型定义
│   └── modules/             # 业务模块API
│       └── agents/          # Agents模块
├── components/              # React组件
│   ├── ui/                  # shadcn UI基础组件
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── input.tsx
│   │   ├── dropdown-menu.tsx
│   │   └── ...
│   ├── common/              # 通用业务组件
│   │   ├── Header.tsx       # 顶部导航栏
│   │   ├── Sidebar.tsx      # 左侧导航栏
│   │   ├── ThemeToggle.tsx  # 主题切换
│   │   └── WebSocketStatus.tsx
│   ├── LanguageSwitcher.tsx # 语言切换组件
│   ├── layout/              # 布局组件
│   │   ├── MessageLayout.tsx
│   │   ├── AnalysisLayout.tsx
│   │   ├── ContactMessageLayout.tsx
│   │   └── DataEyesLayout.tsx
│   ├── chat/                # 聊天相关组件
│   │   ├── ChatArea.tsx
│   │   ├── ChatBubble.tsx
│   │   ├── MessageInput.tsx
│   │   └── ConversationList.tsx
│   ├── agents/              # Agents相关组件
│   │   ├── AgentList.tsx
│   │   └── DebugAgents.tsx
│   ├── contacts/            # 联系人相关组件
│   │   ├── ContactsList.tsx
│   │   └── ContactChatArea.tsx
│   └── dataEyes/            # 数据视图组件
│       └── ChartArea.tsx
├── i18n/                    # 国际化配置
│   ├── index.ts             # i18n初始化配置
│   ├── types.ts             # 国际化类型定义
│   └── resources/           # 翻译资源文件
│       ├── zh/              # 中文翻译
│       │   ├── common.json
│       │   ├── chat.json
│       │   ├── agents.json
│       │   └── ui.json
│       ├── en/              # 英文翻译
│       │   ├── common.json
│       │   ├── chat.json
│       │   ├── agents.json
│       │   └── ui.json
│       └── ar/              # 阿拉伯文翻译
│           ├── common.json
│           ├── chat.json
│           ├── agents.json
│           └── ui.json
├── store/                   # Zustand状态管理
│   ├── agentsStore.ts       # Agents状态
│   ├── chatStore.ts         # 聊天状态
│   ├── conversationStore.ts # 会话状态
│   ├── themeStore.ts        # 主题状态
│   ├── i18nStore.ts         # 国际化状态
│   ├── userStore.ts         # 用户状态
│   └── websocketStore.ts    # WebSocket状态
├── config/                  # 配置文件
│   ├── features.ts          # 功能开关配置
│   ├── navigation.ts        # 导航配置
│   └── site.ts              # 站点配置
├── hooks/                   # 自定义Hooks
│   ├── useI18n.ts           # 国际化Hook
│   ├── useWebSocketChatIntegration.ts
│   ├── useEnsureWebSocketConnected.ts
│   └── useDataEyesPreferences.ts
├── lib/                     # 工具函数库
│   ├── utils.ts             # 通用工具函数
│   ├── websocket.ts         # WebSocket管理
│   └── sse.ts               # Server-Sent Events
├── types/                   # TypeScript类型定义
│   ├── chat-websocket.ts
│   ├── conversation.ts
│   ├── contacts.ts
│   ├── dataEyes.ts
│   ├── router.ts
│   ├── user.ts
│   └── websocket.ts
├── App.tsx                  # 主应用组件
├── main.tsx                 # 应用入口
└── index.css                # 全局样式
```

## 🚀 开发命令

```bash
# 安装依赖
npm install

# 启动开发服务器（默认端口：5173）
npm run dev

# 构建生产版本
npm run build

# 预览生产构建
npm run preview

# 代码检查
npm run lint
```

## 🎨 界面布局

### 整体布局
采用三栏式布局设计，类似企业微信界面：

```
┌─────────────────────────────────────────────────────────┐
│  Header (顶部导航栏)                                     │
│  - 搜索框 | 通知 | 设置 | 主题切换                        │
├──────┬─────────────────────────┬────────────────────────┤
│      │                         │                        │
│ 最左 │   中间区域               │   主内容区              │
│ 侧导 │   (ConversationList)    │   (ChatArea)           │
│ 航栏 │   会话列表/联系人列表     │   消息显示/输入框       │
│      │                         │                        │
│ Sid- │   - Agent会话           │   - 消息气泡           │
│ ebar │   - 联系人对话           │   - 输入区域           │
│      │   - 历史记录             │   - 数据展示           │
│      │                         │                        │
└──────┴─────────────────────────┴────────────────────────┘
```

### 核心区域说明

#### 1. 顶部 Header
- **搜索功能**: 全局搜索会话和联系人
- **WebSocket状态**: 实时显示连接状态
- **主题切换**: 深色/浅色模式切换
- **用户设置**: 个人资料和系统设置

#### 2. 最左侧导航栏 (Sidebar)
- **消息模块**: 切换到消息/对话界面
- **Agents模块**: 查看和管理智能体
- **联系人模块**: 联系人列表和通讯录
- **数据视图模块**: 数据可视化分析
- **分析模块**: 数据统计和分析工具

#### 3. 中间区域 (根据模块动态切换)
- **会话列表**: 显示所有对话会话（MessageLayout）
- **联系人列表**: 显示通讯录（ContactsList）
- **Agent列表**: 显示可用智能体（AgentList）
- **数据视图**: 数据分析和图表（DataEyesLayout）

#### 4. 主内容区 (根据选中项动态加载)
- **聊天区域**: 
  - 消息气泡展示（ChatBubble）
  - 实时消息流
  - 打字状态提示
- **输入区域**:
  - 富文本消息输入（MessageInput）
  - 文件上传
  - 表情选择
- **分析面板**: 数据图表和统计信息

## 🔧 技术栈

### 核心框架
- **React 19** - UI框架
- **TypeScript 5.8** - 类型安全
- **Vite 7.1** - 构建工具

### UI组件库
- **Tailwind CSS 4.1** - 原子化CSS框架
- **shadcn UI** - 高质量React组件库
- **Lucide React** - 图标库
- **Framer Motion 12** - 动画库

### 国际化
- **react-i18next 15.3** - React国际化框架
- **i18next 24.3** - 国际化核心库
- **i18next-browser-languagedetector 8.0** - 浏览器语言检测

### 状态管理与通信
- **Zustand 5.0** - 轻量级状态管理
- **Axios 1.12** - HTTP客户端
- **WebSocket** - 实时通信
- **Server-Sent Events (SSE)** - 服务器推送

### 路由
- **React Router 7.9** - 客户端路由

### 工具库
- **class-variance-authority** - CSS类名变体管理
- **clsx / tailwind-merge** - 类名合并工具
- **js-cookie** - Cookie管理

## 🌟 核心功能

### 1. 多智能体对话系统
- 支持与多个AI智能体同时对话
- 动态切换不同Agent
- Agent能力和状态展示

### 2. 实时通信
- WebSocket长连接支持
- 消息实时推送
- 连接状态监控和自动重连
- SSE流式响应支持

### 3. 会话管理
- 多会话并行管理
- 会话历史记录
- 会话搜索和筛选
- 会话置顶和删除

### 4. 国际化系统
- 支持多语言切换（中文/英文/阿拉伯文）
- RTL（从右到左）布局支持
- 自动检测浏览器语言
- 语言偏好持久化
- 命名空间管理翻译资源

### 5. 主题系统
- 深色模式/浅色模式
- 系统主题自动跟随
- 主题偏好持久化
- 语义化颜色系统（自动适配主题）

### 6. 数据可视化
- 聊天数据统计
- 交互图表展示
- 数据导出功能

## 🔐 用户认证

项目使用 Cookie-based Session 认证：
- 自动Session初始化
- Session有效期管理
- 登录状态持久化

## 🎯 开发规范

- **组件开发**: 优先使用 shadcn UI 组件
- **样式规范**: 使用 Tailwind CSS + 语义化颜色（支持主题切换）
- **国际化**: 所有用户可见文本必须使用 i18n 翻译函数
- **RTL支持**: 所有组件必须考虑 RTL 布局适配
- **类型安全**: 严格的 TypeScript 类型检查
- **状态管理**: 使用 Zustand 进行全局状态管理
- **代码组织**: 按功能模块组织代码结构

## 🌍 国际化使用指南

### 支持的语言

| 语言 | 代码 | 方向 | 旗帜 |
|------|------|------|------|
| 简体中文 | `zh` | LTR | 🇨🇳 |
| English | `en` | LTR | 🇺🇸 |
| العربية | `ar` | RTL | 🇸🇦 |

### 基础用法

```typescript
import { useI18n } from '@/hooks/useI18n'

const MyComponent = () => {
  const { t, currentLanguage, changeLanguage, isRTL, textDirection } = useI18n('ui')
  
  return (
    <div dir={textDirection}>
      <h1>{t('title')}</h1>
      <p>{t('description')}</p>
      <Button onClick={() => changeLanguage('en')}>
        {t('switch_language')}
      </Button>
    </div>
  )
}
```

### 命名空间

翻译资源按照功能模块组织成不同的命名空间：

- **common** - 通用文本（按钮、标签等）
- **chat** - 聊天相关文本
- **agents** - 智能体相关文本
- **ui** - UI组件相关文本

### 添加新的翻译

1. 在 `src/i18n/resources/{语言}/` 目录下的对应 JSON 文件中添加翻译
2. 确保在所有语言文件中添加相同的 key
3. 在组件中使用 `t('key')` 访问翻译

```json
// src/i18n/resources/zh/common.json
{
  "save": "保存",
  "cancel": "取消"
}

// src/i18n/resources/en/common.json
{
  "save": "Save",
  "cancel": "Cancel"
}

// src/i18n/resources/ar/common.json
{
  "save": "حفظ",
  "cancel": "إلغاء"
}
```

### RTL 布局支持

对于阿拉伯语等从右到左的语言，组件会自动适配布局：

```typescript
const { isRTL, textDirection } = useI18n()

<div 
  dir={textDirection} 
  className={cn(
    "flex items-center",
    isRTL && "flex-row-reverse"
  )}
>
  {/* 内容会自动镜像 */}
</div>
```

## 📖 更多文档

- [API文档](./src/api/README.md)
- [前端架构文档](./docs/前端架构演进完整技术文档.md)
- [路由组织规范](./docs/路由代码组织规范.md)
- [双层Features架构设计](./docs/双层Features架构设计.md)

## 🤝 贡献指南

请查看项目根目录下的 `.cursorrules` 文件，了解详细的开发规范和最佳实践。

## 📄 许可证

本项目采用私有许可证。