import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import type { Agent } from '@/api'

const AgentDisplayTest = () => {
  // 测试用的时间格式化函数（从AgentList复制）
  const formatTimestamp = (timestamp: number | null | undefined): string => {
    if (!timestamp || timestamp <= 0) {
      return ''; // 无效时间戳不显示
    }

    const messageDate = new Date(timestamp * 1000); // 转换为毫秒
    const now = new Date();
    
    // 检查是否是今天
    const isToday = messageDate.toDateString() === now.toDateString();
    
    if (isToday) {
      // 今天显示时间 HH:mm
      return messageDate.toLocaleTimeString('zh-CN', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      });
    } else {
      // 非今天显示日期 MM月DD日
      return messageDate.toLocaleDateString('zh-CN', {
        month: '2-digit',
        day: '2-digit'
      }).replace('/', '月') + '日';
    }
  };

  // 获取显示的消息内容
  const getDisplayMessage = (apiAgent: Agent): string => {
    // 优先显示最后消息内容
    if (apiAgent.last_message_content && apiAgent.last_message_content.trim()) {
      return apiAgent.last_message_content.trim();
    }
    // 如果最后消息内容无效，显示agent描述
    return apiAgent.description;
  };

  // 测试数据
  const now = Math.floor(Date.now() / 1000); // 当前时间戳
  const todayMorning = now - (8 * 60 * 60); // 今天早上8点
  const yesterday = now - (24 * 60 * 60); // 昨天
  const lastWeek = now - (7 * 24 * 60 * 60); // 一周前

  const testAgents: Agent[] = [
    {
      agent_key: 'test1',
      agent_name: '心理问题求助者-谢颖',
      agent_type: 'conversation',
      description: '模拟心理问题求助者,协助测试心理咨询师的专业水平',
      capabilities: [],
      status: 'active',
      avatar: 'PS',
      uuid: 'test-uuid-1',
      config: {
        max_session_duration: 3600,
        evaluation_enabled: true,
        auto_end_timeout: 300
      },
      last_message_content: '我真的快崩溃了,我感觉自己被工作榨干了,',
      last_message_timestamp: now
    },
    {
      agent_key: 'test2',
      agent_name: '会话分析员-小李',
      agent_type: 'conversation',
      description: '专业会话管理助手,帮助您查看和管理所有对话记录',
      capabilities: [],
      status: 'active',
      avatar: 'CO',
      uuid: 'test-uuid-2',
      config: {
        max_session_duration: 3600,
        evaluation_enabled: true,
        auto_end_timeout: 300
      },
      last_message_content: null,
      last_message_timestamp: null
    },
    {
      agent_key: 'test3',
      agent_name: '测试Agent-今天早上',
      agent_type: 'conversation',
      description: '这是一个测试Agent，显示今天早上的消息',
      capabilities: [],
      status: 'active',
      avatar: 'TA',
      uuid: 'test-uuid-3',
      config: {
        max_session_duration: 3600,
        evaluation_enabled: true,
        auto_end_timeout: 300
      },
      last_message_content: '今天早上的消息内容',
      last_message_timestamp: todayMorning
    },
    {
      agent_key: 'test4',
      agent_name: '测试Agent-昨天',
      agent_type: 'conversation',
      description: '这是一个测试Agent，显示昨天的消息',
      capabilities: [],
      status: 'active',
      avatar: 'YD',
      uuid: 'test-uuid-4',
      config: {
        max_session_duration: 3600,
        evaluation_enabled: true,
        auto_end_timeout: 300
      },
      last_message_content: '昨天的消息内容',
      last_message_timestamp: yesterday
    },
    {
      agent_key: 'test5',
      agent_name: '测试Agent-一周前',
      agent_type: 'conversation',
      description: '这是一个测试Agent，显示一周前的消息',
      capabilities: [],
      status: 'active',
      avatar: 'LW',
      uuid: 'test-uuid-5',
      config: {
        max_session_duration: 3600,
        evaluation_enabled: true,
        auto_end_timeout: 300
      },
      last_message_content: '一周前的消息内容',
      last_message_timestamp: lastWeek
    },
    {
      agent_key: 'test6',
      agent_name: '测试Agent-无效时间戳',
      agent_type: 'conversation',
      description: '这是一个测试Agent，时间戳无效',
      capabilities: [],
      status: 'active',
      avatar: 'IN',
      uuid: 'test-uuid-6',
      config: {
        max_session_duration: 3600,
        evaluation_enabled: true,
        auto_end_timeout: 300
      },
      last_message_content: '有消息内容但时间戳无效',
      last_message_timestamp: 0
    }
  ];

  return (
    <div className="p-6 space-y-6 bg-background min-h-screen">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-foreground mb-6">Agent显示测试</h1>
        
        <div className="grid gap-4">
          {testAgents.map((agent) => {
            const displayMessage = getDisplayMessage(agent);
            const displayTime = formatTimestamp(agent.last_message_timestamp);
            
            return (
              <Card key={agent.agent_key} className="w-full">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>{agent.agent_name}</span>
                    {displayTime && (
                      <span className="text-sm text-muted-foreground font-normal">
                        {displayTime}
                      </span>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div>
                      <strong>显示的消息内容:</strong>
                      <p className="text-sm text-muted-foreground mt-1">
                        {displayMessage}
                      </p>
                    </div>
                    <div className="text-xs text-muted-foreground space-y-1">
                      <div><strong>原始数据:</strong></div>
                      <div>last_message_content: {agent.last_message_content || 'null'}</div>
                      <div>last_message_timestamp: {agent.last_message_timestamp || 'null'}</div>
                      <div>description: {agent.description}</div>
                      <div>格式化时间: {displayTime || '(不显示)'}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default AgentDisplayTest;
