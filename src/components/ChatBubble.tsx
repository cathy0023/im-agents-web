// React import removed as not used
import { MessageCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useResponsiveBreakpoints } from '@/hooks/useDataEyesPreferences'

interface ChatBubbleProps {
  visible: boolean
  onClick: () => void
  position?: 'bottom-left' | 'bottom-right'
  size?: 'sm' | 'md' | 'lg'
  variant?: 'default' | 'primary' | 'outline' | 'gradient'
  animation?: boolean
  pulse?: boolean
  className?: string
  isAgentListCollapsed?: boolean
}

const ChatBubble = ({
  visible,
  onClick,
  position = 'bottom-left',
  size = 'md',
  variant = 'gradient',
  animation = true,
  pulse = true,
  className,
  isAgentListCollapsed = false
}: ChatBubbleProps) => {
  const { isMobile, isTablet } = useResponsiveBreakpoints()
  
  // 响应式尺寸
  const getResponsiveSize = () => {
    if (isMobile) return 'sm'
    if (isTablet) return 'md' 
    return size
  }
  
  const responsiveSize = getResponsiveSize()
  
  const sizeStyles = {
    sm: "w-10 h-10", // 更小的尺寸
    md: "w-12 h-12", // 更小的尺寸
    lg: "w-16 h-16"  // 更小的尺寸
  }

  const variantStyles = {
    default: "bg-background text-foreground border-border hover:bg-accent",
    primary: "bg-primary text-primary-foreground border-primary hover:bg-primary/90",
    outline: "bg-background text-muted-foreground border-border hover:bg-accent",
    gradient: "bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 text-white border-transparent hover:from-purple-600 hover:via-pink-600 hover:to-orange-500 shadow-lg"
  }

  const positionStyles = {
    'bottom-left': "bottom-6", // 只设置底部位置，左侧位置用style设置
    'bottom-right': "bottom-6 right-6"
  }

  const iconSizes = {
    sm: "h-4 w-4",
    md: "h-6 w-6", 
    lg: "h-8 w-8"
  }

  if (!visible) return null

  return (
    <button
      onClick={onClick}
      className={cn(
        // 基础样式
        "fixed z-[9999] rounded-full shadow-lg border transition-all duration-200",
        "flex items-center justify-center cursor-pointer",
        "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
        
        // 尺寸
        sizeStyles[responsiveSize],
        
        // 变体样式
        variantStyles[variant],
        
        // 位置
        positionStyles[position],
        
        // 动画
        animation && "hover:scale-105 hover:-translate-y-1 active:scale-95",
        
        // 脉动效果
        pulse && (variant === 'primary' || variant === 'gradient') && "animate-pulse",
        
        className
      )}
      style={{
        // 根据AgentList的状态计算left位置
        left: position === 'bottom-left' ? 
          (isAgentListCollapsed ? '120px' : '375px') : // 收起时64px + 16px边距，展开时320px + 16px边距
          undefined
      }}
      title="开启聊天模式"
      aria-label="开启聊天模式"
    >
      <MessageCircle className={iconSizes[responsiveSize]} />
    </button>
  )
}

export default ChatBubble
