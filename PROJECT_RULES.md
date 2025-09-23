# 项目开发规则

> 基于 React + TypeScript + Vite + Tailwind CSS + shadcn UI + zustand + axios 的现代化Web应用开发规范

## 🎯 核心原则

### 1. 组件优先级
- **最高优先级**: 使用 shadcn UI 组件
- **次优选择**: 基于 Radix UI 或 Headless UI 的自定义组件
- **最后选择**: 完全自定义组件（仅在 shadcn 无法满足需求时）

### 2. 技术栈一致性
- 严格使用项目已定义的技术栈
- 新增依赖需要充分评估必要性
- 保持版本兼容性

## 📦 组件开发规范

### shadcn UI 组件使用规则
```typescript
// ✅ 正确：优先使用 shadcn 组件
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"

// ❌ 错误：避免使用原生HTML元素代替shadcn组件
<button className="bg-blue-500 hover:bg-blue-700">Click me</button>

// ✅ 正确：使用shadcn Button组件
<Button variant="default" size="default">Click me</Button>
```

### 组件创建规则
1. **检查 shadcn 是否已有对应组件**
   ```bash
   npx shadcn@latest add [component-name]
   ```

2. **如果 shadcn 没有所需组件，检查是否可以组合现有组件**
   ```typescript
   // ✅ 组合使用现有组件
   const CustomDialog = () => (
     <Dialog>
       <DialogTrigger asChild>
         <Button variant="outline">打开弹窗</Button>
       </DialogTrigger>
       <DialogContent>
         <DialogHeader>
           <DialogTitle>标题</DialogTitle>
         </DialogHeader>
         <Card>
           <CardContent>内容</CardContent>
         </Card>
       </DialogContent>
     </Dialog>
   )
   ```

3. **仅在无法满足需求时创建自定义组件**
   - 必须使用 TypeScript
   - 必须使用 `forwardRef` 支持 ref 传递
   - 必须使用 Tailwind CSS 样式
   - 必须遵循项目命名规范

### 组件文件结构
```
src/components/
├── ui/                   # shadcn UI 组件
│   ├── button.tsx
│   ├── card.tsx
│   └── ...
├── business/             # 业务组件
│   ├── ChatArea.tsx
│   ├── MessageInput.tsx
│   └── ...
└── layout/               # 布局组件
    ├── Header.tsx
    ├── Sidebar.tsx
    └── ...
```

## 🎨 样式开发规范

### Tailwind CSS 使用规则
```typescript
// ✅ 正确：使用 Tailwind CSS
<div className="flex items-center justify-between p-4 bg-white border-b">

// ✅ 正确：使用 cn 工具函数合并类名
import { cn } from "@/lib/utils"
<div className={cn("base-classes", conditional && "conditional-classes")}>

// ❌ 错误：避免内联样式
<div style={{display: 'flex', alignItems: 'center'}}>

// ❌ 错误：避免传统CSS文件（除全局样式外）
```

### 响应式设计
```typescript
// ✅ 使用 Tailwind 响应式前缀
<div className="w-full md:w-1/2 lg:w-1/3">

// ✅ 移动端优先设计
<div className="text-sm md:text-base lg:text-lg">
```

## 🔄 状态管理规范

### zustand Store 使用规则
```typescript
// ✅ 正确的 Store 结构
interface ChatState {
  messages: Message[]
  isLoading: boolean
  apiKey: string | null
  // 状态
  addMessage: (message: Message) => void
  setLoading: (loading: boolean) => void
  setApiKey: (key: string) => void
  // 动作
}

// ✅ 使用 immer 进行状态更新（如需要）
import { produce } from 'immer'

// ✅ 状态分片，避免单一大型store
const useChatStore = create<ChatState>(...)
const useUserStore = create<UserState>(...)
```

### 组件中使用状态
```typescript
// ✅ 正确：选择性订阅
const { messages, addMessage } = useChatStore()

// ❌ 错误：订阅整个store导致不必要的重渲染
const store = useChatStore()
```

## 🌐 API 与数据获取

### API 调用规范
```typescript
// ✅ 集中管理API接口
// src/lib/api.ts
export const chatApi = {
  sendMessage: async (message: string) => {
    // API 实现
  },
  getHistory: async () => {
    // API 实现
  }
}

// ✅ 在组件中使用
import { chatApi } from '@/lib/api'
```

