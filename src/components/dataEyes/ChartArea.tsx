import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { agentsApi } from '@/api/modules/agents'

// 定义会话分析数据类型
interface ConversationAnalysis {
  summary: string
  scores: {
    engagement: number
    satisfaction: number
    quality: number
  }
  key_topics: string[]
  insights: string[]
}

// 定义会话数据类型
interface ConversationSession {
  conversation_id: string
  conversation_name: string
  created_at: string
  message_count: number
  status: string
  analysis: ConversationAnalysis
}

// 扩展API响应类型以包含conversations字段
interface CreateConversationWithListResponse {
  total?: number
  conversations?: ConversationSession[]
  // 保留原有字段以兼容conversation类型的响应
  conversation_id?: string
  action?: string
  message?: string
  conversation_info?: unknown
}

// 定义组件Props
interface ChartAreaProps {
  agentKey?: string
  agentUuid?: string
}

const ChartArea = ({ agentKey, agentUuid }: ChartAreaProps) => {
  const [sessions, setSessions] = useState<ConversationSession[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // 获取会话数据
  useEffect(() => {
    const fetchConversations = async () => {
      try {
        setLoading(true)
        setError(null)
        
        // 如果没有提供agent信息，使用默认值或显示错误
        if (!agentKey || !agentUuid) {
          setError('缺少Agent信息')
          return
        }
        
        // 调用createConversation接口
        // 对于list类型的agent，响应中会包含conversations字段
        const response = await agentsApi.createConversation(agentKey, agentUuid) as CreateConversationWithListResponse
        
        console.log('ChartArea: createConversation响应:', response)
        
        // 检查响应中是否包含conversations数据
        if (response.conversations && Array.isArray(response.conversations)) {
          setSessions(response.conversations)
        } else {
          // 如果没有conversations数据，可能是非list类型的agent
          console.log('ChartArea: 响应中没有conversations数据')
          setSessions([])
        }
      } catch (err) {
        console.error('获取会话列表失败:', err)
        setError('加载会话数据失败')
      } finally {
        setLoading(false)
      }
    }

    fetchConversations()
  }, [agentKey, agentUuid])

  // 格式化日期时间
  const formatDateTime = (dateStr: string) => {
    try {
      const date = new Date(dateStr)
      return date.toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      })
    } catch {
      return dateStr
    }
  }

  return (
    <div className="h-full bg-muted/15 p-6 overflow-hidden flex flex-col" style={{
      borderLeft: '1px solid hsl(var(--border) / 0.2)',
      marginLeft: '1px' // 避免边框重叠
    }}>
      {/* 标题 */}
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-2 h-6 bg-gradient-to-b from-primary to-primary/60 rounded-full"></div>
        <h3 className="text-xl font-semibold text-foreground">心理咨询会话记录</h3>
      </div>

      {/* 描述 */}
      <div className="bg-muted/30 border border-border rounded-lg p-4 mb-6">
        <p className="text-sm text-muted-foreground">
          <span className="font-semibold text-foreground">咨询对象：</span>心理问题求助者 - 谢颖
        </p>
        <p className="text-sm text-muted-foreground mt-1">
          <span className="font-semibold text-foreground">总会话数：</span>{sessions.length} 次
        </p>
      </div>
      
      {/* 会话信息表格 - 可滚动区域 */}
      <Card className="bg-card/50 backdrop-blur-sm border-border shadow-sm rounded-2xl flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-auto">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-muted-foreground">加载中...</p>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-destructive">{error}</p>
            </div>
          ) : sessions.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-muted-foreground">暂无会话数据</p>
            </div>
          ) : (
            <Table>
              <TableHeader className="sticky top-0 bg-card z-10">
                <TableRow className="hover:bg-muted/50 border-b border-border">
                  <TableHead className="text-foreground font-semibold">会话名称</TableHead>
                  <TableHead className="text-foreground font-semibold whitespace-nowrap">创建时间</TableHead>
                  <TableHead className="text-foreground font-semibold">会话摘要</TableHead>
                  <TableHead className="text-foreground font-semibold whitespace-nowrap">评分</TableHead>
                  <TableHead className="text-foreground font-semibold">关键主题</TableHead>
                  <TableHead className="text-foreground font-semibold">洞察分析</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sessions.map((session) => (
                  <TableRow 
                    key={session.conversation_id}
                    className="hover:bg-muted/20 transition-colors border-b border-border/50"
                  >
                    <TableCell className="font-medium text-foreground align-top">
                      {session.conversation_name}
                    </TableCell>
                    <TableCell className="text-muted-foreground whitespace-nowrap align-top">
                      {formatDateTime(session.created_at)}
                    </TableCell>
                    <TableCell className="text-muted-foreground max-w-xs align-top">
                      <p className="line-clamp-3">{session.analysis.summary}</p>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-xs align-top whitespace-nowrap">
                      <div className="space-y-1">
                        <div>参与: {session.analysis.scores.engagement}</div>
                        <div>满意: {session.analysis.scores.satisfaction}</div>
                        <div>质量: {session.analysis.scores.quality}</div>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground max-w-xs align-top">
                      <div className="flex flex-wrap gap-1">
                        {session.analysis.key_topics.map((topic, idx) => (
                          <span 
                            key={idx}
                            className="inline-block px-2 py-1 bg-primary/10 text-primary text-xs rounded-md"
                          >
                            {topic}
                          </span>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground max-w-xs align-top">
                      <ul className="list-disc list-inside space-y-1 text-xs">
                        {session.analysis.insights.map((insight, idx) => (
                          <li key={idx} className="line-clamp-2">{insight}</li>
                        ))}
                      </ul>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </Card>
    </div>
  )
}

export default ChartArea
