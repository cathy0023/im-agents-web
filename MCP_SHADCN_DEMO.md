# MCP shadcn 功能演示

> 展示如何使用 MCP shadcn 工具来高效发现、查看和集成 shadcn UI 组件

## 🎯 MCP shadcn 的优势

### ✨ 比传统方式更强大
- **智能搜索**: 不需要记住准确的组件名称
- **完整示例**: 获取真实的使用代码和最佳实践
- **即时预览**: 查看组件的详细信息和使用方法
- **自动生成**: 正确的安装命令和导入语句

## 🔍 搜索演示

### 搜索表格组件
```bash
Query: "table"
结果: 找到 19 个相关组件
- table (基础表格组件)
- table-demo (简单表格示例)  
- data-table-demo (复杂数据表格)
- typography-table (排版表格)
- dashboard-01 (包含表格的仪表板)
```

### 搜索结果展示
```typescript
// 🔍 搜索到的组件:
// - table (registry:ui) [@shadcn]
// - table-demo (registry:example) [@shadcn]  
// - data-table-demo (registry:example) [@shadcn]
// - typography-table (registry:example) [@shadcn]
// - dashboard-01 (registry:block) [@shadcn]
```

## 📋 完整示例代码

### 1. 基础表格示例
```tsx
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

const invoices = [
  {
    invoice: "INV001",
    paymentStatus: "Paid",
    totalAmount: "$250.00",
    paymentMethod: "Credit Card",
  },
  // ... 更多数据
]

export default function TableDemo() {
  return (
    <Table>
      <TableCaption>A list of your recent invoices.</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[100px]">Invoice</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Method</TableHead>
          <TableHead className="text-right">Amount</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {invoices.map((invoice) => (
          <TableRow key={invoice.invoice}>
            <TableCell className="font-medium">{invoice.invoice}</TableCell>
            <TableCell>{invoice.paymentStatus}</TableCell>
            <TableCell>{invoice.paymentMethod}</TableCell>
            <TableCell className="text-right">{invoice.totalAmount}</TableCell>
          </TableRow>
        ))}
      </TableBody>
      <TableFooter>
        <TableRow>
          <TableCell colSpan={3}>Total</TableCell>
          <TableCell className="text-right">$2,500.00</TableCell>
        </TableRow>
      </TableFooter>
    </Table>
  )
}
```

### 2. 高级数据表格
MCP 还提供了复杂的数据表格示例，包含：
- 排序功能
- 过滤功能  
- 分页功能
- 列可见性控制
- 行选择功能
- 操作菜单

## ⚡ 安装命令

MCP 自动生成的安装命令：
```bash
npx shadcn@latest add @shadcn/table
```

## 🎯 工作流对比

### 传统方式
```bash
# 1. 手动查找组件文档
# 2. 复制粘贴代码
# 3. 调试导入问题
# 4. 查找最佳实践
npx shadcn@latest add table
```

### MCP 方式  
```typescript
// 1. AI 智能搜索: "table data grid"
// 2. 自动获取完整示例代码
// 3. 自动生成正确的安装命令
// 4. 包含最佳实践和类型定义
```

## 🚀 实际使用场景

### 场景 1: 需要一个按钮组件
```typescript
// AI 搜索: "button"
// 结果: button, button-demo, loading-button 等
// 示例: 完整的按钮变体和使用方法
```

### 场景 2: 需要表单组件
```typescript  
// AI 搜索: "form input"
// 结果: form, input, textarea, select, checkbox 等
// 示例: 表单验证、错误处理、可访问性
```

### 场景 3: 需要布局组件
```typescript
// AI 搜索: "card dialog sheet"
// 结果: card, dialog, sheet, drawer 等
// 示例: 响应式布局、动画效果、交互模式
```

## 💡 最佳实践

### 1. 使用描述性搜索词
```typescript
✅ 好的搜索: "data table pagination"
❌ 差的搜索: "tbl"
```

### 2. 先查看示例，再自定义
```typescript
✅ 先获取完整示例 → 理解结构 → 根据需求修改
❌ 直接复制基础组件 → 自己摸索用法
```

### 3. 利用组件组合
```typescript
✅ 组合使用: Card + Table + Button + Dialog
❌ 重新造轮子: 自定义数据展示组件
```

## 🎉 总结

MCP shadcn 让组件开发变得：
- **更智能**: 语义化搜索，找到最合适的组件
- **更快速**: 获取完整示例，快速上手
- **更规范**: 遵循 shadcn 最佳实践
- **更可靠**: 经过验证的代码模式

现在开始使用 MCP shadcn，让 AI 帮助您发现和使用最适合的组件！
