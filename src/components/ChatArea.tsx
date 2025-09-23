// ChatArea现在只负责消息显示，不包含输入框

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
        { id: 6, sender: '用户', content: '这个转化率数据是基于什么时间段的？', time: '10:35', isAI: false },
        { id: 7, sender: 'DataEyes', content: '这是基于过去30天的数据统计。具体来看：\n• 总访问量：125,430次\n• 注册转化率：12.3%\n• 购买转化率：3.8%\n• 复购率：28.5%\n数据显示周末的转化率比工作日高出约15%。', time: '10:36', isAI: true },
        { id: 8, sender: '用户', content: '能生成一份详细的分析报告吗？', time: '10:37', isAI: false },
        { id: 9, sender: 'DataEyes', content: '正在为您生成详细分析报告...报告将包含：\n1. 销售趋势分析\n2. 用户行为洞察\n3. 转化漏斗优化建议\n4. 预测模型结果\n5. 行动方案建议\n\n预计3-5分钟完成，请稍候。', time: '10:38', isAI: true },
        { id: 10, sender: '用户', content: '好的，谢谢！', time: '10:39', isAI: false },
      ]
    } else if (selectedAgent === 3) {
      // 对话助手的消息
      return [
        { id: 1, sender: '对话助手', content: '您好！我是专业的对话助手，致力于为您提供最自然的交流体验。有什么可以帮助您的吗？', time: '09:15', isAI: true },
        { id: 2, sender: '用户', content: '我需要练习英语口语，你可以和我对话吗？', time: '09:16', isAI: false },
        { id: 3, sender: '对话助手', content: 'Of course! I\'d be happy to help you practice English. We can start with a simple conversation. What would you like to talk about? Your hobbies, work, or anything else that interests you?', time: '09:17', isAI: true },
        { id: 4, sender: '用户', content: 'I like reading books and watching movies in my free time.', time: '09:18', isAI: false },
        { id: 5, sender: '对话助手', content: 'That\'s wonderful! Reading and movies are great ways to relax and learn. What genre of books do you prefer? And what was the last movie you watched that you really enjoyed?', time: '09:19', isAI: true },
        { id: 6, sender: '用户', content: 'I prefer science fiction books. The last movie I watched was "Dune" and I loved it!', time: '09:20', isAI: false },
        { id: 7, sender: '对话助手', content: 'Excellent choice! "Dune" is an amazing adaptation of Frank Herbert\'s classic novel. The cinematography and sound design were incredible. Have you read the original Dune series? What did you think of the world-building in the movie?', time: '09:21', isAI: true },
        { id: 8, sender: '用户', content: 'Yes, I read the first book. The movie captured the essence very well.', time: '09:22', isAI: false },
        { id: 9, sender: '对话助手', content: 'I completely agree! Denis Villeneuve did an amazing job staying true to Herbert\'s vision while making it accessible to new audiences. Are you planning to read the other books in the series? "Dune Messiah" has some fascinating philosophical themes.', time: '09:23', isAI: true },
        { id: 10, sender: '用户', content: 'Yes, I\'m planning to read the whole series. Thanks for the conversation practice!', time: '09:24', isAI: false },
        { id: 11, sender: '对话助手', content: 'You\'re very welcome! Your English is quite good. Keep practicing, and don\'t hesitate to ask if you want to discuss books, movies, or any other topics. Have a great day!', time: '09:25', isAI: true },
      ]
    } else {
      // HR智能助手的消息
      return [
        { id: 1, sender: 'HR智能助手', content: '您好！我是HR智能助手，我可以帮您处理各种人力资源相关问题。有什么可以帮助您的吗？', time: '10:30', isAI: true },
        { id: 2, sender: '用户', content: '我想了解一下公司的薪酬福利政策', time: '10:31', isAI: false },
        { id: 3, sender: 'HR智能助手', content: '我们公司提供竞争性薪酬包，包括基本工资、绩效奖金、股票期权、五险一金、带薪年假、健身补贴等。具体薪酬会根据您的经验和能力评估确定。', time: '10:32', isAI: true },
        { id: 4, sender: '用户', content: '请问有哪些培训发展机会？', time: '10:33', isAI: false },
        { id: 5, sender: 'HR智能助手', content: '我们有完善的培训体系：新员工入职培训、技能提升培训、领导力发展计划、外部培训报销等。每年还有晋升机会和跨部门轮岗项目。', time: '10:34', isAI: true },
        { id: 6, sender: '用户', content: '公司的工作时间是怎么安排的？', time: '10:35', isAI: false },
        { id: 7, sender: 'HR智能助手', content: '我们实行弹性工作制：\n• 核心工作时间：10:00-16:00\n• 弹性时间：8:00-10:00，16:00-20:00\n• 支持远程办公（每周最多2天）\n• 年假：入职满1年享有15天带薪年假\n• 病假：按国家规定执行', time: '10:36', isAI: true },
        { id: 8, sender: '用户', content: '如何申请调岗或内部转岗？', time: '10:37', isAI: false },
        { id: 9, sender: 'HR智能助手', content: '内部转岗流程如下：\n1. 在内部岗位平台查看开放职位\n2. 与直属上级沟通转岗意向\n3. 提交转岗申请表\n4. 参加目标岗位面试\n5. 双方主管确认后办理转岗手续\n\n通常需要在当前岗位工作满1年，且绩效达到合格以上。', time: '10:38', isAI: true },
        { id: 10, sender: '用户', content: '公司有哪些员工活动？', time: '10:39', isAI: false },
        { id: 11, sender: 'HR智能助手', content: '我们定期组织各种员工活动：\n• 每月团建活动\n• 季度生日会\n• 年度旅游\n• 技术分享会\n• 读书会\n• 运动俱乐部（篮球、羽毛球、瑜伽等）\n• 节日庆祝活动\n\n另外还有员工子女夏令营、家庭日等福利活动。', time: '10:40', isAI: true },
        { id: 12, sender: '用户', content: '太棒了！感谢详细的介绍', time: '10:41', isAI: false },
        { id: 13, sender: 'HR智能助手', content: '不客气！如果您还有其他HR相关问题，随时可以问我。我还可以帮您查询政策详情、协助办理各种手续等。祝您工作愉快！', time: '10:42', isAI: true },
      ]
    }
  }

  const messages = getMessages()

  return (
    <div className="h-full bg-white flex flex-col">
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
                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
              </div>
              <div className="flex items-center mt-1 space-x-2">
                <span className="text-xs text-gray-500">{message.sender}</span>
                <span className="text-xs text-gray-400">{message.time}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default ChatArea
