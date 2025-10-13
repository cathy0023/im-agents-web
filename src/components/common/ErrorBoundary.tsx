import { Component } from 'react'
import type { ErrorInfo, ReactNode } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
  errorInfo?: ErrorInfo
}

/**
 * 错误边界组件
 * 用于捕获和处理 React 组件树中的错误
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    // 更新 state 使下一次渲染能够显示降级后的 UI
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // 记录错误信息
    console.error('ErrorBoundary caught an error:', error, errorInfo)
    
    this.setState({
      error,
      errorInfo
    })
  }

  handleReload = () => {
    // 重新加载页面
    window.location.reload()
  }

  handleReset = () => {
    // 重置错误状态
    this.setState({ hasError: false, error: undefined, errorInfo: undefined })
  }

  render() {
    if (this.state.hasError) {
      // 如果有自定义的 fallback UI，使用它
      if (this.props.fallback) {
        return this.props.fallback
      }

      // 默认的错误 UI
      return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
          <Card className="w-full max-w-2xl">
            <CardHeader>
              <CardTitle className="text-destructive flex items-center">
                <svg 
                  className="w-6 h-6 mr-2" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" 
                  />
                </svg>
                应用程序出现错误
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-muted-foreground">
                <p>抱歉，应用程序遇到了一个意外错误。</p>
                <p>您可以尝试刷新页面或重置应用状态。</p>
              </div>

              {/* 错误详情（仅在开发环境显示） */}
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <div className="mt-4">
                  <details className="bg-muted/20 p-4 rounded-lg">
                    <summary className="cursor-pointer font-medium text-sm mb-2">
                      错误详情 (开发模式)
                    </summary>
                    <div className="text-xs font-mono space-y-2">
                      <div>
                        <strong>错误信息:</strong>
                        <pre className="mt-1 text-destructive whitespace-pre-wrap">
                          {this.state.error.message}
                        </pre>
                      </div>
                      <div>
                        <strong>错误堆栈:</strong>
                        <pre className="mt-1 text-muted-foreground whitespace-pre-wrap text-xs">
                          {this.state.error.stack}
                        </pre>
                      </div>
                      {this.state.errorInfo && (
                        <div>
                          <strong>组件堆栈:</strong>
                          <pre className="mt-1 text-muted-foreground whitespace-pre-wrap text-xs">
                            {this.state.errorInfo.componentStack}
                          </pre>
                        </div>
                      )}
                    </div>
                  </details>
                </div>
              )}

              {/* 操作按钮 */}
              <div className="flex space-x-3 pt-4">
                <Button onClick={this.handleReset} variant="outline">
                  重置应用
                </Button>
                <Button onClick={this.handleReload}>
                  刷新页面
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary

