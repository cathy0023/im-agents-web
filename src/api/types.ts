// 标准API响应格式 - 基于实际后端返回结构
export interface ApiResponse<T = unknown> {
  code: number;
  msg: string;
  results: T;
}

// 兼容旧格式的响应类型（如果需要）
export interface LegacyApiResponse<T = unknown> {
  data: T;
  success: boolean;
  message?: string;
  error?: string;
  timestamp?: string;
}

// 分页响应格式
export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// API错误接口
export interface ApiErrorResponse {
  code: string;
  message: string;
  statusCode: number;
  details?: Record<string, any>;
}

// 请求配置接口
export interface RequestConfig {
  timeout?: number;
  retries?: number;
  retryDelay?: number;
}

// 重新导出用户相关类型以保持向后兼容性
export type { UserInfo } from '../types/user'

// 重新导出client中的类型
export type { ApiConfig, ApiError } from './client'
