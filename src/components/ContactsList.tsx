import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
// import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card' // 新设计中暂不使用
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Search, Users, UserPlus, Phone, Mail, MessageCircle, ChevronRight, ChevronDown, Building, Bot } from 'lucide-react'
import type { Contact, Organization } from '@/types/contacts'
import { useI18n } from '@/hooks/useI18n'

// 组织架构数据
const ORGANIZATION_DATA: Organization = {
  company: {
    name: '赛优教育',
    description: '专注于优质教育服务的科技公司'
  },
  departments: [
    {
      id: 'internal',
      name: '内部员工',
      memberCount: 4,
      contacts: []
    },
    {
      id: 'product',
      name: '产品部',
      parentId: 'internal',
      memberCount: 4,
      contacts: [
        {
          id: 'internal_1',
          name: '韩梅梅',
          avatar: 'HM',
          type: 'internal',
          role: '产品经理',
          department: '产品部',
          phone: '138-0000-1111',
          email: 'hanmeimei@saiyou.edu',
          status: 'online'
        },
        {
          id: 'internal_2',
          name: '李雷',
          avatar: 'LL',
          type: 'internal',
          role: '技术总监',
          department: '产品部',
          phone: '138-0000-2222',
          email: 'lilei@saiyou.edu',
          status: 'busy'
        },
        {
          id: 'internal_3',
          name: '张三',
          avatar: 'ZS',
          type: 'internal',
          role: '销售经理',
          department: '产品部',
          phone: '138-0000-3333',
          email: 'zhangsan@saiyou.edu',
          status: 'online'
        },
        {
          id: 'internal_4',
          name: '李四',
          avatar: 'LS',
          type: 'internal',
          role: '市场专员',
          department: '产品部',
          phone: '138-0000-4444',
          email: 'lisi@saiyou.edu',
          status: 'offline',
          lastSeen: '2小时前'
        }
      ]
    },
    {
      id: 'external',
      name: '外部员工',
      memberCount: 3,
      contacts: []
    }
  ]
}

// AI助手数据
const AI_ASSISTANTS: Contact[] = [
  {
    id: 'external_1',
    name: 'HR',
    avatar: 'HR',
    type: 'external',
    role: '外部员工',
    department: '人力资源',
    status: 'online'
  },
  {
    id: 'external_2',
    name: 'DataEyes',
    avatar: 'DE',
    type: 'external',
    role: '外部员工',
    department: '数据分析',
    status: 'online'
  },
  {
    id: 'external_3',
    name: '心理测评师小王',
    avatar: 'XW',
    type: 'external',
    role: '外部员工',
    department: '心理咨询',
    status: 'online'
  }
]

