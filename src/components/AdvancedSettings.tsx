
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { toast } from '@/components/ui/sonner';
import { 
  Brain, 
  Palette, 
  Zap, 
  Shield, 
  Download, 
  Trash2, 
  RefreshCw,
  Moon,
  Sun,
  Volume2,
  Bell,
  Eye,
  MessageSquare
} from 'lucide-react';

interface AdvancedSettingsProps {
  userProfile: any;
  onUpdateProfile: (data: any) => void;
}

const AdvancedSettings = ({ userProfile, onUpdateProfile }: AdvancedSettingsProps) => {
  const [settings, setSettings] = useState({
    aiCreativity: userProfile?.ai_creativity || 0.7,
    autoSave: userProfile?.auto_save ?? true,
    darkMode: userProfile?.dark_mode ?? true,
    soundEffects: userProfile?.sound_effects ?? false,
    notifications: userProfile?.notifications ?? true,
    streamResponse: userProfile?.stream_response ?? true,
    language: userProfile?.language || 'en',
    responseStyle: userProfile?.response_style || 'balanced',
    privacy: userProfile?.privacy_level || 'standard',
  });

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
      darkMode: true,
      soundEffects: false,
      notifications: true,
      streamResponse: true,
      language: 'en',
      responseStyle: 'balanced',
      privacy: 'standard',
    };
    setSettings(defaultSettings);
    onUpdateProfile(defaultSettings);
    toast.success("Settings reset to defaults!");
  };

  return (
    <div className="space-y-6 p-6 max-h-[80vh] overflow-y-auto">
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
          <Palette className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold">Interface</h3>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <label className="text-sm font-medium flex items-center gap-2">
                {settings.darkMode ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
                Dark Mode
              </label>
              <p className="text-xs text-muted-foreground">Toggle between light and dark themes</p>
            </div>
            <Switch
              checked={settings.darkMode}
              onCheckedChange={(checked) => handleSettingChange('darkMode', checked)}
            />
          </div>

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
