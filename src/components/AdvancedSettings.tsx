
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { toast } from '@/components/ui/sonner';
import { 
  Brain, 
  Activity, 
  Zap, 
  Shield, 
  Download, 
  Trash2, 
  RefreshCw,
  Volume2,
  Bell,
  Eye,
  MessageSquare,
  BarChart3,
  Database,
  Clock,
  HardDrive
} from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface AdvancedSettingsProps {
  userProfile: any;
  onUpdateProfile: (data: any) => void;
}

const AdvancedSettings = ({ userProfile, onUpdateProfile }: AdvancedSettingsProps) => {
  const [settings, setSettings] = useState({
    aiCreativity: userProfile?.ai_creativity || 0.7,
    autoSave: userProfile?.auto_save ?? true,
    soundEffects: userProfile?.sound_effects ?? false,
    notifications: userProfile?.notifications ?? true,
    streamResponse: userProfile?.stream_response ?? true,
    language: userProfile?.language || 'en',
    responseStyle: userProfile?.response_style || 'balanced',
    privacy: userProfile?.privacy_level || 'standard',
    codeDetailLevel: userProfile?.code_detail_level || 'comprehensive',
    responseLength: userProfile?.response_length || 'adaptive',
  });

  // Mock data for demonstration
  const activityData = {
    totalMessages: 247,
    codeGenerated: 15,
    imagesCreated: 8,
    filesUploaded: 12,
    storageUsed: 2.3, // GB
    storageLimit: 10, // GB
    lastActivity: new Date().toLocaleDateString(),
    accountAge: '15 days'
  };

  const handleSettingChange = (key: string, value: any) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    onUpdateProfile(newSettings);
  };

  const clearChatHistory = () => {
    toast.info("Chat history clearing functionality would be implemented here.");
  };

  const exportData = () => {
    toast.info("Data export functionality would be implemented here.");
  };

  const resetSettings = () => {
    const defaultSettings = {
      aiCreativity: 0.7,
      autoSave: true,
      soundEffects: false,
      notifications: true,
      streamResponse: true,
      language: 'en',
      responseStyle: 'balanced',
      privacy: 'standard',
      codeDetailLevel: 'comprehensive',
      responseLength: 'adaptive',
    };
    setSettings(defaultSettings);
    onUpdateProfile(defaultSettings);
    toast.success("Settings reset to defaults!");
  };

  return (
    <div className="space-y-6 p-6 max-h-[80vh] overflow-y-auto">
      {/* Activity & Stats Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Activity className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold">Activity & Statistics</h3>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-card/50 p-4 rounded-lg border border-border/50">
            <div className="flex items-center gap-2 mb-2">
              <MessageSquare className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">Total Messages</span>
            </div>
            <p className="text-2xl font-bold text-primary">{activityData.totalMessages}</p>
          </div>
          
          <div className="bg-card/50 p-4 rounded-lg border border-border/50">
            <div className="flex items-center gap-2 mb-2">
              <BarChart3 className="h-4 w-4 text-green-500" />
              <span className="text-sm font-medium">Code Generated</span>
            </div>
            <p className="text-2xl font-bold text-green-500">{activityData.codeGenerated}</p>
          </div>
          
          <div className="bg-card/50 p-4 rounded-lg border border-border/50">
            <div className="flex items-center gap-2 mb-2">
              <Database className="h-4 w-4 text-blue-500" />
              <span className="text-sm font-medium">Files Uploaded</span>
            </div>
            <p className="text-2xl font-bold text-blue-500">{activityData.filesUploaded}</p>
          </div>
          
          <div className="bg-card/50 p-4 rounded-lg border border-border/50">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="h-4 w-4 text-orange-500" />
              <span className="text-sm font-medium">Account Age</span>
            </div>
            <p className="text-2xl font-bold text-orange-500">{activityData.accountAge}</p>
          </div>
        </div>

        <div className="bg-card/50 p-4 rounded-lg border border-border/50">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <HardDrive className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">Storage Usage</span>
            </div>
            <span className="text-sm text-muted-foreground">
              {activityData.storageUsed}GB / {activityData.storageLimit}GB
            </span>
          </div>
          <Progress value={(activityData.storageUsed / activityData.storageLimit) * 100} className="h-2" />
        </div>
      </div>

      <Separator />

      {/* AI Behavior Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold">AI Behavior</h3>
        </div>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center justify-between">
              Creativity Level
              <span className="text-xs text-muted-foreground">{Math.round(settings.aiCreativity * 100)}%</span>
            </label>
            <Slider
              value={[settings.aiCreativity]}
              onValueChange={([value]) => handleSettingChange('aiCreativity', value)}
              max={1}
              min={0}
              step={0.1}
              className="w-full"
            />
            <p className="text-xs text-muted-foreground">
              Higher values make responses more creative and unpredictable
            </p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Response Style</label>
            <Select value={settings.responseStyle} onValueChange={(value) => handleSettingChange('responseStyle', value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="concise">Concise</SelectItem>
                <SelectItem value="balanced">Balanced</SelectItem>
                <SelectItem value="detailed">Detailed</SelectItem>
                <SelectItem value="creative">Creative</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Code Detail Level</label>
            <Select value={settings.codeDetailLevel} onValueChange={(value) => handleSettingChange('codeDetailLevel', value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="minimal">Minimal</SelectItem>
                <SelectItem value="standard">Standard</SelectItem>
                <SelectItem value="comprehensive">Comprehensive</SelectItem>
                <SelectItem value="enterprise">Enterprise Grade</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Controls how detailed and functional the generated code will be
            </p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Response Length</label>
            <Select value={settings.responseLength} onValueChange={(value) => handleSettingChange('responseLength', value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="brief">Brief</SelectItem>
                <SelectItem value="adaptive">Adaptive</SelectItem>
                <SelectItem value="detailed">Always Detailed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <label className="text-sm font-medium">Stream Responses</label>
              <p className="text-xs text-muted-foreground">Show responses as they're generated</p>
            </div>
            <Switch
              checked={settings.streamResponse}
              onCheckedChange={(checked) => handleSettingChange('streamResponse', checked)}
            />
          </div>
        </div>
      </div>

      <Separator />

      {/* Interface Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Eye className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold">Interface</h3>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <label className="text-sm font-medium flex items-center gap-2">
                <Volume2 className="h-4 w-4" />
                Sound Effects
              </label>
              <p className="text-xs text-muted-foreground">Play sounds for actions and notifications</p>
            </div>
            <Switch
              checked={settings.soundEffects}
              onCheckedChange={(checked) => handleSettingChange('soundEffects', checked)}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Language</label>
            <Select value={settings.language} onValueChange={(value) => handleSettingChange('language', value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="es">Español</SelectItem>
                <SelectItem value="fr">Français</SelectItem>
                <SelectItem value="de">Deutsch</SelectItem>
                <SelectItem value="zh">中文</SelectItem>
                <SelectItem value="ja">日本語</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <Separator />

      {/* Privacy & Security Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold">Privacy & Security</h3>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <label className="text-sm font-medium flex items-center gap-2">
                <Bell className="h-4 w-4" />
                Notifications
              </label>
              <p className="text-xs text-muted-foreground">Receive updates and alerts</p>
            </div>
            <Switch
              checked={settings.notifications}
              onCheckedChange={(checked) => handleSettingChange('notifications', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <label className="text-sm font-medium flex items-center gap-2">
                <Zap className="h-4 w-4" />
                Auto-Save Conversations
              </label>
              <p className="text-xs text-muted-foreground">Automatically save chat history</p>
            </div>
            <Switch
              checked={settings.autoSave}
              onCheckedChange={(checked) => handleSettingChange('autoSave', checked)}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <Eye className="h-4 w-4" />
              Privacy Level
            </label>
            <Select value={settings.privacy} onValueChange={(value) => handleSettingChange('privacy', value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="minimal">Minimal</SelectItem>
                <SelectItem value="standard">Standard</SelectItem>
                <SelectItem value="enhanced">Enhanced</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <Separator />

      {/* Data Management Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold">Data Management</h3>
        </div>
        
        <div className="grid grid-cols-1 gap-3">
          <Button 
            variant="outline" 
            onClick={exportData}
            className="justify-start"
          >
            <Download className="h-4 w-4 mr-2" />
            Export Chat History
          </Button>
          
          <Button 
            variant="outline" 
            onClick={clearChatHistory}
            className="justify-start text-orange-600 hover:text-orange-700"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Clear All Conversations
          </Button>
          
          <Button 
            variant="outline" 
            onClick={resetSettings}
            className="justify-start"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Reset All Settings
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AdvancedSettings;
