
-- Create a table to store conversations
CREATE TABLE public.conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Add Row Level Security (RLS) to the conversations table
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;

-- Create policy that allows users to see their own conversations
CREATE POLICY "Users can view their own conversations"
ON public.conversations FOR SELECT
USING (auth.uid() = user_id);

-- Create policy that allows users to create their own conversations
CREATE POLICY "Users can create their own conversations"
ON public.conversations FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Create a table to store messages within conversations
CREATE TABLE public.messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('user', 'model')),
    parts JSONB NOT NULL,
    image_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Add Row Level Security (RLS) to the messages table
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Create policy that allows users to see messages in their own conversations
CREATE POLICY "Users can view messages in their own conversations"
ON public.messages FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM public.conversations
    WHERE conversations.id = messages.conversation_id AND conversations.user_id = auth.uid()
  )
);

-- Create policy that allows users to create messages in their own conversations
CREATE POLICY "Users can create messages in their own conversations"
ON public.messages FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.conversations
    WHERE conversations.id = messages.conversation_id AND conversations.user_id = auth.uid()
  )
);
