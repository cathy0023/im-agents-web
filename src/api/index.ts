// 导出基础客户端
export { 
  webApiClient, 
  zhipuApiClient, 
  WebApiClient, 
  ZhipuApiClient,
  SessionManager 
} from './client'

// 导出类型定义
export type { 
  ApiConfig, 
  ApiError 
} from './client'

export type { 
  ApiResponse, 
  PaginatedResponse, 
  ApiErrorResponse, 
  RequestConfig,
  UserInfo 
} from './types'

// 导出所有业务模块
export * from './modules'

// 为了向后兼容，保留原有的导出方式
export { agentsApi } from './modules/agents'

// 默认导出主要的API客户端
export { webApiClient as default } from './client'
