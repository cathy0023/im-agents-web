import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card } from './ui/card';
import { useChatStore, AVAILABLE_MODELS } from '../store/chatStore';

interface ApiKeyDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

const ApiKeyDialog = ({ isOpen, onClose }: ApiKeyDialogProps) => {
  const { 
    apiKey, 
    selectedModel, 
    setApiKey, 
    setSelectedModel,
    setError 
  } = useChatStore();
  
  const [tempApiKey, setTempApiKey] = useState(apiKey);
  const [tempModel, setTempModel] = useState(selectedModel);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setTempApiKey(apiKey);
      setTempModel(selectedModel);
    }
  }, [isOpen, apiKey, selectedModel]);

  const handleSave = async () => {
    if (!tempApiKey.trim()) {
      setError('请输入API Key');
      return;
    }

    setIsLoading(true);
    
    try {
      // 保存配置
      setApiKey(tempApiKey.trim());
      setSelectedModel(tempModel);
      setError(null);
      
      // 简单验证API Key格式
      if (!tempApiKey.includes('.') || tempApiKey.length < 20) {
        setError('API Key格式可能不正确，请检查');
        setIsLoading(false);
        return;
      }

      onClose();
    } catch (error) {
      setError('保存配置失败');
    }
    
    setIsLoading(false);
  };

  const handleCancel = () => {
    setTempApiKey(apiKey);
    setTempModel(selectedModel);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="w-full max-w-md mx-4 p-6">
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-foreground mb-2">
            配置智谱AI
          </h2>
          <p className="text-sm text-muted-foreground">
            配置您的智谱AI API Key以开始对话
          </p>
        </div>

        <div className="space-y-4">
          {/* API Key输入 */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              API Key
            </label>
            <Input
              type="password"
              value={tempApiKey}
              onChange={(e) => setTempApiKey(e.target.value)}
              placeholder="请输入您的智谱AI API Key"
              className="w-full"
            />
            <p className="mt-1 text-xs text-muted-foreground">
              在 
              <a 
                href="https://open.bigmodel.cn/usercenter/apikeys" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary hover:text-primary/80 underline"
              >
                智谱AI控制台
              </a> 
              获取您的API Key
            </p>
          </div>

          {/* 模型选择 */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              选择模型
            </label>
            <select
              value={tempModel}
              onChange={(e) => setTempModel(e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary bg-background text-foreground"
            >
              {AVAILABLE_MODELS.map(model => (
                <option key={model.id} value={model.id}>
                  {model.name} - {model.description}
                </option>
              ))}
            </select>
          </div>

          {/* 使用说明 */}
          <div className="bg-primary/10 p-3 rounded-lg">
            <h4 className="text-sm font-medium text-primary mb-1">使用说明：</h4>
            <ul className="text-xs text-primary space-y-1">
              <li>• 智谱AI提供免费的API额度供测试使用</li>
              <li>• API Key会安全存储在本地浏览器中</li>
              <li>• 支持实时流式对话体验</li>
              <li>• 推荐使用GLM-4模型获得最佳效果</li>
            </ul>
          </div>
        </div>

        {/* 按钮区域 */}
        <div className="flex gap-3 mt-6">
          <Button
            variant="outline"
            onClick={handleCancel}
            className="flex-1"
            disabled={isLoading}
          >
            取消
          </Button>
          <Button
            onClick={handleSave}
            className="flex-1 bg-primary hover:bg-primary/90"
            disabled={isLoading || !tempApiKey.trim()}
          >
            {isLoading ? (
              <>
                <svg className="animate-spin w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                </svg>
                保存中...
              </>
            ) : (
              '保存配置'
            )}
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default ApiKeyDialog;
