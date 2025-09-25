// API配置和请求封装
export interface ApiConfig {
  baseUrl: string;
  apiKey?: string;
  timeout: number;
}

// 智谱AI配置
const ZHIPU_CONFIG: ApiConfig = {
  baseUrl: 'https://open.bigmodel.cn/api/paas/v4',
  timeout: 30000,
  apiKey: '596a400896fb4523a42fc3a6225c5808.iNBj9VvsNNrnMpK9'
}

// API错误类型
export class ApiError extends Error {
  public status?: number;
  public code?: string;

  constructor(
    message: string,
    status?: number,
    code?: string
  ) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
  }
}

// 通用请求配置
export interface RequestConfig {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  headers?: Record<string, string>;
  body?: any;
  timeout?: number;
}

// 全局请求拦截器
class ApiClient {
  private config: ApiConfig;
  private defaultHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  constructor(config: ApiConfig) {
    this.config = config;
  }

  // 设置API Key
  setApiKey(apiKey: string) {
    this.config.apiKey = apiKey;
    this.defaultHeaders['Authorization'] = `Bearer ${apiKey}`;
  }

  // 请求拦截器
  private async requestInterceptor(url: string, config: RequestConfig): Promise<[string, RequestInit]> {
    const fullUrl = url.startsWith('http') ? url : `${this.config.baseUrl}${url}`;
    
    const requestConfig: RequestInit = {
      method: config.method || 'GET',
      headers: {
        ...this.defaultHeaders,
        ...config.headers,
      },
      signal: AbortSignal.timeout(config.timeout || this.config.timeout),
    };

    if (config.body && (config.method === 'POST' || config.method === 'PUT')) {
      requestConfig.body = typeof config.body === 'string' 
        ? config.body 
        : JSON.stringify(config.body);
    }

    return [fullUrl, requestConfig];
  }

  // 响应拦截器
  private async responseInterceptor(response: Response): Promise<any> {
    if (!response.ok) {
      let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      
      try {
        const errorData = await response.json();
        errorMessage = errorData.error?.message || errorData.message || errorMessage;
      } catch {
        // 忽略JSON解析错误，使用默认错误消息
      }

      throw new ApiError(errorMessage, response.status);
    }

    const contentType = response.headers.get('content-type');
    if (contentType?.includes('application/json')) {
      return response.json();
    }
    
    return response.text();
  }

  // 通用请求方法
  async request(url: string, config: RequestConfig = {}): Promise<any> {
    try {
      const [fullUrl, requestConfig] = await this.requestInterceptor(url, config);
      const response = await fetch(fullUrl, requestConfig);
      return await this.responseInterceptor(response);
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      
      if (error instanceof DOMException && error.name === 'TimeoutError') {
        throw new ApiError('请求超时，请稍后重试');
      }
      
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new ApiError('网络连接失败，请检查网络设置');
      }
      
      throw new ApiError('未知错误，请稍后重试');
    }
  }

  // GET请求
  get(url: string, config?: Omit<RequestConfig, 'method' | 'body'>) {
    return this.request(url, { ...config, method: 'GET' });
  }

  // POST请求
  post(url: string, body?: any, config?: Omit<RequestConfig, 'method'>) {
    return this.request(url, { ...config, method: 'POST', body });
  }

  // PUT请求
  put(url: string, body?: any, config?: Omit<RequestConfig, 'method'>) {
    return this.request(url, { ...config, method: 'PUT', body });
  }

  // DELETE请求
  delete(url: string, config?: Omit<RequestConfig, 'method' | 'body'>) {
    return this.request(url, { ...config, method: 'DELETE' });
  }
}

// 导出智谱AI客户端实例
export const zhipuApiClient = new ApiClient(ZHIPU_CONFIG);

// 获取环境变量中的API Key（如果有的话）
const apiKey = import.meta.env.VITE_ZHIPU_API_KEY;
if (apiKey) {
  zhipuApiClient.setApiKey(apiKey);
}
