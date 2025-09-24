import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import { 
  Brain, 
  Clock, 
  Target, 
  Star, 
  MessageCircle, 
  PlayCircle, 
  PauseCircle, 
  RotateCcw,
  BookOpen,
  Award,
  Activity
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Progress } from '@/components/ui/progress'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import { useChatStore } from '@/store/chatStore'

interface PsychologyMessage {
  id: string
  role: 'user' | 'psychologist'
  content: string
  timestamp: number
  isStreaming?: boolean
}

interface TrainingSession {
  id: string
  scenario: string
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  progress: number
  score: number
  timeSpent: number
  messages: PsychologyMessage[]
}

interface PsychologistTrainingProps {
  className?: string
}

const PsychologistTraining: React.FC<PsychologistTrainingProps> = ({ className }) => {
  // 使用专门的心理测评师Agent (ID: 4)
  const PSYCHOLOGY_AGENT_ID = 4
  
  const { 
    messages: allMessages, 
    sendMessage: sendChatMessage, 
    isLoading,
    apiKey,
    setCurrentMessage,
    currentMessage,
    setSelectedAgent
  } = useChatStore()
  
  const [currentSession, setCurrentSession] = useState<TrainingSession>({
    id: '1',
    scenario: '青少年学习焦虑咨询',
    difficulty: 'intermediate',
    progress: 35,
    score: 78,
    timeSpent: 1240, // 秒
    messages: []
  })
  
  const [isSessionActive, setIsSessionActive] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [isSessionEnded, setIsSessionEnded] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const evaluationRef = useRef<HTMLDivElement>(null)

  // 设置当前使用心理测评师Agent（只在组件挂载时执行一次）
  const initializeAgent = useCallback(() => {
    setSelectedAgent(PSYCHOLOGY_AGENT_ID)
  }, [setSelectedAgent])

  useEffect(() => {
    initializeAgent()
  }, [initializeAgent])

  // 将chat store的消息转换为心理测评师消息格式
  const psychologyMessages: PsychologyMessage[] = useMemo(() => 
    allMessages
      .filter(msg => msg.agentId === PSYCHOLOGY_AGENT_ID)
      .map(msg => ({
        id: msg.id,
        role: msg.role === 'assistant' ? 'psychologist' : 'user',
        content: msg.content,
        timestamp: msg.timestamp,
        isStreaming: msg.isStreaming
      })), [allMessages] // ✅ 只依赖 allMessages
  )

  // 更新当前会话的消息（使用useMemo优化后的psychologyMessages）
  useEffect(() => {
    setCurrentSession(prev => ({
      ...prev,
      messages: psychologyMessages
    }))
  }, [psychologyMessages])

  // 模拟时间计数器
  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isSessionActive && !isPaused) {
      interval = setInterval(() => {
        setCurrentTime(prev => prev + 1)
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [isSessionActive, isPaused])

  // 自动滚动到最新消息
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const scrollToEvaluation = () => {
    evaluationRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [currentSession.messages])

  // 格式化时间显示
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  // 获取难度颜色
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-700'
      case 'intermediate': return 'bg-yellow-100 text-yellow-700'
      case 'advanced': return 'bg-red-100 text-red-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  // 发送消息
  const handleSendMessage = async () => {
    if (!currentMessage.trim() || isLoading) return

    try {
      await sendChatMessage()
      
      // 更新训练进度
      setCurrentSession(prev => ({
        ...prev,
        progress: Math.min(prev.progress + 5, 100),
        score: Math.min(prev.score + 2, 100)
      }))
    } catch (error) {
      console.error('发送消息失败:', error)
    }
  }

  // 开始会话
  const startSession = () => {
    setIsSessionActive(true)
    setIsPaused(false)
    setIsSessionEnded(false)
    
    // 如果没有消息，发送初始的场景设置消息
    if (psychologyMessages.length === 0) {
      setCurrentMessage('开始心理咨询对练训练。我是一名心理咨询学生，请你扮演一位16岁的高中生，表达你最近因为学习压力而产生的焦虑情况。我会运用专业的心理咨询技巧与你对话。')
      setTimeout(() => {
        sendChatMessage()
      }, 100)
    }
  }

  // 结束训练，请求AI指导老师点评
  const endSession = async () => {
    setIsSessionEnded(true)
    setIsPaused(true)
    
    // 发送结束训练的消息，请求AI从指导老师角色进行点评
    const evaluationPrompt = `
训练结束。现在请你从Dr. Chen指导老师的角度，对这次心理咨询对练进行专业点评：

1. 评估学生的咨询技巧表现（共情能力、倾听技巧、提问方式等）
2. 分析学生在对话中的优点和需要改进的地方  
3. 提供具体的改进建议和学习方向
4. 给出这次训练的综合评价和鼓励

请以专业、温和且具有指导性的语调进行点评。
    `
    
    setCurrentMessage(evaluationPrompt)
    try {
      await sendChatMessage()
      setTimeout(() => {
        scrollToEvaluation()
      }, 500)
    } catch (error) {
      console.error('获取指导点评失败:', error)
    }
  }

  // 开始新的训练会话
  const startNewSession = () => {
    setCurrentSession(prev => ({ 
      ...prev, 
      messages: [],
      progress: 0,
      score: 78
    }))
    setIsSessionActive(false)
    setIsSessionEnded(false)
    setIsPaused(false)
    setCurrentTime(0)
  }

  return (
    <div className={cn("h-full bg-gradient-to-br from-blue-50 to-indigo-50 flex flex-col", className)}>
      {/* 顶部状态栏 */}
      <div className="bg-white border-b border-gray-200 p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Avatar className="h-12 w-12 border-2 border-blue-100">
              <AvatarFallback className="bg-gradient-to-br from-blue-500 to-blue-600 text-white font-semibold text-lg">DC</AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-xl font-bold text-gray-900">心理测评师对练训练</h2>
              <p className="text-sm text-gray-600 flex items-center">
                <span className="inline-block w-2 h-2 bg-green-400 rounded-full mr-2"></span>
                指导老师: Dr. Chen | 心理咨询专家
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <Badge className={getDifficultyColor(currentSession.difficulty)}>
              {currentSession.difficulty === 'beginner' && '初级'}
              {currentSession.difficulty === 'intermediate' && '中级'}  
              {currentSession.difficulty === 'advanced' && '高级'}
            </Badge>
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Clock className="h-4 w-4" />
              <span>{formatTime(currentTime)}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* 左侧对话区域 */}
        <div className="flex-1 flex flex-col">
          {/* 场景信息卡片 */}
          <div className="p-4">
            <Card className="border-l-4 border-l-blue-500 shadow-sm bg-gradient-to-r from-blue-50 to-white">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center font-bold text-gray-800">
                  <BookOpen className="h-5 w-5 mr-2 text-blue-600" />
                  训练场景: {currentSession.scenario}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                  <p className="text-sm text-blue-800 font-medium mb-2">
                    💡 指导老师提示：
                  </p>
                  <p className="text-sm text-blue-700 leading-relaxed">
                    欢迎参加心理咨询对练训练。我是您的指导老师Dr. Chen，今天我们将练习青少年学习焦虑咨询场景。请想象我现在就是你面前坐着的一位16岁的高中生，他最近因为学习压力而感到焦虑。现在，请用专业的心理咨询技巧开始这次对话。
                  </p>
                </div>
                <p className="text-sm text-gray-700 mb-4 leading-relaxed">
                  在这个场景中，您将扮演心理咨询师，运用专业技巧帮助来访者解决学习焦虑问题。请展现您的共情能力、倾听技巧和专业知识。
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Target className="h-4 w-4 text-blue-500" />
                    <span className="text-sm text-gray-700 font-medium">训练目标: 掌握青少年心理咨询技巧</span>
                  </div>
                  {!isSessionActive ? (
                    <Button onClick={startSession} className="bg-blue-600 hover:bg-blue-700">
                      <PlayCircle className="h-4 w-4 mr-2" />
                      开始训练
                    </Button>
                  ) : !isSessionEnded ? (
                    <div className="flex space-x-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setIsPaused(!isPaused)}
                      >
                        {isPaused ? <PlayCircle className="h-4 w-4" /> : <PauseCircle className="h-4 w-4" />}
                      </Button>
                      <Button 
                        onClick={endSession}
                        className="bg-green-600 hover:bg-green-700 text-white"
                        size="sm"
                      >
                        结束训练
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          setCurrentSession(prev => ({ ...prev, messages: [] }))
                          setIsSessionActive(false)
                          setIsSessionEnded(false)
                          setCurrentTime(0)
                        }}
                      >
                        <RotateCcw className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="flex space-x-2">
                      <Button 
                        onClick={startNewSession}
                        className="bg-blue-600 hover:bg-blue-700"
                        size="sm"
                      >
                        <PlayCircle className="h-4 w-4 mr-2" />
                        开始新训练
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 对话消息区域 */}
          <div className="flex-1 overflow-y-auto px-4 pb-4">
            <div className="space-y-4">
              {/* 实际对话消息 */}
              {psychologyMessages.map((message, index) => {
                const evaluationKeywords = ['点评', '总结', '综合', '评估', '优点', '改进', '建议', '鼓励', '学习方向']
                const containsEvaluationKeyword = evaluationKeywords.some(keyword => message.content.includes(keyword))
                const isLastMessage = index === psychologyMessages.length - 1

                const isEvaluationMessage = isSessionEnded &&
                  message.role === 'psychologist' &&
                  (containsEvaluationKeyword || (isLastMessage && message.content.length > 50))

                return (
                  <div
                    key={message.id}
                    ref={isEvaluationMessage ? evaluationRef : undefined}
                    className={`flex ${message.role === 'psychologist' ? 'justify-start' : 'justify-end'}`}
                  >
                    <div className={`max-w-[75%] ${message.role === 'psychologist' ? 'mr-auto' : 'ml-auto'}`}>
                      {message.role === 'psychologist' && (
                        <div className="flex items-center mb-2">
                          <Avatar className="h-6 w-6 mr-2 border border-blue-200">
                            <AvatarFallback className="bg-gradient-to-br from-blue-500 to-blue-600 text-white text-xs font-semibold">
                              {isEvaluationMessage ? 'DC' : '来'}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-xs text-gray-600 font-medium">
                            {isEvaluationMessage ? 'Dr. Chen (指导老师)' : '来访者 (16岁高中生)'}
                          </span>
                        </div>
                      )}
                      
                      <div className={`p-4 rounded-2xl ${
                        message.role === 'psychologist'
                          ? isEvaluationMessage 
                            ? 'bg-green-50 border border-green-200 shadow-lg'
                            : 'bg-white border border-gray-200 shadow-sm'
                          : 'bg-blue-600 text-white'
                      }`}>
                        <p className={`text-sm whitespace-pre-wrap leading-relaxed ${
                          isEvaluationMessage ? 'text-green-800' : ''
                        }`}>
                          {message.content}
                          {/* 流式输出时显示光标 */}
                          {message.isStreaming && (
                            <span className="inline-block w-2 h-4 ml-1 bg-gray-400 animate-pulse" />
                          )}
                        </p>
                      </div>
                      
                      <div className="mt-1 text-xs text-gray-400 text-right">
                        {new Date(message.timestamp).toLocaleTimeString('zh-CN', { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </div>
                    </div>
                  </div>
                )
              })}
              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* 输入区域 */}
          {isSessionActive && !isSessionEnded && (
            <div className="border-t border-gray-200 bg-white p-4">
              <div className="flex space-x-3">
                <Textarea
                  value={currentMessage}
                  onChange={(e) => setCurrentMessage(e.target.value)}
                  placeholder="请输入您的咨询回应..."
                  className="flex-1 min-h-[60px] max-h-[120px] resize-none"
                  disabled={isPaused || isLoading}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault()
                      handleSendMessage()
                    }
                  }}
                />
                <Button 
                  onClick={handleSendMessage}
                  disabled={!currentMessage.trim() || isPaused || isLoading}
                  className="self-end"
                >
                  <MessageCircle className="h-4 w-4 mr-2" />
                  {isLoading ? '发送中...' : '发送'}
                </Button>
              </div>
              <div className="flex items-center justify-between mt-2">
                <p className="text-xs text-gray-500">
                  提示: 使用专业的心理咨询技巧，展现共情能力和倾听技巧
                </p>
                {!apiKey && (
                  <span className="text-xs text-red-500">
                    请先配置API Key
                  </span>
                )}
              </div>
            </div>
          )}

          {/* 训练结束状态提示 */}
          {isSessionEnded && (
            <button
              type="button"
              onClick={scrollToEvaluation}
              className="w-full border-t border-gray-200 bg-green-50 p-4 hover:bg-green-100 transition-colors"
            >
              <div className="flex items-center justify-center space-x-2 text-green-800">
                <Award className="h-5 w-5" />
                <span className="text-sm font-medium">
                  训练已结束，点击查看Dr. Chen老师的专业点评
                </span>
              </div>
            </button>
          )}
        </div>

        {/* 右侧评估面板 */}
        <div className="hidden w-80 border-l border-gray-200 bg-gray-50 p-4 space-y-4 overflow-y-auto">
          {/* 整体进度 */}
          <Card className="shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center font-semibold">
                <Activity className="h-5 w-5 mr-2 text-green-600" />
                训练进度
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-600">完成进度</span>
                  <span className="font-bold text-gray-800">{currentSession.progress}%</span>
                </div>
                <Progress value={currentSession.progress} className="h-3 bg-gray-200" />
              </div>
              <div className="grid grid-cols-2 gap-3 text-center">
                <div className="p-3 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border border-blue-200">
                  <div className="text-2xl font-bold text-blue-700">{currentSession.score}</div>
                  <div className="text-xs text-blue-600 font-medium">综合评分</div>
                </div>
                <div className="p-3 bg-gradient-to-br from-green-50 to-green-100 rounded-lg border border-green-200">
                  <div className="text-2xl font-bold text-green-700">{psychologyMessages.length}</div>
                  <div className="text-xs text-green-600 font-medium">对话轮次</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 技能评估 */}
          <Card className="shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center font-semibold">
                <Star className="h-5 w-5 mr-2 text-yellow-600" />
                技能评估
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-700">共情能力</span>
                  <span className="font-bold text-gray-800">88%</span>
                </div>
                <Progress value={88} className="h-2 bg-gray-200" />
              </div>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-700">倾听技巧</span>
                  <span className="font-bold text-gray-800">76%</span>
                </div>
                <Progress value={76} className="h-2 bg-gray-200" />
              </div>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-700">专业知识</span>
                  <span className="font-bold text-gray-800">82%</span>
                </div>
                <Progress value={82} className="h-2 bg-gray-200" />
              </div>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-700">沟通表达</span>
                  <span className="font-bold text-gray-800">91%</span>
                </div>
                <Progress value={91} className="h-2 bg-gray-200" />
              </div>
            </CardContent>
          </Card>

          {/* 学习建议 */}
          <Card className="shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center font-semibold">
                <Brain className="h-5 w-5 mr-2 text-purple-600" />
                学习建议
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                <div className="p-3 bg-yellow-50 border-l-3 border-yellow-400 rounded-r-lg">
                  <p className="text-yellow-800 font-medium">建议加强开放式提问技巧的练习</p>
                </div>
                <div className="p-3 bg-green-50 border-l-3 border-green-400 rounded-r-lg">
                  <p className="text-green-800 font-medium">共情表达很好，继续保持</p>
                </div>
                <div className="p-3 bg-blue-50 border-l-3 border-blue-400 rounded-r-lg">
                  <p className="text-blue-800 font-medium">可以尝试使用更多心理学理论支撑</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 历史成绩 */}
          <Card className="shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center font-semibold">
                <Award className="h-5 w-5 mr-2 text-orange-600" />
                历史表现
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">最高得分</span>
                  <span className="font-bold text-orange-600">94分</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">平均得分</span>
                  <span className="font-bold text-gray-800">82分</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">完成训练</span>
                  <span className="font-bold text-gray-800">12次</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">总练习时间</span>
                  <span className="font-bold text-gray-800">8.5小时</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default PsychologistTraining