const ContactsList = () => {
  const navigate = useNavigate()
  const { t } = useI18n('ui')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null)
  const [expandedDepartments, setExpandedDepartments] = useState<Set<string>>(new Set(['internal']))
  const [selectedDepartment, setSelectedDepartment] = useState<string>('all') // 'all', 'internal', 'product', 'external'

  // 获取所有联系人
  const getAllContacts = () => {
    const internalContacts = ORGANIZATION_DATA.departments.flatMap(dept => dept.contacts)
    return [...internalContacts, ...AI_ASSISTANTS]
  }

  // 根据选中部门获取联系人
  const getContactsByDepartment = (deptId: string) => {
    switch (deptId) {
      case 'all':
        return getAllContacts()
      case 'internal':
        return ORGANIZATION_DATA.departments.find(d => d.id === 'product')?.contacts || []
      case 'product':
        return ORGANIZATION_DATA.departments.find(d => d.id === 'product')?.contacts || []
      case 'external':
        return AI_ASSISTANTS
      default:
        return []
    }
  }

  // 搜索过滤
  const filteredContacts = searchTerm ? 
    getAllContacts().filter(contact => 
      contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.role?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.department?.toLowerCase().includes(searchTerm.toLowerCase())
    ) : getContactsByDepartment(selectedDepartment)

  // 切换部门展开状态
  const toggleDepartment = (deptId: string) => {
    const newExpanded = new Set(expandedDepartments)
    if (newExpanded.has(deptId)) {
      newExpanded.delete(deptId)
    } else {
      newExpanded.add(deptId)
    }
    setExpandedDepartments(newExpanded)
  }

  // 选择部门
  const selectDepartment = (deptId: string) => {
    setSelectedDepartment(deptId)
    setSelectedContact(null) // 清除选中的联系人
  }

  // 获取部门标题
  const getDepartmentTitle = (deptId: string) => {
    switch (deptId) {
      case 'all': return t('contacts.all_contacts')
      case 'internal': return t('contacts.internal_employees')
      case 'product': return t('contacts.product_department')
      case 'external': return t('contacts.external_employees')
      default: return t('contacts.title')
    }
  }

  // 获取状态颜色
  const getStatusColor = (status: Contact['status']) => {
    switch (status) {
      case 'online': return 'bg-green-500'
      case 'busy': return 'bg-yellow-500'
      case 'offline': return 'bg-gray-400'
      default: return 'bg-gray-400'
    }
  }

  // 获取状态文本 (暂时不在紧凑模式中显示)
  // const getStatusText = (contact: Contact) => {
  //   switch (contact.status) {
  //     case 'online': return '在线'
  //     case 'busy': return '忙碌'
  //     case 'offline': return contact.lastSeen ? `${contact.lastSeen}在线` : '离线'
  //     default: return '未知'
  //   }
  // }

  // 处理联系人点击
  const handleContactClick = (contact: Contact) => {
    setSelectedContact(contact)
    
    // 如果是外部联系人（AI助手），跳转到对应的聊天页面
    if (contact.type === 'external') {
      switch (contact.name) {
        case 'HR':
          navigate('/messages/hr')
          break
        case 'DataEyes':
          navigate('/messages/dataEyes')
          break
        case '心理测评师小王':
          navigate('/messages/assistant')
          break
      }
    }
  }

  // 拨打电话
  const handleCall = (contact: Contact, e: React.MouseEvent) => {
    e.stopPropagation()
    if (contact.phone) {
      window.open(`tel:${contact.phone}`)
    }
  }

  // 发送邮件
  const handleEmail = (contact: Contact, e: React.MouseEvent) => {
    e.stopPropagation()
    if (contact.email) {
      window.open(`mailto:${contact.email}`)
    }
  }

  // 发送消息
  const handleMessage = (contact: Contact, e: React.MouseEvent) => {
    e.stopPropagation()
    
    if (contact.type === 'external') {
      // 外部联系人（AI助手）跳转到对应页面
      handleContactClick(contact)
    } else {
      // 内部联系人：创建对话并跳转
      import('@/store/conversationStore').then(({ useConversationStore }) => {
        const { createContactConversation } = useConversationStore.getState()
        const conversation = createContactConversation(contact)
        
        // 跳转到联系人对话页面
        navigate(`/messages/contact/${conversation.id}`)
      })
    }
  }

  // 渲染紧凑的联系人项（类似会话列表样式）
  const renderCompactContact = (contact: Contact) => (
    <div
      key={contact.id}
      onClick={() => handleContactClick(contact)}
      className={`group flex items-center px-3 py-2 cursor-pointer transition-colors ${
        selectedContact?.id === contact.id 
          ? 'bg-primary/10 rounded-md' 
          : 'hover:bg-muted/30'
      }`}
    >
      {/* 头像 */}
      <div className="flex-shrink-0 relative mr-3">
        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
          contact.type === 'external' 
            ? 'bg-gradient-to-br from-primary/80 to-primary' 
            : 'bg-gradient-to-br from-green-500/80 to-green-600'
        }`}>
          <span className="text-white text-xs font-medium">
            {contact.avatar}
          </span>
        </div>
        {/* 状态指示器 */}
        <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border border-background ${getStatusColor(contact.status)}`}></div>
      </div>
      
      {/* 联系人信息 */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h3 className={`text-sm font-medium truncate ${
            selectedContact?.id === contact.id ? 'text-primary' : 'text-foreground'
          }`}>
            {contact.name}
          </h3>
          {contact.type === 'external' ? (
            <Bot className="h-3 w-3 text-blue-500 flex-shrink-0" />
          ) : (
            <Users className="h-3 w-3 text-green-600 flex-shrink-0" />
          )}
        </div>
        <p className="text-xs text-muted-foreground truncate">
          {contact.role} • {contact.department}
        </p>
      </div>

      {/* 右侧操作区域 - 只在悬停时显示 */}
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 text-muted-foreground hover:text-foreground"
          onClick={(e) => handleMessage(contact, e)}
          title={t('contacts.send_message')}
        >
          <MessageCircle className="h-3 w-3" />
        </Button>
        {contact.phone && (
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 text-muted-foreground hover:text-foreground"
            onClick={(e) => handleCall(contact, e)}
            title={t('contacts.make_call')}
          >
            <Phone className="h-3 w-3" />
          </Button>
        )}
        {contact.email && (
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 text-muted-foreground hover:text-foreground"
            onClick={(e) => handleEmail(contact, e)}
            title={t('contacts.send_email')}
          >
            <Mail className="h-3 w-3" />
          </Button>
        )}
      </div>
    </div>
  )

  return (
    <div className="flex-1 flex h-full bg-background">
      {/* 左侧组织架构树 */}
      <div className="w-80 border-r border-border bg-card/50">
        {/* 头部 */}
        <div className="p-4 border-b border-border">
          <h1 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <Building className="h-5 w-5" />
            {t('contacts.company_name')}
          </h1>
          <p className="text-sm text-muted-foreground">{t('contacts.company_description')}</p>
        </div>

        {/* 组织架构树 */}
        <div className="p-4">
          {/* 全部联系人 */}
          <div className="mb-2">
            <div 
              className={`flex items-center justify-between py-2 px-3 rounded-lg cursor-pointer transition-colors ${
                selectedDepartment === 'all' ? 'bg-primary/10 text-primary' : 'hover:bg-accent/30'
              }`}
              onClick={() => selectDepartment('all')}
            >
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                <span className="font-medium">{t('contacts.all_contacts')}</span>
              </div>
              <Badge variant="secondary" className="text-xs">
                {getAllContacts().length}
              </Badge>
            </div>
          </div>

          {/* 内部员工 */}
          <div className="mb-2">
            <div 
              className={`flex items-center justify-between py-2 px-3 rounded-lg cursor-pointer transition-colors ${
                selectedDepartment === 'internal' ? 'bg-primary/10 text-primary' : 'hover:bg-accent/30'
              }`}
              onClick={() => {
                toggleDepartment('internal')
                selectDepartment('internal')
              }}
            >
              <div className="flex items-center gap-2">
                {expandedDepartments.has('internal') ? (
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                )}
                <Building className="h-4 w-4 text-green-600" />
                <span className="font-medium">{t('contacts.internal_employees')}</span>
              </div>
              <Badge variant="secondary" className="text-xs">
                4
              </Badge>
            </div>

            {/* 子部门 */}
            {expandedDepartments.has('internal') && (
              <div className="ml-6 mt-1">
                <div 
                  className={`flex items-center justify-between py-2 px-3 rounded-lg cursor-pointer transition-colors ${
                    selectedDepartment === 'product' ? 'bg-primary/10 text-primary' : 'hover:bg-accent/30'
                  }`}
                  onClick={() => selectDepartment('product')}
                >
                  <div className="flex items-center gap-2">
                    <Building className="h-4 w-4 text-green-600" />
                    <span className="font-medium">{t('contacts.product_department')}</span>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    4
                  </Badge>
                </div>
              </div>
            )}
          </div>

          {/* 外部员工 */}
          <div className="mb-2">
            <div 
              className={`flex items-center justify-between py-2 px-3 rounded-lg cursor-pointer transition-colors ${
                selectedDepartment === 'external' ? 'bg-primary/10 text-primary' : 'hover:bg-accent/30'
              }`}
              onClick={() => selectDepartment('external')}
            >
              <div className="flex items-center gap-2">
                <Bot className="h-4 w-4 text-blue-500" />
                <span className="font-medium">{t('contacts.external_employees')}</span>
              </div>
              <Badge variant="secondary" className="text-xs">
                {AI_ASSISTANTS.length}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* 右侧详情区域 */}
      <div className="flex-1 flex flex-col">
        {/* 搜索头部 */}
        <div className="p-4 border-b border-border bg-card/30">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold text-foreground">{t('contacts.title')}</h2>
            <Button variant="outline" size="sm" className="gap-2">
              <UserPlus className="h-4 w-4" />
              {t('contacts.add_contact')}
            </Button>
          </div>
          
          {/* 搜索框 */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t('contacts.search_placeholder')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-background"
            />
          </div>
        </div>

        {/* 内容区域 */}
        <div className="flex-1 overflow-y-auto p-4">
          {searchTerm ? (
            /* 搜索结果 */
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-3">
                {t('contacts.search_results')} ({filteredContacts.length})
              </h3>
              <div className="space-y-1">
                {filteredContacts.map(contact => renderCompactContact(contact))}
              </div>
              {filteredContacts.length === 0 && (
                <div className="text-center py-8">
                  <Search className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-muted-foreground">{t('contacts.no_contacts_found')}</p>
                </div>
              )}
            </div>
          ) : (
            /* 根据选中部门显示 */
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
                {selectedDepartment === 'all' && <Users className="h-4 w-4" />}
                {selectedDepartment === 'internal' && <Building className="h-4 w-4 text-green-600" />}
                {selectedDepartment === 'product' && <Building className="h-4 w-4 text-green-600" />}
                {selectedDepartment === 'external' && <Bot className="h-4 w-4 text-blue-500" />}
                {getDepartmentTitle(selectedDepartment)} ({filteredContacts.length})
              </h3>
              <div className="space-y-1">
                {filteredContacts.map(contact => renderCompactContact(contact))}
              </div>
              {filteredContacts.length === 0 && (
                <div className="text-center py-8">
                  <Users className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-muted-foreground">{t('contacts.no_department_members')}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ContactsList
