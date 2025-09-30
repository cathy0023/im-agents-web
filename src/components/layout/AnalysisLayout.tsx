import DataEyesLayout from './DataEyesLayout'

const AnalysisLayout = () => {
  // 分析模块直接使用 DataEyesLayout，不显示 AgentList
  return (
    <DataEyesLayout 
      agentId="999" // 分析模块特殊ID
      chatEnabled={true}
      chatBubblePosition="bottom-side-left"
      isAgentListCollapsed={false} // 分析模块没有AgentList，此参数无效
    />
  )
}

export default AnalysisLayout
