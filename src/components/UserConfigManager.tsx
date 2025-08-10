
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/sonner';

export interface UserConfig {
  id?: string;
  user_id?: string;
  ai_creativity?: number;
  auto_save?: boolean;
  sound_effects?: boolean;
  notifications?: boolean;
  stream_response?: boolean;
  language?: string;
  response_style?: string;
  privacy_level?: string;
  code_detail_level?: string;
  response_length?: string;
  theme_preference?: string;
  created_at?: string;
  updated_at?: string;
}

export const useUserConfig = (userId: string | undefined) => {
  const [config, setConfig] = useState<UserConfig>({});
  const [loading, setLoading] = useState(false);

  // Load user configuration
  const loadConfig = async () => {
    if (!userId) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('user_configs')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error loading user config:', error);
        return;
      }

      if (data) {
        setConfig(data);
      }
    } catch (error) {
      console.error('Error loading config:', error);
    } finally {
      setLoading(false);
    }
  };

  // Save user configuration
  const saveConfig = async (newConfig: Partial<UserConfig>) => {
    if (!userId) return false;

    setLoading(true);
    try {
      const configData = {
        user_id: userId,
        ...newConfig,
        updated_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from('user_configs')
        .upsert(configData, { onConflict: 'user_id' })
        .select()
        .single();

      if (error) {
        console.error('Error saving config:', error);
        toast.error('Failed to save configuration');
        return false;
      }

      setConfig(data);
      toast.success('Configuration saved successfully!');
      return true;
    } catch (error) {
      console.error('Error saving config:', error);
      toast.error('Failed to save configuration');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Update specific config field
  const updateConfig = async (field: keyof UserConfig, value: any) => {
    const updatedConfig = { ...config, [field]: value };
    setConfig(updatedConfig);
    await saveConfig(updatedConfig);
  };

  useEffect(() => {
    loadConfig();
  }, [userId]);

  return {
    config,
    loading,
    saveConfig,
    updateConfig,
    loadConfig,
  };
};

export default useUserConfig;
