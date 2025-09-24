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
  Activity,
  Globe,
  Users
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Progress } from '@/components/ui/progress'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import { useChatStore } from '@/store/chatStore'

interface TrainingMessage {
  id: string
  role: 'user' | 'assistant'
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
  messages: TrainingMessage[]
}

interface TrainingModuleProps {
  selectedAgent: number
  className?: string
}

// 训练配置
const TRAINING_CONFIGS = {
  4: {
    name: 'Dr. Chen',
    title: '心理测评师对练训练',
    description: '心理咨询专家',
    scenario: '青少年学习焦虑咨询',
    avatar: 'DC',
    bgColor: 'from-blue-500 to-blue-600',
    headerBg: 'from-blue-50 to-indigo-50',
    cardBorder: 'border-l-blue-500',
    cardBg: 'from-blue-50 to-white',
    iconColor: 'text-blue-600',
    buttonColor: 'bg-blue-600 hover:bg-blue-700',
    icon: BookOpen,
    clientRole: '来访者 (16岁高中生)',
    trainerRole: 'Dr. Chen (指导老师)',
    welcomeMessage: '欢迎参加心理咨询对练训练。我是您的指导老师Dr. Chen，今天我们将练习青少年学习焦虑咨询场景。请想象我现在就是你面前坐着的一位16岁的高中生，他最近因为学习压力而感到焦虑。现在，请用专业的心理咨询技巧开始这次对话。',
    targetSkill: '掌握青少年心理咨询技巧',
    inputPlaceholder: '请输入您的咨询回应...',
    inputHint: '提示: 使用专业的心理咨询技巧，展现共情能力和倾听技巧',
    startPrompt: '开始心理咨询对练训练。我是一名心理咨询学生，请你扮演一位16岁的高中生，表达你最近因为学习压力而产生的焦虑情况。我会运用专业的心理咨询技巧与你对话。',
    evaluationPrompt: `训练结束。现在请你从Dr. Chen指导老师的角度，对这次心理咨询对练进行专业点评：

1. 评估学生的咨询技巧表现（共情能力、倾听技巧、提问方式等）
2. 分析学生在对话中的优点和需要改进的地方  
3. 提供具体的改进建议和学习方向
4. 给出这次训练的综合评价和鼓励

请以专业、温和且具有指导性的语调进行点评。`
  },
  5: {
    name: 'Prof. Johnson',
    title: '英语口语考官对练训练',
    description: '英语口语考官',
    scenario: '雅思口语考试模拟',
    avatar: 'PJ',
    bgColor: 'from-green-500 to-green-600',
    headerBg: 'from-green-50 to-emerald-50',
    cardBorder: 'border-l-green-500',
    cardBg: 'from-green-50 to-white',
    iconColor: 'text-green-600',
    buttonColor: 'bg-green-600 hover:bg-green-700',
    icon: Globe,
    clientRole: '考生 (雅思考试)',
    trainerRole: 'Prof. Johnson (考官)',
    welcomeMessage: '欢迎参加雅思口语考试模拟训练。我是您的考官Prof. Johnson，今天我们将进行完整的雅思口语考试，包括Part 1-3三个部分。请放松心情，按照真实考试的要求回答问题。',
    targetSkill: '提升英语口语表达能力',
    inputPlaceholder: '请用英语回答考官的问题...',
    inputHint: '提示: 尽量使用丰富的词汇和复杂的语法结构，保持流利和自然',
    startPrompt: '开始雅思口语考试模拟。你是一位专业的雅思口语考官Prof. Johnson，我是参加考试的考生。请按照标准的雅思口语考试流程，从Part 1的个人信息和日常话题开始提问。',
    evaluationPrompt: `口语考试结束。现在请你从Prof. Johnson考官的角度，对这次雅思口语考试进行专业评估：

1. 根据雅思口语评分标准进行评分：
   - 流利度与连贯性 (Fluency and Coherence)
   - 词汇丰富性 (Lexical Resource) 
   - 语法多样性与准确性 (Grammatical Range and Accuracy)
   - 发音 (Pronunciation)

2. 分析考生在各个部分的表现优点和不足
3. 提供具体的改进建议和学习方法
4. 给出预估分数和综合评价

请以专业、客观的考官身份进行详细点评。`
  }
}

