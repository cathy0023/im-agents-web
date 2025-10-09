# 🌍 国际化 (i18n) 开发规范

## 📚 技术栈
- **核心库**: react-i18next + i18next
- **状态管理**: zustand (i18nStore)
- **浏览器检测**: i18next-browser-languagedetector

## 🎯 **CRITICAL: 国际化开发强制要求**

### ⚠️ 所有新功能必须支持国际化
**开发任何新功能前，必须优先考虑国际化！**

```typescript
// ✅ 强制要求：使用翻译函数
import { useI18n } from '@/hooks/useI18n'

const MyComponent = () => {
  const { t } = useI18n('chat') // 指定命名空间
  
  return (
    <div>
      <h1>{t('title')}</h1>
      <p>{t('description')}</p>
    </div>
  )
}

// ❌ 严禁：硬编码中文文本
const MyComponent = () => {
  return <div>标题</div>
}
```

## 📁 目录结构

```
src/
├── i18n/
│   ├── index.ts              # i18n 配置入口
│   ├── types.ts              # 类型定义
│   └── resources/            # 翻译资源
│       ├── zh/               # 中文（简体）
│       │   ├── common.json   # 通用翻译
│       │   ├── chat.json     # 聊天相关
│       │   ├── agents.json   # 智能体相关
│       │   └── ui.json       # UI组件相关
│       ├── en/               # 英语
│       │   ├── common.json
│       │   ├── chat.json
│       │   ├── agents.json
│       │   └── ui.json
│       └── ar/               # 阿拉伯语
│           ├── common.json
│           ├── chat.json
│           ├── agents.json
│           └── ui.json
├── hooks/
│   └── useI18n.ts           # 自定义 i18n Hook
└── store/
    └── i18nStore.ts         # 语言状态管理
```

## 🌐 支持的语言

| 语言代码 | 语言名称 | 文字方向 | 旗帜 |
|---------|---------|---------|------|
| `zh` | 简体中文 | LTR | 🇨🇳 |
| `en` | English | LTR | 🇺🇸 |
| `ar` | العربية | RTL | 🇸🇦 |

## 🎯 命名空间 (Namespace) 规范

### 可用命名空间
1. **common** - 通用文本（按钮、标签等）
2. **chat** - 聊天相关文本
3. **agents** - 智能体相关文本
4. **ui** - UI组件相关文本

### 命名空间选择规则
```typescript
// ✅ 根据功能选择合适的命名空间
const { t } = useI18n('chat')      // 聊天页面
const { t } = useI18n('agents')    // 智能体列表
const { t } = useI18n('common')    // 通用按钮/标签
const { t } = useI18n('ui')        // UI组件

// ✅ 使用多个命名空间
import { useI18nMultiple } from '@/hooks/useI18n'

const { t } = useI18nMultiple(['common', 'chat'])
// 使用: t('common:save'), t('chat:send')
```

## 💡 使用方法

### 1. 基础用法
```typescript
import { useI18n } from '@/hooks/useI18n'

const MyComponent = () => {
  const { t, currentLanguage, changeLanguage } = useI18n('common')
  
  return (
    <div>
      <h1>{t('welcome')}</h1>
      <button onClick={() => changeLanguage('en')}>
        {t('language')}
      </button>
    </div>
  )
}
```

### 2. 带参数的翻译
```typescript
// 在翻译文件中
{
  "greeting": "欢迎，{{name}}！",
  "items_count": "共 {{count}} 项"
}

// 在组件中使用
const { t } = useI18n('common')

<p>{t('greeting', { name: '张三' })}</p>
<p>{t('items_count', { count: 10 })}</p>
```

### 3. 复数处理
```typescript
// 在翻译文件中
{
  "message_count": "{{count}} 条消息",
  "message_count_plural": "{{count}} 条消息"
}

// 在组件中使用
const { t } = useI18n('chat')

<p>{t('message_count', { count: messageCount })}</p>
```

### 4. RTL 语言支持
```typescript
import { useI18n } from '@/hooks/useI18n'

const MyComponent = () => {
  const { isRTL, textDirection } = useI18n()
  
  return (
    <div dir={textDirection} className={isRTL ? 'rtl-layout' : 'ltr-layout'}>
      {/* 内容会自动适配文字方向 */}
    </div>
  )
}
```

## 📝 翻译文件规范

### JSON 文件格式
```json
{
  "key": "翻译文本",
  "nested": {
    "key": "嵌套翻译"
  },
  "with_variable": "带变量的翻译: {{variable}}"
}
```

### 翻译 Key 命名规范
```typescript
// ✅ 使用小写字母和下划线
{
  "send_message": "发送消息",
  "user_profile": "用户资料",
  "delete_confirm": "确认删除"
}

// ❌ 避免使用驼峰或其他格式
{
  "sendMessage": "发送消息",      // 错误
  "UserProfile": "用户资料",      // 错误
  "delete-confirm": "确认删除"    // 错误
}
```

## 🔍 开发检查清单

