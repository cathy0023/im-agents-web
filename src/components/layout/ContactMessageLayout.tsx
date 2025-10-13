import { useState } from 'react'
import { PanelLeft, Settings } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ConversationList } from '@/components/chat'
import { ContactChatArea } from '@/components/contacts'
import { SettingsPanel } from '@/components/common'
import { useConversationStore } from '@/store/conversationStore'
import type { Conversation } from '@/types/conversation'

const ContactMessageLayout = () => {
  const [isSettingsPanelVisible, setIsSettingsPanelVisible] = useState(false)
  const [isConversationListCollapsed, setIsConversationListCollapsed] = useState(false)
  const { currentConversation } = useConversationStore()

  const handleToggleConversationList = () => {
    setIsConversationListCollapsed(!isConversationListCollapsed)
  }


  const handleConversationChange = (conversation: Conversation) => {
    // 对话切换逻辑已在ConversationList内部处理
    console.log('Conversation changed:', conversation.name)
  }

  return (
    <>
      <div className="flex-1 flex overflow-hidden">
        {/* 左侧对话列表 */}
        <ConversationList 
          onConversationChange={handleConversationChange}
          isCollapsed={isConversationListCollapsed}
          onToggleCollapse={handleToggleConversationList}
        />
        
        {/* 右侧主要内容区域 */}
        <div className="flex-1 flex flex-col h-full bg-background">
          {/* HeaderBar */}
          <div className="h-12 bg-background border-b border-border flex items-center justify-between px-4">
            <div className="flex items-center space-x-3">
              <Button 
                variant="ghost" 
                size="icon"
                onClick={handleToggleConversationList}
                className="h-8 w-8 text-muted-foreground hover:text-foreground"
                title="展开/收起对话列表"
              >
                <PanelLeft className="h-4 w-4" />
              </Button>
              <h2 className="text-lg font-semibold text-foreground">
                {currentConversation?.name || '选择对话'}
              </h2>
            </div>
            <div className="flex items-center space-x-2">
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => setIsSettingsPanelVisible(!isSettingsPanelVisible)}
                className="h-8 w-8 text-muted-foreground hover:text-foreground"
                title="设置"
              >
                <Settings className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          {/* 主要内容区域 */}
          <div className="flex-1 flex overflow-hidden">
            {/* 中间内容区域 */}
            <div className="flex-1 flex flex-col">
              <ContactChatArea />
            </div>
            
            {/* 右侧设置面板 */}
            <SettingsPanel 
              isVisible={isSettingsPanelVisible} 
              onClose={() => setIsSettingsPanelVisible(false)}
            />
          </div>
        </div>
      </div>
      
    </>
  )
}

export default ContactMessageLayout