const TrainingModule: React.FC<TrainingModuleProps> = ({ selectedAgent, className }) => {
  const config = TRAINING_CONFIGS[selectedAgent as keyof typeof TRAINING_CONFIGS]
  
  if (!config) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">训练场景未找到</h3>
          <p className="text-gray-600">请选择一个有效的训练场景</p>
        </div>
      </div>
    )
  }

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
    scenario: config.scenario,
    difficulty: 'intermediate',
    progress: 35,
    score: 78,
    timeSpent: 1240,
    messages: []
  })
  
  const [isSessionActive, setIsSessionActive] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [isSessionEnded, setIsSessionEnded] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const evaluationRef = useRef<HTMLDivElement>(null)

  // 设置当前使用的Agent
  const initializeAgent = useCallback(() => {
    setSelectedAgent(selectedAgent)
  }, [setSelectedAgent, selectedAgent])

  useEffect(() => {
    initializeAgent()
  }, [initializeAgent])

  // 将chat store的消息转换为训练消息格式
  const trainingMessages: TrainingMessage[] = useMemo(() => 
    allMessages
      .filter(msg => msg.agentId === selectedAgent)
      .map(msg => ({
        id: msg.id,
        role: msg.role === 'assistant' ? 'assistant' : 'user',
        content: msg.content,
        timestamp: msg.timestamp,
        isStreaming: msg.isStreaming
      })), [allMessages, selectedAgent]
  )

  // 更新当前会话的消息
  useEffect(() => {
    setCurrentSession(prev => ({
      ...prev,
      messages: trainingMessages,
      scenario: config.scenario
    }))
  }, [trainingMessages, config.scenario])

  // 当切换agent时重置状态
  useEffect(() => {
    setIsSessionActive(false)
    setIsSessionEnded(false)
    setIsPaused(false)
    setCurrentTime(0)
  }, [selectedAgent])

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
    if (trainingMessages.length === 0) {
      setCurrentMessage(config.startPrompt)
      setTimeout(() => {
        sendChatMessage()
      }, 100)
    }
  }

  // 结束训练，请求AI指导老师点评
  const endSession = async () => {
    setIsSessionEnded(true)
    setIsPaused(true)
    
    setCurrentMessage(config.evaluationPrompt)
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

  const IconComponent = config.icon

  return (
    <div className={cn(`h-full bg-gradient-to-br ${config.headerBg} flex flex-col`, className)}>
      {/* 顶部状态栏 */}
      <div className="bg-white border-b border-gray-200 p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Avatar className="h-12 w-12 border-2 border-gray-100">
              <AvatarFallback className={`bg-gradient-to-br ${config.bgColor} text-white font-semibold text-lg`}>
                {config.avatar}
              </AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-xl font-bold text-gray-900">{config.title}</h2>
              <p className="text-sm text-gray-600 flex items-center">
                <span className="inline-block w-2 h-2 bg-green-400 rounded-full mr-2"></span>
                指导老师: {config.name} | {config.description}
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
            <Card className={`${config.cardBorder} border-l-4 shadow-sm bg-gradient-to-r ${config.cardBg}`}>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center font-bold text-gray-800">
                  <IconComponent className={`h-5 w-5 mr-2 ${config.iconColor}`} />
                  训练场景: {currentSession.scenario}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className={`bg-opacity-80 border rounded-lg p-3 mb-4 ${config.cardBg.includes('blue') ? 'bg-blue-50 border-blue-200' : 'bg-green-50 border-green-200'}`}>
                  <p className={`text-sm font-medium mb-2 ${config.cardBg.includes('blue') ? 'text-blue-800' : 'text-green-800'}`}>
                    💡 指导老师提示：
                  </p>
                  <p className={`text-sm leading-relaxed ${config.cardBg.includes('blue') ? 'text-blue-700' : 'text-green-700'}`}>
                    {config.welcomeMessage}
                  </p>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Target className={`h-4 w-4 ${config.iconColor}`} />
                    <span className="text-sm text-gray-700 font-medium">训练目标: {config.targetSkill}</span>
                  </div>
                  {!isSessionActive ? (
                    <Button onClick={startSession} className={config.buttonColor}>
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
                        onClick={startNewSession}
                      >
                        <RotateCcw className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="flex space-x-2">
                      <Button 
                        onClick={startNewSession}
                        className={config.buttonColor}
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
              {trainingMessages.map((message, index) => {
                const evaluationKeywords = ['点评', '总结', '综合', '评估', '优点', '改进', '建议', '鼓励', '学习方向', '评分', '分数']
                const containsEvaluationKeyword = evaluationKeywords.some(keyword => message.content.includes(keyword))
                const isLastMessage = index === trainingMessages.length - 1

                const isEvaluationMessage = isSessionEnded &&
                  message.role === 'assistant' &&
                  (containsEvaluationKeyword || (isLastMessage && message.content.length > 50))

                return (
                  <div
                    key={message.id}
                    ref={isEvaluationMessage ? evaluationRef : undefined}
                    className={`flex ${message.role === 'assistant' ? 'justify-start' : 'justify-end'}`}
                  >
                    <div className={`max-w-[75%] ${message.role === 'assistant' ? 'mr-auto' : 'ml-auto'}`}>
                      {message.role === 'assistant' && (
                        <div className="flex items-center mb-2">
                          <Avatar className="h-6 w-6 mr-2 border border-gray-200">
                            <AvatarFallback className={`bg-gradient-to-br ${config.bgColor} text-white text-xs font-semibold`}>
                              {isEvaluationMessage ? config.avatar : config.clientRole.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-xs text-gray-600 font-medium">
                            {isEvaluationMessage ? config.trainerRole : config.clientRole}
                          </span>
                        </div>
                      )}
                      
                      <div className={`p-4 rounded-2xl ${
                        message.role === 'assistant'
                          ? isEvaluationMessage 
                            ? 'bg-green-50 border border-green-200 shadow-lg'
                            : 'bg-white border border-gray-200 shadow-sm'
                          : `${config.buttonColor} text-white`
                      }`}>
                        <p className={`text-sm whitespace-pre-wrap leading-relaxed ${
                          isEvaluationMessage ? 'text-green-800' : ''
                        }`}>
                          {message.content}
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
                  placeholder={config.inputPlaceholder}
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
                  {config.inputHint}
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
                  训练已结束，点击查看{config.name}老师的专业点评
                </span>
              </div>
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default TrainingModule