### 开发新功能时必须检查
- [ ] **是否导入了 `useI18n` Hook？**
- [ ] **是否为所有用户可见文本添加了翻译？**
- [ ] **是否选择了正确的命名空间？**
- [ ] **是否在三种语言的翻译文件中都添加了对应的 key？**
- [ ] **翻译 key 是否使用了规范的命名格式？**

### 翻译文件更新检查
- [ ] **中文翻译是否准确？**
- [ ] **英文翻译是否地道？**
- [ ] **阿拉伯文翻译是否正确？**
- [ ] **是否考虑了 RTL 语言的布局问题？**
- [ ] **变量名是否在所有语言中保持一致？**

## 🚫 禁止的做法

```typescript
// ❌ 禁止：硬编码文本
<button>发送</button>
<div>加载中...</div>

// ❌ 禁止：混合使用翻译和硬编码
<div>
  {t('title')} - 这是硬编码文本
</div>

// ❌ 禁止：在代码中直接写多语言逻辑
const text = currentLanguage === 'zh' ? '发送' : 'Send'

// ❌ 禁止：不使用命名空间
const { t } = useTranslation() // 应该指定命名空间

// ❌ 禁止：翻译文件中出现空值
{
  "some_key": "",  // 错误：应该有实际内容或删除此键
}
```

## ✅ 推荐做法

```typescript
// ✅ 正确：使用翻译函数
import { useI18n } from '@/hooks/useI18n'

const { t } = useI18n('chat')

<button>{t('send')}</button>
<div>{t('loading')}</div>

// ✅ 正确：带参数的翻译
<p>{t('welcome_user', { username })}</p>

// ✅ 正确：组合多个命名空间
import { useI18nMultiple } from '@/hooks/useI18n'

const { t } = useI18nMultiple(['common', 'chat'])

<div>
  <button>{t('common:save')}</button>
  <p>{t('chat:typing')}</p>
</div>

// ✅ 正确：考虑 RTL 布局
const { isRTL } = useI18n()

<div className={cn(
  "flex items-center gap-2",
  isRTL && "flex-row-reverse"
)}>
```

## 🎨 与 shadcn UI 集成

### 组件国际化示例
```typescript
import { useI18n } from '@/hooks/useI18n'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

const MyForm = () => {
  const { t } = useI18n('ui')
  
  return (
    <div>
      <Input placeholder={t('form.required')} />
      <Button>{t('common:save')}</Button>
    </div>
  )
}
```

## 🔧 添加新语言

### 步骤
1. 在 `src/i18n/types.ts` 中添加语言配置
```typescript
export const LANGUAGES: Record<Language, LanguageConfig> = {
  // ... 现有语言
  fr: {
    code: 'fr',
    name: 'French',
    nativeName: 'Français',
    dir: 'ltr',
    flag: '🇫🇷',
  },
}
```

2. 创建翻译文件目录
```bash
mkdir -p src/i18n/resources/fr
```

3. 复制并翻译所有 JSON 文件
```bash
cp src/i18n/resources/en/*.json src/i18n/resources/fr/
# 然后翻译内容
```

4. 在 `src/i18n/index.ts` 中导入新语言资源
```typescript
import frCommon from './resources/fr/common.json'
// ... 其他文件

const resources = {
  // ... 现有语言
  fr: {
    common: frCommon,
    // ... 其他命名空间
  },
}
```

## 🧪 测试翻译

### 开发环境测试
```typescript
// 1. 打开浏览器控制台
// 2. 切换语言
window.localStorage.setItem('i18nextLng', 'en')
location.reload()

// 3. 查看翻译是否正确加载
console.log(i18n.language) // 当前语言
console.log(i18n.t('chat:send')) // 测试翻译
```

### 缺失翻译检测
开发环境下，i18n 的 debug 模式会在控制台显示缺失的翻译 key。

## 📚 最佳实践

1. **翻译粒度适中**
   - 不要过细（每个词都是一个key）
   - 不要过粗（整段文字一个key）
   - 根据复用性决定粒度

2. **保持翻译文件同步**
   - 添加新功能时同时更新所有语言
   - 定期检查是否有缺失的翻译

3. **使用描述性的 key**
   - `user_profile_edit_button` ✅
   - `btn1` ❌

4. **考虑文化差异**
   - 日期格式
   - 货币符号
   - 颜色含义
   - 图标意义

5. **RTL 语言特殊处理**
   - 使用 `flex-row-reverse` 调整布局
   - 测试所有交互元素的方向
   - 图标可能需要水平翻转

## 🔗 相关资源

- [react-i18next 官方文档](https://react.i18next.com/)
- [i18next 文档](https://www.i18next.com/)
- [项目 i18n 配置](mdc:src/i18n/index.ts)
- [自定义 Hook](mdc:src/hooks/useI18n.ts)
- [语言状态管理](mdc:src/store/i18nStore.ts)

---

**记住：国际化不是可选功能，是强制要求！每个新功能都必须支持多语言。**

