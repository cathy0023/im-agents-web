/**
 * 站点配置
 */
export const siteConfig = {
  name: 'IM Agents',
  description: '企业级即时通讯应用',
  version: '0.0.0',
  author: 'IM Agents Team',
  links: {
    github: 'https://github.com/your-org/im-agents-web',
  },
} as const

export type SiteConfig = typeof siteConfig

