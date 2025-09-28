// React import removed as not used
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { useResponsiveBreakpoints, useAnimationPreferences } from '@/hooks/useDataEyesPreferences'
import type { AdaptiveContainerProps } from '@/types/dataEyes'

const AdaptiveContainer = ({
  mode,
  chatComponent,
  chartComponent,
  transition = {
    duration: 0.3,
    easing: 'easeOut'
  },
  splitRatio = 0.5
}: AdaptiveContainerProps) => {
  
  // 响应式和动画偏好
  const { isMobile, isTablet } = useResponsiveBreakpoints()
  const { animationEnabled } = useAnimationPreferences()
  
  // 根据屏幕尺寸调整分割比例
  const getResponsiveSplitRatio = () => {
    if (isMobile) return 1 // 移动端全屏切换
    if (isTablet) return 0.4 // 平板端 40:60
    return splitRatio // 桌面端使用传入的比例
  }
  
  const responsiveSplitRatio = getResponsiveSplitRatio()
  
  // 根据用户偏好调整动画时长
  const getAnimationDuration = () => {
    if (!animationEnabled) return 0
    if (isMobile) return transition.duration * 0.6 // 移动端更快
    if (isTablet) return transition.duration * 0.8 // 平板端稍快
    return transition.duration
  }
  
  const animationDuration = getAnimationDuration()
  
  // 聊天区域动画变体
  const chatAreaVariants = {
    hidden: {
      x: isMobile ? '0%' : '-100%',
      opacity: isMobile ? 0 : 0,
      scale: isMobile ? 0.95 : 1,
      transition: {
        duration: 0,
      }
    },
    visible: {
      x: 0,
      opacity: 1,
      scale: 1,
      transition: {
        duration: animationDuration,
        ease: "easeOut" as const,
        delay: animationEnabled ? (isMobile ? 0 : 0.1) : 0
      }
    },
    exit: {
      x: isMobile ? '0%' : '-100%',
      opacity: 0,
      scale: isMobile ? 0.95 : 1,
      transition: {
        duration: animationDuration * 0.8,
        ease: "easeIn" as const,
      }
    }
  }

  // 图表区域动画变体
  const chartAreaVariants = {
    fullWidth: {
      width: '100%',
      opacity: isMobile && mode === 'chat-active' ? 0 : 1,
      transition: {
        duration: animationDuration,
        ease: "easeOut" as const,
      }
    },
    splitWidth: {
      width: isMobile ? '100%' : `${(1 - responsiveSplitRatio) * 100}%`,
      opacity: isMobile && mode === 'chat-active' ? 0 : 1,
      transition: {
        duration: animationDuration,
        ease: "easeOut" as const,
        delay: animationEnabled ? 0.05 : 0
      }
    }
  }

  return (
    <div className={cn(
      "flex-1 flex h-full overflow-hidden",
      isMobile && mode === 'chat-active' && "relative" // 移动端使用绝对定位覆盖
    )}>
      {/* 聊天区域 - 条件渲染 */}
      <AnimatePresence mode="wait">
        {mode === 'chat-active' && chatComponent && (
          <motion.div
            key="chat-area"
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={chatAreaVariants}
            className={cn(
              "flex flex-col h-full bg-background",
              isMobile ? "absolute inset-0 z-10" : "relative", // 移动端全屏覆盖
            )}
            style={{ 
              width: isMobile ? '100%' : `${responsiveSplitRatio * 100}%` 
            }}
          >
            {chatComponent}
          </motion.div>
        )}
      </AnimatePresence>

      {/* 图表区域 - 总是渲染，宽度自适应 */}
      <motion.div
        animate={mode === 'chat-active' ? 'splitWidth' : 'fullWidth'}
        variants={chartAreaVariants}
        className={cn(
          "h-full bg-background",
          isMobile && mode === 'chat-active' && "pointer-events-none" // 移动端聊天模式下禁用图表交互
        )}
        style={{
          width: mode === 'chat-active' && !isMobile 
            ? `${(1 - responsiveSplitRatio) * 100}%` 
            : '100%'
        }}
      >
        {chartComponent}
      </motion.div>
    </div>
  )
}

export default AdaptiveContainer
