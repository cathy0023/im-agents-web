# 🌍 国际化使用示例

本文档提供实际的国际化使用示例，帮助开发者快速上手。

## 📋 目录
- [基础用法](#基础用法)
- [带参数的翻译](#带参数的翻译)
- [多命名空间使用](#多命名空间使用)
- [RTL 语言支持](#rtl-语言支持)
- [表单国际化](#表单国际化)
- [动态内容国际化](#动态内容国际化)

## 基础用法

### 简单文本翻译
```typescript
import { useI18n } from '@/hooks/useI18n'
import { Button } from '@/components/ui/button'

const SimpleExample = () => {
  const { t } = useI18n('common')
  
  return (
    <div>
      <h1>{t('welcome')}</h1>
      <p>{t('loading')}</p>
      <Button>{t('save')}</Button>
    </div>
  )
}
```

### 组件中的完整示例
```typescript
import { useI18n } from '@/hooks/useI18n'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'

const ChatComponent = () => {
  const { t } = useI18n('chat')
  
  const handleSend = () => {
    // 发送逻辑
  }
  
  return (
    <Card className="bg-card text-card-foreground">
      <CardHeader>
        <CardTitle>{t('title')}</CardTitle>
      </CardHeader>
      <CardContent>
        <p>{t('input_placeholder')}</p>
        <Button onClick={handleSend}>
          {t('send')}
        </Button>
      </CardContent>
    </Card>
  )
}
```

## 带参数的翻译

### 单个参数
```typescript
// 翻译文件: src/i18n/resources/zh/common.json
{
  "welcome_user": "欢迎，{{name}}！"
}

// 组件中使用
import { useI18n } from '@/hooks/useI18n'

const WelcomeMessage = ({ username }: { username: string }) => {
  const { t } = useI18n('common')
  
  return (
    <h1>{t('welcome_user', { name: username })}</h1>
  )
}
```

### 多个参数
```typescript
// 翻译文件
{
  "user_stats": "用户 {{name}} 共有 {{count}} 条消息"
}

// 组件中使用
const UserStats = ({ name, messageCount }: Props) => {
  const { t } = useI18n('common')
  
  return (
    <p>{t('user_stats', { name, count: messageCount })}</p>
  )
}
```

## 多命名空间使用

### 在一个组件中使用多个命名空间
```typescript
import { useI18nMultiple } from '@/hooks/useI18n'
import { Button } from '@/components/ui/button'

const ComplexComponent = () => {
  const { t } = useI18nMultiple(['common', 'chat', 'ui'])
  
  return (
    <div>
      <h1>{t('common:welcome')}</h1>
      <p>{t('chat:input_placeholder')}</p>
      <Button>{t('common:save')}</Button>
      <span>{t('ui:form.required')}</span>
    </div>
  )
}
```

### 分别使用不同命名空间
```typescript
import { useI18n } from '@/hooks/useI18n'

const ChatPanel = () => {
  const { t: tCommon } = useI18n('common')
  const { t: tChat } = useI18n('chat')
  
  return (
    <div>
      <button>{tCommon('save')}</button>
      <input placeholder={tChat('input_placeholder')} />
    </div>
  )
}
```

## RTL 语言支持

### 自动适配文字方向
```typescript
import { useI18n } from '@/hooks/useI18n'
import { cn } from '@/lib/utils'

const RTLAwareComponent = () => {
  const { t, isRTL, textDirection } = useI18n('common')
  
  return (
    <div dir={textDirection}>
      <div className={cn(
        "flex items-center gap-2",
        isRTL && "flex-row-reverse"
      )}>
        <span>{t('save')}</span>
        <Icon /> {/* 图标会根据方向自动翻转 */}
      </div>
    </div>
  )
}
```

### 条件样式处理
```typescript
import { useI18n } from '@/hooks/useI18n'

const MessageBubble = ({ message }: Props) => {
  const { isRTL } = useI18n()
  
  return (
    <div className={cn(
      "rounded-lg p-4",
      message.isUser 
        ? isRTL ? "rounded-tr-none mr-auto" : "rounded-tr-none ml-auto"
        : isRTL ? "rounded-tl-none ml-auto" : "rounded-tl-none mr-auto"
    )}>
      {message.content}
    </div>
  )
}
```

## 表单国际化

### 完整表单示例
```typescript
import { useI18n } from '@/hooks/useI18n'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useState } from 'react'

const LoginForm = () => {
  const { t } = useI18n('ui')
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  
  const validate = () => {
    if (!email) {
      setError(t('form.required'))
      return false
    }
    if (!email.includes('@')) {
      setError(t('form.invalid_email'))
      return false
    }
    return true
  }
  
  return (
    <form>
      <div>
        <label className="text-foreground font-medium">
          {t('form.email_label')}
        </label>
        <Input 
          placeholder={t('form.email_placeholder')}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="bg-background text-foreground"
        />
        {error && (
          <p className="text-destructive text-sm mt-1">{error}</p>
        )}
      </div>
      <Button onClick={validate}>
        {t('common:submit')}
      </Button>
    </form>
  )
}
```

### 表单验证消息
```typescript
// 翻译文件: src/i18n/resources/zh/ui.json
{
  "form": {
    "required": "此字段为必填项",
    "invalid_email": "邮箱格式不正确",
    "invalid_phone": "手机号格式不正确",
    "password_too_short": "密码长度至少6位",
    "passwords_not_match": "两次输入的密码不一致"
  }
}

// 使用
const { t } = useI18n('ui')
const errorMsg = t('form.required')
```

## 动态内容国际化

### 列表渲染
```typescript
import { useI18n } from '@/hooks/useI18n'

const AgentList = ({ agents }: Props) => {
  const { t } = useI18n('agents')
  
  if (agents.length === 0) {
    return <p className="text-muted-foreground">{t('no_agents')}</p>
  }
  
  return (
    <div>
      <h2>{t('agent_list')}</h2>
      {agents.map(agent => (
        <div key={agent.id}>
          <h3>{agent.name}</h3>
          <span>{t('agent_status')}: {agent.isActive ? t('active') : t('inactive')}</span>
        </div>
      ))}
    </div>
  )
}
```

### 条件显示
```typescript
import { useI18n } from '@/hooks/useI18n'

const ChatStatus = ({ isTyping, isOnline }: Props) => {
  const { t } = useI18n('chat')
  
  return (
    <div>
      {isOnline ? (
        <span className="text-green-500">{t('online')}</span>
      ) : (
        <span className="text-muted-foreground">{t('offline')}</span>
      )}
      {isTyping && (
        <p className="text-sm text-muted-foreground">{t('typing')}</p>
      )}
    </div>
  )
}
```

### 时间和日期格式化
```typescript
import { useI18n } from '@/hooks/useI18n'

const MessageTimestamp = ({ timestamp }: { timestamp: Date }) => {
  const { currentLanguage } = useI18n()
  
  // 根据当前语言格式化日期
  const formattedDate = new Intl.DateTimeFormat(currentLanguage, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(timestamp)
  
  return <span className="text-sm text-muted-foreground">{formattedDate}</span>
}
```

## 语言切换器使用

### 在任何组件中触发语言切换
```typescript
import { useI18n } from '@/hooks/useI18n'
import { Button } from '@/components/ui/button'

const CustomLanguageSwitcher = () => {
  const { currentLanguage, changeLanguage, languageConfig } = useI18n()
  
  return (
    <div className="flex gap-2">
      <Button 
        variant={currentLanguage === 'zh' ? 'default' : 'outline'}
        onClick={() => changeLanguage('zh')}
      >
        🇨🇳 中文
      </Button>
      <Button 
        variant={currentLanguage === 'en' ? 'default' : 'outline'}
        onClick={() => changeLanguage('en')}
      >
        🇺🇸 English
      </Button>
      <Button 
        variant={currentLanguage === 'ar' ? 'default' : 'outline'}
        onClick={() => changeLanguage('ar')}
      >
        🇸🇦 العربية
      </Button>
    </div>
  )
}
```

## 嵌套翻译键

### 使用嵌套对象组织翻译
```typescript
// 翻译文件
{
  "header": {
    "title": "IM Agents 平台",
    "subtitle": "智能对话助手"
  },
  "sidebar": {
    "messages": "消息",
    "analysis": "分析",
    "contacts": "通讯录"
  }
}

// 使用
const { t } = useI18n('ui')

<h1>{t('header.title')}</h1>
<p>{t('header.subtitle')}</p>
<nav>
  <a>{t('sidebar.messages')}</a>
  <a>{t('sidebar.analysis')}</a>
  <a>{t('sidebar.contacts')}</a>
</nav>
```

## 调试技巧

### 检查当前语言
```typescript
import { useI18n } from '@/hooks/useI18n'

const DebugLanguage = () => {
  const { currentLanguage, languageConfig } = useI18n()
  
  console.log('当前语言:', currentLanguage)
  console.log('语言配置:', languageConfig)
  console.log('文字方向:', languageConfig.dir)
  
  return null
}
```

### 查看缺失的翻译
开发环境下，i18n 会在控制台显示缺失的翻译 key：
```
i18next::translator: missingKey zh common missing_key_name
```

## 最佳实践总结

1. **始终使用 useI18n Hook**
   ```typescript
   const { t } = useI18n('namespace')
   ```

2. **选择合适的命名空间**
   - `common` - 通用按钮、标签
   - `chat` - 聊天相关
   - `agents` - 智能体相关
   - `ui` - UI组件、表单

3. **使用描述性的翻译 key**
   ```typescript
   // ✅ 好
   t('user_profile_edit_button')
   
   // ❌ 差
   t('btn1')
   ```

4. **保持翻译文件同步**
   - 添加中文翻译时，同时添加英文和阿拉伯文

5. **考虑 RTL 布局**
   - 使用 `isRTL` 和 `textDirection` 属性
   - 测试阿拉伯文模式下的布局

6. **语义化颜色 + 国际化**
   ```typescript
   <div className="bg-background text-foreground">
     {t('content')}
   </div>
   ```

## 常见问题

### Q: 如何添加新的翻译？
A: 在 `src/i18n/resources/{language}/{namespace}.json` 文件中添加 key-value 对。

### Q: 如何切换语言？
A: 使用 `changeLanguage` 函数：
```typescript
const { changeLanguage } = useI18n()
changeLanguage('en')
```

### Q: 如何处理动态变量？
A: 使用插值语法：
```typescript
// JSON: "greeting": "Hello, {{name}}!"
t('greeting', { name: userName })
```

### Q: RTL 语言如何处理？
A: 使用 `isRTL` 和 `textDirection`：
```typescript
const { isRTL, textDirection } = useI18n()
<div dir={textDirection} className={isRTL ? 'rtl-class' : 'ltr-class'}>
```

---

更多信息请参考：
- [国际化开发规范](mdc:PROJECT_I18N_RULES.md)
- [项目开发规则](mdc:PROJECT_RULES.md)

