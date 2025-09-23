
interface AgentListProps {
  selectedAgent: number;
  onAgentChange: (agentId: number) => void;
  isCollapsed?: boolean;
}

const AgentList = ({ selectedAgent, onAgentChange, isCollapsed = false }: AgentListProps) => {
  const agents = [
    { id: 1, name: 'HR智能助手', message: '对话+数据分析', time: '昨天', avatar: 'HR' },
    { id: 2, name: 'DataEyes', message: '纯数据分析专家', time: '10:30', avatar: 'DE' },
    { id: 3, name: '对话助手', message: '专注对话交互', time: '09:15', avatar: 'CA' }
  ]

  const handleAgentClick = (agentId: number) => {
    onAgentChange(agentId)
    console.log('Selected agent:', agentId)
  }

  return (
    <div className={`bg-white border-r border-gray-200 flex flex-col h-full transition-all duration-300 ${
      isCollapsed ? 'w-16' : 'w-80'
    }`}>
      {/* Agent列表 */}
      <div className="flex-1 overflow-y-auto">
        <div className="py-3 px-2">
          {agents.map((agent) => (
            <div 
              key={agent.id} 
              onClick={() => handleAgentClick(agent.id)}
              className={`flex items-start rounded-lg cursor-pointer transition-colors ${
                isCollapsed 
                  ? 'p-2 justify-center' 
                  : 'space-x-3 p-3'
              } ${
                selectedAgent === agent.id 
                  ? 'bg-blue-50 border border-blue-200' 
                  : 'hover:bg-gray-50'
              }`}
              title={isCollapsed ? `${agent.name} - ${agent.message}` : ''}
            >
              <div className="flex-shrink-0">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  selectedAgent === agent.id
                    ? 'bg-gradient-to-br from-blue-600 to-blue-500'
                    : 'bg-gradient-to-br from-blue-500 to-purple-600'
                }`}>
                  <span className="text-white text-sm font-medium">
                    {agent.avatar}
                  </span>
                </div>
              </div>
              {!isCollapsed && (
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className={`text-sm font-medium truncate ${
                      selectedAgent === agent.id ? 'text-blue-900' : 'text-gray-900'
                    }`}>
                      {agent.name}
                    </p>
                    <span className="text-xs text-gray-500">{agent.time}</span>
                  </div>
                  <p className={`text-sm truncate mt-1 ${
                    selectedAgent === agent.id ? 'text-blue-700' : 'text-gray-600'
                  }`}>
                    {agent.message}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default AgentList
