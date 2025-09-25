// SSE客户端工具
// 导入聊天类型
import type { ChatRequest, ChatStreamChunk } from '../types/chat';
// ChatMessage 暂时未使用

export interface SSEMessage {
  event?: string;
  data: string;
  id?: string;
  retry?: number;
}

export interface SSEOptions {
  headers?: Record<string, string>;
  withCredentials?: boolean;
  timeout?: number;
  retryAttempts?: number;
  retryDelay?: number;
}

export type SSEEventHandler = (message: SSEMessage) => void;
export type SSEErrorHandler = (error: Error) => void;
export type SSEOpenHandler = () => void;
export type SSECloseHandler = () => void;

// SSE客户端类
export class SSEClient {
  private eventSource: EventSource | null = null;
  private url: string;
  private options: SSEOptions;
  private retryCount = 0;
  private isManualClose = false;

  // 事件处理器
  private onMessageHandler?: SSEEventHandler;
  private onErrorHandler?: SSEErrorHandler;
  private onOpenHandler?: SSEOpenHandler;
  private onCloseHandler?: SSECloseHandler;

  constructor(url: string, options: SSEOptions = {}) {
    this.url = url;
    this.options = {
      timeout: 30000,
      retryAttempts: 3,
      retryDelay: 1000,
      ...options,
    };
  }

  // 连接SSE
  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.isManualClose = false;
        
        // 创建EventSource
        this.eventSource = new EventSource(this.url, {
          withCredentials: this.options.withCredentials || false,
        });

        // 设置超时
        const timeout = setTimeout(() => {
          this.close();
          reject(new Error('SSE连接超时'));
        }, this.options.timeout);

        // 连接成功
        this.eventSource.onopen = () => {
          clearTimeout(timeout);
          this.retryCount = 0;
          this.onOpenHandler?.();
          resolve();
        };

        // 接收消息
        this.eventSource.onmessage = (event) => {
          const message: SSEMessage = {
            data: event.data,
            id: event.lastEventId,
          };
          this.onMessageHandler?.(message);
        };

        // 连接错误
        this.eventSource.onerror = (_event) => {
          clearTimeout(timeout);
          
          if (this.isManualClose) {
            return;
          }

          const error = new Error('SSE连接错误');
          this.onErrorHandler?.(error);

          // 自动重连逻辑
          if (this.retryCount < (this.options.retryAttempts || 3)) {
            this.retryCount++;
            setTimeout(() => {
              this.connect().catch(() => {
                // 重连失败，触发错误处理
                this.onErrorHandler?.(new Error(`重连失败，已尝试${this.retryCount}次`));
              });
            }, this.options.retryDelay);
          } else {
            reject(error);
          }
        };

      } catch (error) {
        reject(error instanceof Error ? error : new Error('创建SSE连接失败'));
      }
    });
  }

  // 手动关闭连接
  close() {
    this.isManualClose = true;
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
      this.onCloseHandler?.();
    }
  }

  // 获取连接状态
  getReadyState(): number {
    return this.eventSource?.readyState ?? EventSource.CLOSED;
  }

  // 是否已连接
  isConnected(): boolean {
    return this.eventSource?.readyState === EventSource.OPEN;
  }

  // 设置消息处理器
  onMessage(handler: SSEEventHandler) {
    this.onMessageHandler = handler;
    return this;
  }

  // 设置错误处理器
  onError(handler: SSEErrorHandler) {
    this.onErrorHandler = handler;
    return this;
  }

  // 设置连接处理器
  onOpen(handler: SSEOpenHandler) {
    this.onOpenHandler = handler;
    return this;
  }

  // 设置关闭处理器
  onClose(handler: SSECloseHandler) {
    this.onCloseHandler = handler;
    return this;
  }
}

// 创建智谱AI流式聊天请求 (保留原有功能，与axios架构兼容)
export async function createZhipuChatStream(
  request: ChatRequest,
  apiKey: string,
  onChunk: (chunk: string) => void,
  onError: (error: Error) => void,
  onComplete: () => void
): Promise<() => void> {
  try {
    const response = await fetch('https://open.bigmodel.cn/api/paas/v4/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        ...request,
        stream: true,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API请求失败: ${response.status} ${errorText}`);
    }

    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error('无法获取响应流');
    }

    const decoder = new TextDecoder();
    let buffer = '';
    let isAborted = false;

    const abort = () => {
      isAborted = true;
      reader.cancel();
    };

    // 开始读取流数据
    const readStream = async () => {
      try {
        while (!isAborted) {
          const { done, value } = await reader.read();
          
          if (done) {
            onComplete();
            break;
          }

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            if (line.trim() === '') continue;
            if (line.startsWith('data: ')) {
              const data = line.slice(6);
              
              if (data === '[DONE]') {
                onComplete();
                return;
              }

              try {
                const parsed: ChatStreamChunk = JSON.parse(data);
                const content = parsed.choices[0]?.delta?.content;
                
                if (content) {
                  onChunk(content);
                }
                
                if (parsed.choices[0]?.finish_reason) {
                  onComplete();
                  return;
                }
              } catch (error) {
                console.warn('解析SSE数据失败:', error, 'data:', data);
              }
            }
          }
        }
      } catch (error) {
        if (!isAborted) {
          onError(error instanceof Error ? error : new Error('流读取错误'));
        }
      }
    };

    // 开始读取
    readStream();

    // 返回取消函数
    return abort;
  } catch (error) {
    // 使用统一的错误处理
    console.error('创建智谱AI流失败:', error);
    onError(error instanceof Error ? error : new Error('创建流失败'));
    return () => {}; // 返回空的取消函数
  }
}

// 通用流式请求创建器 (支持axios兼容的配置)
export async function createStreamRequest(
  url: string,
  options: {
    method?: string;
    headers?: Record<string, string>;
    body?: unknown;
    timeout?: number;
  },
  onChunk: (chunk: string) => void,
  onError: (error: Error) => void,
  onComplete: () => void
): Promise<() => void> {
  try {
    const controller = new AbortController();
    const timeoutId = options.timeout ? setTimeout(() => {
      controller.abort();
      onError(new Error('请求超时'));
    }, options.timeout) : null;

    const response = await fetch(url, {
      method: options.method || 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      body: options.body ? JSON.stringify(options.body) : undefined,
      signal: controller.signal,
    });

    if (timeoutId) clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error('无法获取响应流');
    }

    const decoder = new TextDecoder();
    let buffer = '';
    let isAborted = false;

    const abort = () => {
      isAborted = true;
      controller.abort();
      reader.cancel();
    };

    // 读取流数据
    const readStream = async () => {
      try {
        while (!isAborted) {
          const { done, value } = await reader.read();
          
          if (done) {
            onComplete();
            break;
          }

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            if (line.trim() === '' || isAborted) continue;
            
            // 处理SSE格式数据
            if (line.startsWith('data: ')) {
              const data = line.slice(6);
              
              if (data === '[DONE]') {
                onComplete();
                return;
              }

              // 直接传递原始数据，让调用者处理解析
              onChunk(data);
            } else {
              // 对于非SSE格式的流数据，直接传递
              onChunk(line);
            }
          }
        }
      } catch (error) {
        if (!isAborted) {
          onError(error instanceof Error ? error : new Error('流读取错误'));
        }
      }
    };

    readStream();
    return abort;

  } catch (error) {
    console.error('创建流请求失败:', error);
    onError(error instanceof Error ? error : new Error('创建流请求失败'));
    return () => {};
  }
}
