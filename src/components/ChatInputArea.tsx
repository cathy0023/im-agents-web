// React import removed as not used
import { cn } from '@/lib/utils'
import MessageInput from './MessageInput'

interface ChatInputAreaProps {
  agentId?: number
  className?: string
  placeholder?: string
}

const ChatInputArea = ({ 
  className, 
  placeholder = "请输入数据分析问题..." 
}: ChatInputAreaProps) => {
  return (
    <div className={cn(
      "border-t border-border bg-background p-4",
      className
    )}>
      <MessageInput 
        placeholder={placeholder}
        className="w-full"
      />
    </div>
  )
}

export default ChatInputArea
