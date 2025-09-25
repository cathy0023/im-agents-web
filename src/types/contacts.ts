// 通讯录相关类型定义

// 联系人类型
export type ContactType = 'internal' | 'external'

// 联系人信息接口
export interface Contact {
  id: string
  name: string
  avatar: string
  type: ContactType
  role?: string
  department?: string
  phone?: string
  email?: string
  status: 'online' | 'offline' | 'busy'
  lastSeen?: string
}

// 联系人分组
export interface ContactGroup {
  type: ContactType
  title: string
  contacts: Contact[]
}

// 团队信息
export interface Team {
  name: string
  logo?: string
  description?: string
}

// 部门信息
export interface Department {
  id: string
  name: string
  parentId?: string
  memberCount: number
  contacts: Contact[]
}

// 组织架构
export interface Organization {
  company: Team
  departments: Department[]
}