### 错误处理
```typescript
// ✅ 统一错误处理
try {
  const result = await chatApi.sendMessage(message)
  // 处理成功结果
} catch (error) {
  console.error('Failed to send message:', error)
  // 用户友好的错误提示
  toast.error('发送消息失败，请重试')
}
```

## 📝 TypeScript 规范

### 类型定义
```typescript
// ✅ 集中定义类型
// src/types/chat.ts
export interface Message {
  id: string
  content: string
  role: 'user' | 'assistant'
  timestamp: Date
}

export interface ChatState {
  messages: Message[]
  isLoading: boolean
}
```

### 组件 Props 类型
```typescript
// ✅ 明确的Props接口
interface ChatAreaProps {
  selectedAgent: number
  className?: string
  onMessageSend?: (message: string) => void
}

const ChatArea: React.FC<ChatAreaProps> = ({ 
  selectedAgent, 
  className,
  onMessageSend 
}) => {
  // 组件实现
}
```

### 严格类型检查
```typescript
// ✅ 避免使用 any
// ❌ const data: any = await response.json()
// ✅ const data: ApiResponse = await response.json()

// ✅ 使用类型断言时要谨慎
const element = document.getElementById('root') as HTMLElement
```

## 🗂️ 文件组织规范

### 导入顺序
```typescript
// 1. React 相关
import React, { useState, useEffect } from 'react'

// 2. 第三方库
import { clsx } from 'clsx'
import { Loader2 } from 'lucide-react'

// 3. shadcn UI 组件
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

// 4. 本地组件
import ChatArea from './ChatArea'
import MessageInput from './MessageInput'

// 5. 工具函数和类型
import { cn } from '@/lib/utils'
import { Message } from '@/types/chat'

// 6. Store
import { useChatStore } from '@/store/chatStore'
```

### 文件命名
```
✅ 正确命名:
- ChatArea.tsx (组件使用 PascalCase)
- useChatStore.ts (hooks 使用 camelCase)
- api.ts (工具文件使用 camelCase)
- chat.ts (类型文件使用 camelCase)

❌ 错误命名:
- chatArea.tsx
- ChatStore.ts
- API.ts
```

## 🧪 代码质量

### ESLint 规则遵循
- 严格遵循项目 ESLint 配置
- 提交前确保无 linting 错误
- 合理使用 `eslint-disable` 注释

### 性能优化
```typescript
// ✅ 使用 React.memo 优化重渲染
const ChatMessage = React.memo<ChatMessageProps>(({ message }) => {
  return <div>{message.content}</div>
})

// ✅ 使用 useCallback 优化回调函数
const handleSendMessage = useCallback((message: string) => {
  addMessage({ id: uuid(), content: message, role: 'user' })
}, [addMessage])

// ✅ 使用 useMemo 优化昂贵计算
const filteredMessages = useMemo(() => 
  messages.filter(msg => msg.role === 'user'),
  [messages]
)
```

## 🚫 禁止事项

1. **不要绕过 shadcn UI**
   - 禁止直接使用原生 HTML 元素代替 shadcn 组件
   - 禁止重复造轮子

2. **不要违反TypeScript规范**
   - 禁止使用 `any` 类型
   - 禁止忽略 TypeScript 错误

3. **不要混用样式方案**
   - 禁止使用内联样式
   - 禁止在同一项目中混用CSS-in-JS

4. **不要破坏项目结构**
   - 禁止随意创建新的目录结构
   - 禁止将文件放在错误的位置

## ✅ 检查清单

### 开发前检查
- [ ] 确认需求是否可以用现有 shadcn 组件实现
- [ ] 检查项目是否已有类似组件
- [ ] 确认 API 接口设计

### 开发中检查
- [ ] 组件是否使用了正确的 TypeScript 类型
- [ ] 是否遵循了组件命名规范
- [ ] 是否正确使用了 Tailwind CSS
- [ ] 是否正确管理了组件状态

### 提交前检查
- [ ] ESLint 检查通过
- [ ] TypeScript 编译无错误
- [ ] 组件在不同屏幕尺寸下表现正常
- [ ] 交互功能正常
- [ ] 性能表现良好

## 🔧 常用命令

```bash
# 添加 shadcn 组件
npx shadcn@latest add [component-name]

# 开发服务器
npm run dev

# 类型检查
npm run type-check

# 代码检查
npm run lint

# 构建项目
npm run build
```

---

遵循这些规则将确保项目代码的一致性、可维护性和高质量。当遇到规则中未涵盖的情况时，请参考现有代码模式或与团队讨论。
