import ChatArea from './ChatArea'

interface MainContentProps {
  mode?: 'hr' | 'dataEyes';
  selectedAgent?: number;
}

const MainContent = ({ mode = 'hr', selectedAgent = 1 }: MainContentProps) => {
  return (
    <div className="flex-1 flex flex-col h-full bg-gray-50">
      {/* 内容区域 */}
      <div className="flex-1 flex overflow-hidden">
        <ChatArea mode={mode} selectedAgent={selectedAgent} />
      </div>
    </div>
  )
}

export default MainContent
