import React from 'react'
import { cn } from '@/lib/utils'

interface TypingStatusProps {
  className?: string
  senderName?: string
  isVisible?: boolean
}

const TypingStatus = React.forwardRef<HTMLDivElement, TypingStatusProps>(
  ({ className, senderName = '对方', isVisible = false, ...props }, ref) => {
    if (!isVisible) return null

    return (
      <div
        ref={ref}
        className={cn(
          "flex items-center justify-start px-1 py-1 animate-in fade-in-0 slide-in-from-bottom-1 duration-300",
          className
        )}
        {...props}
      >
        <div className="flex items-center space-x-2">
          <span className="text-xs text-muted-foreground font-medium">
            {senderName}正在输入
          </span>
          
          {/* 三个跳动的点 */}
          <div className="flex space-x-0.5">
            <div className="w-1 h-1 bg-muted-foreground/60 rounded-full animate-bounce [animation-delay:-0.3s] [animation-duration:1.4s]"></div>
            <div className="w-1 h-1 bg-muted-foreground/60 rounded-full animate-bounce [animation-delay:-0.15s] [animation-duration:1.4s]"></div>
            <div className="w-1 h-1 bg-muted-foreground/60 rounded-full animate-bounce [animation-duration:1.4s]"></div>
          </div>
        </div>
      </div>
    )
  }
)

TypingStatus.displayName = "TypingStatus"

export { TypingStatus }
