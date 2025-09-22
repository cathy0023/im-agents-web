import { Send } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'

export interface Message {
  id: number;
  sender: string;
  content: string;
  time: string;
  isAI: boolean;
}

interface ChatAreaProps {
  mode?: 'hr' | 'dataEyes';
  selectedAgent?: number;
}

const ChatArea = ({ mode = 'hr', selectedAgent = 1 }: ChatAreaProps) => {
  // 根据选中的agent显示不同的对话内容
  const getMessages = (): Message[] => {
    if (mode === 'dataEyes' || selectedAgent === 2) {
      return [
        { id: 1, sender: 'DataEyes', content: '您好！我是DataEyes数据分析师，我可以帮您分析各种业务数据。', time: '10:30', isAI: true },
        { id: 2, sender: '用户', content: '请帮我分析一下最近的销售趋势', time: '10:31', isAI: false },
        { id: 3, sender: 'DataEyes', content: '好的，根据最新数据分析：本季度销售额同比增长15%，主要增长来源于线上渠道（+28%）和新产品线（+22%）。用户留存率提升至85%，平均客单价增长12%。建议继续加强线上营销投入。', time: '10:32', isAI: true },
        { id: 4, sender: '用户', content: '能详细分析一下用户行为数据吗？', time: '10:33', isAI: false },
        { id: 5, sender: 'DataEyes', content: '当然！用户行为分析显示：访问高峰期为19-21点，移动端占比68%，用户平均停留时间5.2分钟，转化漏斗在支付环节流失率较高（18%），建议优化支付流程。', time: '10:34', isAI: true },
      ]
    } else {
      return [
        { id: 1, sender: 'HR', content: '您好！我是HR，请问有什么可以帮助您的吗？', time: '10:30', isAI: true },
        { id: 2, sender: '用户', content: '我想了解一下公司的薪酬福利政策', time: '10:31', isAI: false },
        { id: 3, sender: 'HR', content: '我们公司提供竞争性薪酬包，包括基本工资、绩效奖金、股票期权、五险一金、带薪年假、健身补贴等。具体薪酬会根据您的经验和能力评估确定。', time: '10:32', isAI: true },
        { id: 4, sender: '用户', content: '请问有哪些培训发展机会？', time: '10:33', isAI: false },
        { id: 5, sender: 'HR', content: '我们有完善的培训体系：新员工入职培训、技能提升培训、领导力发展计划、外部培训报销等。每年还有晋升机会和跨部门轮岗项目。', time: '10:34', isAI: true },
      ]
    }
  }

  const messages = getMessages()

  const getTitle = () => {
    return mode === 'dataEyes' || selectedAgent === 2 ? 'DataEyes分析' : 'HR'
  }

  const getPlaceholder = () => {
    return mode === 'dataEyes' || selectedAgent === 2 ? "请输入数据分析需求..." : "请输入HR相关问题..."
  }

  return (
    <div className="flex flex-col h-full bg-white flex-1">
      {/* 顶部标题栏 */}
      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">
          {getTitle()}
        </h3>
      </div>

      {/* 对话消息列表 */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div key={message.id} className={`flex ${message.isAI ? 'justify-start' : 'justify-end'}`}>
            <div className={`max-w-[70%] ${message.isAI ? 'mr-auto' : 'ml-auto'}`}>
              <div className={`p-3 rounded-lg ${
                message.isAI 
                  ? 'bg-gray-100 text-gray-800' 
                  : 'bg-primary text-white'
              }`}>
                <p className="text-sm">{message.content}</p>
              </div>
              <div className="flex items-center mt-1 space-x-2">
                <span className="text-xs text-gray-500">{message.sender}</span>
                <span className="text-xs text-gray-400">{message.time}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 输入区域 */}
      <div className="bg-white border-t border-gray-200 p-4">
        <div className="flex items-end space-x-3">
          <Textarea
            rows={3}
            placeholder={getPlaceholder()}
            className="flex-1 resize-none"
          />
          <Button size="icon" className="px-4 py-3">
            <Send className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  )
}

export default ChatArea
