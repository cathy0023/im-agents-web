import axios, { AxiosError } from 'axios'
import type { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios'
import type { UserInfo } from '../types/user'
import Cookies from 'js-cookie'

// API配置接口
export interface ApiConfig {
  baseUrl: string;
  timeout: number;
  apiKey?: string;
}

// API错误类型
export class ApiError extends Error {
  public status?: number;
  public code?: string;
  public details?: unknown;

  constructor(
    message: string,
    status?: number,
    code?: string,
    details?: unknown
  ) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

// 标准API响应格式
export interface ApiResponse<T = unknown> {
  data: T;
  success: boolean;
  message?: string;
  error?: string;
  timestamp?: string;
}

// 重新导出用户相关类型以保持向后兼容性
export type { UserInfo } from '../types/user'

// 通用错误处理函数
const handleApiError = (error: unknown): ApiError => {
  if (axios.isAxiosError(error)) {
    const response = error.response;
    
    if (response) {
      return new ApiError(
        response.data?.message || response.data?.error || error.message,
        response.status,
        response.data?.code,
        response.data
      );
    }
    
    return new ApiError(
      '网络连接失败，请检查网络设置',
      0,
      'NETWORK_ERROR'
    );
  }
  
  return new ApiError(
    error instanceof Error ? error.message : '未知错误，请稍后重试',
    0,
    'UNKNOWN_ERROR'
  );
};

// 创建axios实例的通用配置函数
const createAxiosInstance = (config: ApiConfig): AxiosInstance => {
  const instance = axios.create({
    baseURL: config.baseUrl,
    timeout: config.timeout,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  // 请求拦截器
  instance.interceptors.request.use(
    (requestConfig) => {
      // 添加API Key到请求头
      if (config.apiKey) {
        requestConfig.headers.Authorization = `Bearer ${config.apiKey}`;
      }

      // 添加时间戳用于性能监控
      requestConfig.metadata = { startTime: Date.now() };
      
      console.log(`[API Request] ${requestConfig.method?.toUpperCase()} ${requestConfig.url}`);
      return requestConfig;
    },
    (error) => {
      console.error('[API Request Error]', error);
      return Promise.reject(error);
    }
  );

  // 响应拦截器
  instance.interceptors.response.use(
    (response: AxiosResponse) => {
      // 计算请求耗时
      const duration = response.config.metadata?.startTime 
        ? Date.now() - response.config.metadata.startTime 
        : 0;
      console.log(`[API Response] ${response.config.method?.toUpperCase()} ${response.config.url} - ${duration}ms`);
      
      return response;
    },
    (error: AxiosError) => {
      // 计算请求耗时（如果有的话）
      const duration = error.config?.metadata?.startTime 
        ? Date.now() - error.config.metadata.startTime 
        : 0;
      
      console.error(`[API Error] ${error.config?.method?.toUpperCase()} ${error.config?.url} - ${duration}ms`, error);
      
      // 根据错误状态码进行特殊处理
      if (error.response?.status === 401) {
        console.warn('Authentication failed, please check your API key');
        // 这里可以触发登录流程或清除本地认证信息
      }
      
      return Promise.reject(handleApiError(error));
    }
  );

  return instance;
};

// Web API 客户端类
class WebApiClient {
  private axiosInstance: AxiosInstance;

  constructor() {
    this.axiosInstance = createAxiosInstance({
      baseUrl: '/webapi',
      timeout: 30000,
    });
    
    // 配置axios实例以自动携带cookie
    this.axiosInstance.defaults.withCredentials = true;
  }

  // 设置认证token
  setAuthToken(token: string) {
    this.axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }

  // 清除认证token
  clearAuthToken() {
    delete this.axiosInstance.defaults.headers.common['Authorization'];
  }

  // 获取用户信息
  async getUserInfo(): Promise<UserInfo> {
    try {
      const response = await this.axiosInstance.get<ApiResponse<UserInfo>>('/profile/get');
      if (response.data.success) {
        return response.data.data;
      }
      throw new ApiError(response.data.message || '获取用户信息失败');
    } catch (error) {
      throw handleApiError(error);
    }
  }

  // 通用GET请求
  async get<T = unknown>(url: string, config?: AxiosRequestConfig): Promise<T> {
    try {
      const response = await this.axiosInstance.get<ApiResponse<T>>(url, config);
      return (response.data.data || response.data) as T;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  // 通用POST请求
  async post<T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    try {
      const response = await this.axiosInstance.post<ApiResponse<T>>(url, data, config);
      return (response.data.data || response.data) as T;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  // 通用PUT请求
  async put<T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    try {
      const response = await this.axiosInstance.put<ApiResponse<T>>(url, data, config);
      return (response.data.data || response.data) as T;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  // 通用DELETE请求
  async delete<T = unknown>(url: string, config?: AxiosRequestConfig): Promise<T> {
    try {
      const response = await this.axiosInstance.delete<ApiResponse<T>>(url, config);
      return (response.data.data || response.data) as T;
    } catch (error) {
      throw handleApiError(error);
    }
  }
}

// 智谱AI客户端类（保留原有功能）
class ZhipuApiClient {
  private axiosInstance: AxiosInstance;
  private config: ApiConfig;

  constructor() {
    this.config = {
      baseUrl: 'https://open.bigmodel.cn/api/paas/v4',
      timeout: 30000,
      apiKey: '596a400896fb4523a42fc3a6225c5808.iNBj9VvsNNrnMpK9'
    };

    this.axiosInstance = createAxiosInstance(this.config);
  }

  // 设置API Key
  setApiKey(apiKey: string) {
    this.config.apiKey = apiKey;
    this.axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${apiKey}`;
  }

  // 通用请求方法
  async request<T = unknown>(url: string, config?: AxiosRequestConfig): Promise<T> {
    try {
      const response = await this.axiosInstance.request<T>({ url, ...config });
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  // GET请求
  async get<T = unknown>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return this.request<T>(url, { ...config, method: 'GET' });
  }

  // POST请求
  async post<T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    return this.request<T>(url, { ...config, method: 'POST', data });
  }

  // PUT请求
  async put<T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    return this.request<T>(url, { ...config, method: 'PUT', data });
  }

  // DELETE请求
  async delete<T = unknown>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return this.request<T>(url, { ...config, method: 'DELETE' });
  }
}

// 创建客户端实例
export const webApiClient = new WebApiClient();
export const zhipuApiClient = new ZhipuApiClient();

// 获取环境变量中的API Key（如果有的话）
const apiKey = import.meta.env.VITE_ZHIPU_API_KEY;
if (apiKey) {
  zhipuApiClient.setApiKey(apiKey);
}

// Session Cookie 配置
interface SessionCookieConfig {
  cookieName: string;
  defaultOptions: {
    path: string;
    domain?: string;
    secure?: boolean;
    sameSite?: 'strict' | 'lax' | 'none';
  };
}

// 默认 Session 配置
const defaultSessionCookieConfig: SessionCookieConfig = {
  cookieName: 'session', // 可以根据项目需要修改
  defaultOptions: {
    path: '/',
    sameSite: 'lax',
    // secure: true, // 在生产环境中启用
  }
};

// Session 管理函数 (基于 Cookie)
export const SessionManager = {
  // 当前配置
  config: { ...defaultSessionCookieConfig },
  
  // 设置 cookie 名称
  setCookieName(cookieName: string) {
    this.config.cookieName = cookieName;
  },

  // 设置默认选项
  setDefaultOptions(options: Partial<SessionCookieConfig['defaultOptions']>) {
    this.config.defaultOptions = { ...this.config.defaultOptions, ...options };
  },
  
  // 检查是否有 session cookie
  hasSession(): boolean {
    console.log('Checking for session cookie:', this.config.cookieName);
    const sessionValue = Cookies.get(this.config.cookieName);
    return !!sessionValue;
  },

  // 获取 session 值
  getSessionValue(): string | null {
    return Cookies.get(this.config.cookieName) || null;
  },

  // 设置 session cookie
  setSessionCookie(value: string, options?: {
    expires?: number | Date;
    domain?: string;
    path?: string;
    secure?: boolean;
    sameSite?: 'strict' | 'lax' | 'none';
  }) {
    const finalOptions = {
      ...this.config.defaultOptions,
      ...options
    };
    
    Cookies.set(this.config.cookieName, value, finalOptions);
    console.log(`Session cookie set: ${this.config.cookieName}`);
  },

  // 清除 session cookie
  clearSession() {
    Cookies.remove(this.config.cookieName, { 
      path: this.config.defaultOptions.path,
      domain: this.config.defaultOptions.domain
    });
    webApiClient.clearAuthToken();
    console.log(`Session cookie cleared: ${this.config.cookieName}`);
  },

  // 获取所有 cookie (调试用)
  getAllCookies() {
    return Cookies.get();
  },

  // 初始化 session（在应用启动时调用）
  async initializeSession(): Promise<UserInfo | null> {
    console.log(`Checking for session cookie: ${this.config.cookieName}`);
    
    if (!this.hasSession()) {
      console.log('No session cookie found');
      return null;
    }

    const sessionValue = this.getSessionValue();
    if (!sessionValue) {
      console.log('Session cookie is empty');
      return null;
    }

    try {
      console.log(`Found session cookie: ${this.config.cookieName}=${sessionValue.substring(0, 20)}...`);
      
      // 验证 session 并获取用户信息
      // WebAPI 客户端已配置 withCredentials: true，会自动携带 cookie
      const userInfo = await webApiClient.getUserInfo();
      console.log('Session initialized successfully', userInfo);
      return userInfo;
    } catch (error) {
      console.warn('Session validation failed', error);
      // 验证失败时不自动清除 session，由用户决定
      return null;
    }
  }
};

// 导出类型声明，扩展axios类型
declare module 'axios' {
  interface AxiosRequestConfig {
    metadata?: {
      startTime: number;
    };
  }
}
