/**
 * 导航配置
 */
export interface NavItem {
  title: string
  titleKey?: string  // i18n key
  href: string
  icon?: string
  disabled?: boolean
}

/**
 * 主导航菜单
 */
export const mainNavConfig: NavItem[] = [
  {
    title: '消息',
    titleKey: 'nav.messages',
    href: '/messages',
  },
  {
    title: 'Agents',
    titleKey: 'nav.agents',
    href: '/agents',
  },
  {
    title: '联系人',
    titleKey: 'nav.contacts',
    href: '/contacts',
  },
  {
    title: '数据视图',
    titleKey: 'nav.dataEyes',
    href: '/data-eyes',
  },
]

/**
 * 侧边栏导航配置
 */
export const sidebarNavConfig = {
  chat: [
    {
      title: '会话列表',
      titleKey: 'sidebar.conversations',
      href: '/messages',
    },
    {
      title: '历史记录',
      titleKey: 'sidebar.history',
      href: '/messages/history',
    },
  ],
  agents: [
    {
      title: 'Agents 列表',
      titleKey: 'sidebar.agentsList',
      href: '/agents',
    },
    {
      title: '调试工具',
      titleKey: 'sidebar.debug',
      href: '/agents/debug',
    },
  ],
} as const

