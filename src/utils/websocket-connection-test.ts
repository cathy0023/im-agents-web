/**
 * WebSocket连接测试工具
 * 用于验证WebSocket连接是否正常工作
 */

export interface ConnectionTestResult {
  success: boolean
  message: string
  url: string
  duration?: number
  error?: string
}

/**
 * 测试WebSocket连接
 */
export const testWebSocketConnection = (url: string): Promise<ConnectionTestResult> => {
  return new Promise((resolve) => {
    const startTime = Date.now()
    
    try {
      const ws = new WebSocket(url)
      
      // 设置超时
      const timeout = setTimeout(() => {
        ws.close()
        resolve({
          success: false,
          message: '连接超时',
          url,
          error: 'Connection timeout after 10 seconds'
        })
      }, 10000)
      
      ws.onopen = () => {
        const duration = Date.now() - startTime
        clearTimeout(timeout)
        
        // 发送测试消息
        ws.send('ping')
        
        resolve({
          success: true,
          message: '连接成功',
          url,
          duration
        })
        
        ws.close()
      }
      
      ws.onerror = (error) => {
        clearTimeout(timeout)
        resolve({
          success: false,
          message: '连接失败',
          url,
          error: error.toString()
        })
      }
      
      ws.onclose = (event) => {
        clearTimeout(timeout)
        if (event.code !== 1000) {
          resolve({
            success: false,
            message: `连接关闭: ${event.code} - ${event.reason}`,
            url,
            error: `WebSocket closed with code ${event.code}`
          })
        }
      }
      
    } catch (error) {
      resolve({
        success: false,
        message: '创建连接失败',
        url,
        error: error instanceof Error ? error.message : String(error)
      })
    }
  })
}

/**
 * 测试多个WebSocket URL
 */
export const testMultipleConnections = async (urls: string[]): Promise<ConnectionTestResult[]> => {
  const results: ConnectionTestResult[] = []
  
  for (const url of urls) {
    console.log(`🔍 测试WebSocket连接: ${url}`)
    const result = await testWebSocketConnection(url)
    results.push(result)
    
    if (result.success) {
      console.log(`✅ ${url} - ${result.message} (${result.duration}ms)`)
    } else {
      console.log(`❌ ${url} - ${result.message}`)
    }
  }
  
  return results
}

/**
 * 获取推荐的WebSocket URL列表
 */
export const getRecommendedUrls = (): string[] => {
  const urls: string[] = []
  
  // 1. 公共测试服务器
  urls.push('wss://echo.websocket.org')
  
  // 2. 本地开发服务器
  if (window.location.hostname === 'localhost') {
    urls.push('ws://localhost:8001/api/v1/websocket/user/97772489-34af-4179-83ca-00993b382605')
  }
  
  // 3. 当前域名的WebSocket
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
  const host = window.location.hostname
  urls.push(`${protocol}//${host}:8001/api/v1/websocket/user/97772489-34af-4179-83ca-00993b382605`)
  
  return urls
}

/**
 * 自动选择最佳WebSocket URL
 */
export const findBestWebSocketUrl = async (): Promise<string | null> => {
  const urls = getRecommendedUrls()
  console.log('🔍 开始自动检测最佳WebSocket连接...')
  
  const results = await testMultipleConnections(urls)
  
  // 找到第一个成功的连接
  const successResult = results.find(r => r.success)
  
  if (successResult) {
    console.log(`🎉 找到可用的WebSocket连接: ${successResult.url}`)
    return successResult.url
  }
  
  console.log('❌ 没有找到可用的WebSocket连接')
  return null
}
