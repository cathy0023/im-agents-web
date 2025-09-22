# IM Agents Web

基于 React + TypeScript + Tailwind CSS + shadcn UI 构建的企业级即时通讯界面。

## 特性

- 🎨 现代化的UI设计，类似企业微信界面
- 📱 响应式布局
- 🎯 TypeScript支持
- 🔧 基于Vite构建，开发体验优秀
- 🎪 使用shadcn UI组件库

## 项目结构

```
src/
├── components/          # React组件
│   ├── Header.tsx      # 顶部导航栏
│   ├── Sidebar.tsx     # 左侧边栏
│   ├── MainContent.tsx # 主内容区域
│   └── ui/             # 基础UI组件
├── lib/                # 工具函数
│   └── utils.ts        # shadcn UI工具函数
├── App.tsx             # 主应用组件
├── main.tsx            # 应用入口
└── index.css           # 全局样式

```

## 开发命令

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build

# 预览生产构建
npm run preview
```

## 界面布局

- **顶部Header**: 包含搜索框、通知、设置等功能按钮
- **左侧边栏**: 显示聊天列表、联系人等导航功能
- **主内容区**: 显示聊天内容、消息输入框等主要功能

## 技术栈

- React 18
- TypeScript
- Vite
- Tailwind CSS
- shadcn UI
- Lucide React (图标)