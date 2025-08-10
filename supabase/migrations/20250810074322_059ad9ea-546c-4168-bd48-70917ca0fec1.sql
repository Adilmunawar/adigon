
-- Create user_configs table to store user preferences and settings
CREATE TABLE public.user_configs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  ai_creativity DECIMAL(3,2) DEFAULT 0.7 CHECK (ai_creativity >= 0 AND ai_creativity <= 1),
  auto_save BOOLEAN DEFAULT true,
  sound_effects BOOLEAN DEFAULT false,
  notifications BOOLEAN DEFAULT true,
  stream_response BOOLEAN DEFAULT true,
  language TEXT DEFAULT 'en',
  response_style TEXT DEFAULT 'balanced' CHECK (response_style IN ('concise', 'balanced', 'detailed', 'creative')),
  privacy_level TEXT DEFAULT 'standard' CHECK (privacy_level IN ('minimal', 'standard', 'enhanced')),
  code_detail_level TEXT DEFAULT 'comprehensive' CHECK (code_detail_level IN ('minimal', 'standard', 'comprehensive', 'enterprise')),
  response_length TEXT DEFAULT 'adaptive' CHECK (response_length IN ('brief', 'adaptive', 'detailed')),
  theme_preference TEXT DEFAULT 'dark' CHECK (theme_preference IN ('light', 'dark', 'auto')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable Row Level Security
ALTER TABLE public.user_configs ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own config" 
  ON public.user_configs 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own config" 
  ON public.user_configs 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own config" 
  ON public.user_configs 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own config" 
  ON public.user_configs 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Create trigger to update updated_at column
CREATE TRIGGER update_user_configs_updated_at
  BEFORE UPDATE ON public.user_configs
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
