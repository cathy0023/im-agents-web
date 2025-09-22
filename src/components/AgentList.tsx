
interface AgentListProps {
  selectedAgent: number;
  onAgentChange: (agentId: number) => void;
}

const AgentList = ({ selectedAgent, onAgentChange }: AgentListProps) => {
  const agents = [
    { id: 1, name: 'HR', message: 'Agent资源管理', time: '昨天', avatar: 'HR' },
    { id: 2, name: 'DataEyes', message: '数据分析员', time: '10:30', avatar: 'DE' }
  ]

  const handleAgentClick = (agentId: number) => {
    onAgentChange(agentId)
    console.log('Selected agent:', agentId)
  }

  return (
    <div className="w-80 bg-white border-r border-gray-200 flex flex-col h-full">
      {/* Agent列表 */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-2">
          {agents.map((agent) => (
            <div 
              key={agent.id} 
              onClick={() => handleAgentClick(agent.id)}
              className={`flex items-start space-x-3 p-3 rounded-lg cursor-pointer transition-colors ${
                selectedAgent === agent.id 
                  ? 'bg-blue-50 border border-blue-200' 
                  : 'hover:bg-gray-50'
              }`}
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
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default AgentList
