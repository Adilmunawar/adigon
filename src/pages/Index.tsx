
import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/providers/AuthProvider';
import { toast } from '@/components/ui/sonner';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { supabase } from '@/integrations/supabase/client';
import { Code, Image, MessageSquare, Search, Sparkles, Zap } from 'lucide-react';
import AppSidebar from '@/components/AppSidebar';
import GeminiInspiredChatInterface from '@/components/GeminiInspiredChatInterface';
import GeminiInspiredInputArea from '@/components/GeminiInspiredInputArea';
import { Message } from '@/components/ChatMessage';
import { useQuery } from '@tanstack/react-query';

const loadingMessages = [
  "Thinking deeply about your request...",
  "Processing information...",
  "Generating creative response...",
  "Almost ready with your answer...",
  "Crafting the perfect response...",
];

const examplePrompts = [
  { text: "Build a React component", icon: Code },
  { text: "Generate an image", icon: Image },
  { text: "Explain a concept", icon: MessageSquare },
  { text: "Research a topic", icon: Search },
];

const Index = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [attachedFile, setAttachedFile] = useState<File | null>(null);
  const [conversations, setConversations] = useState<{id: string, title: string}[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [tempApiKey, setTempApiKey] = useState('');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isCoderMode, setIsCoderMode] = useState(false);
  const [isDeepSearchMode, setIsDeepSearchMode] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: userProfile, refetch: refetchProfile } = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  const loadConversations = async () => {
    if (!user?.id) return;
    
    const { data, error } = await supabase
      .from('conversations')
      .select('id, title, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error loading conversations:', error);
      return;
    }
    
    setConversations(data || []);
  };

  useEffect(() => {
    if (user) {
      loadConversations();
      
      const savedApiKey = localStorage.getItem('gemini_api_key');
      if (savedApiKey) {
        setApiKey(savedApiKey);
        setTempApiKey(savedApiKey);
      }
    }
  }, [user]);

  const handleSendMessage = async (messageText: string, fileData?: any) => {
    if ((!messageText.trim() && !fileData) || isLoading) return;

    if (!apiKey) {
      toast.error("Please set your Gemini API key in the settings first.");
      setIsSettingsOpen(true);
      return;
    }

    const currentMessages = [...messages];
    const userMessage: Message = {
      role: "user" as const,
      parts: [{ text: messageText }],
      ...(fileData && { imageUrl: fileData.dataUrl })
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setAttachedFile(null);
    setIsLoading(true);

    // Cycle through loading messages
    let messageIndex = 0;
    setLoadingMessage(loadingMessages[messageIndex]);
    const loadingInterval = setInterval(() => {
      messageIndex = (messageIndex + 1) % loadingMessages.length;
      setLoadingMessage(loadingMessages[messageIndex]);
    }, 2000);

    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      
      let systemPrompt = "You are AdiGon AI, a helpful and creative assistant.";
      
      if (isCoderMode) {
        systemPrompt += " You are in Developer Mode. Always provide complete, production-ready code with proper error handling, TypeScript types, and best practices. Include detailed explanations and consider edge cases.";
      }
      
      if (isDeepSearchMode) {
        systemPrompt += " You are in Deep Search Mode. Provide comprehensive, well-researched responses with multiple perspectives and detailed analysis.";
      }

      const model = genAI.getGenerativeModel({ 
        model: "gemini-1.5-flash",
        systemInstruction: systemPrompt
      });

      const prompt = messageText;
      let result;

      if (fileData?.file) {
        const imagePart = {
          inlineData: {
            data: fileData.base64,
            mimeType: fileData.file.type
          }
        };
        result = await model.generateContent([prompt, imagePart]);
      } else {
        result = await model.generateContent(prompt);
      }

      clearInterval(loadingInterval);
      setIsLoading(false);

      const aiResponse = result.response.text();
      const aiMessage: Message = {
        role: "model" as const,
        parts: [{ text: aiResponse }]
      };

      setMessages(prev => [...prev, aiMessage]);

      // Save conversation if user is logged in
      if (user?.id) {
        try {
          if (!activeConversationId) {
            const conversationTitle = messageText.slice(0, 50) + (messageText.length > 50 ? '...' : '');
            const { data: newConversation, error: convError } = await supabase
              .from('conversations')
              .insert({
                user_id: user.id,
                title: conversationTitle
              })
              .select()
              .single();

            if (convError) throw convError;
            setActiveConversationId(newConversation.id);
            await loadConversations();
          }

          // Save messages with correct field names
          const messagesToSave = [userMessage, aiMessage].map((msg, index) => ({
            conversation_id: activeConversationId,
            parts: msg.parts,
            role: msg.role,
            created_at: new Date(Date.now() + index).toISOString(),
            ...(msg.imageUrl && { image_url: msg.imageUrl })
          }));

          const { error: msgError } = await supabase
            .from('messages')
            .insert(messagesToSave);

          if (msgError) throw msgError;
        } catch (error) {
          console.error('Error saving conversation:', error);
        }
      }

    } catch (error) {
      clearInterval(loadingInterval);
      setIsLoading(false);
      console.error('Error:', error);
      
      if (error instanceof Error && error.message.includes('API_KEY_INVALID')) {
        toast.error("Invalid API key. Please check your Gemini API key.");
        setIsSettingsOpen(true);
      } else {
        toast.error("Sorry, I encountered an error. Please try again.");
      }
      
      setMessages(currentMessages);
    }
  };

  const handleAttachFileClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      toast.error("File size must be less than 10MB");
      return;
    }

    setAttachedFile(file);
    toast.success("File attached successfully!");
  };

  const handleImageGeneration = () => {
    setInput("Generate a creative image of ");
  };

  const onFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    let fileData = null;
    if (attachedFile) {
      if (attachedFile.type.startsWith('image/')) {
        const base64 = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = () => {
            const result = reader.result as string;
            resolve(result.split(',')[1]);
          };
          reader.readAsDataURL(attachedFile);
        });
        
        const dataUrl = URL.createObjectURL(attachedFile);
        fileData = { file: attachedFile, base64, dataUrl };
      } else {
        const text = await attachedFile.text();
        const enhancedInput = `[ATTACHMENT: ${attachedFile.name}]\n${text}\n[/ATTACHMENT]\n\n${input}`;
        await handleSendMessage(enhancedInput);
        return;
      }
    }
    
    await handleSendMessage(input, fileData);
  };

  const onReviewCode = (code: string) => {
    setInput(`Please review and explain this code:\n\n\`\`\`\n${code}\n\`\`\``);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSelectConversation = async (conversationId: string) => {
    setActiveConversationId(conversationId);
    
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });
    
    if (error) {
      console.error('Error loading messages:', error);
      toast.error("Failed to load conversation");
      return;
    }
    
    const loadedMessages = data.map((msg: any) => ({
      role: msg.role,
      parts: msg.parts,
      ...(msg.image_url && { imageUrl: msg.image_url })
    }));
    setMessages(loadedMessages);
  };

  const handleDeleteConversation = async (conversationId: string) => {
    const { error } = await supabase
      .from('conversations')
      .delete()
      .eq('id', conversationId);
    
    if (error) {
      console.error('Error deleting conversation:', error);
      toast.error("Failed to delete conversation");
      return;
    }
    
    if (activeConversationId === conversationId) {
      setActiveConversationId(null);
      setMessages([]);
    }
    
    await loadConversations();
    toast.success("Conversation deleted");
  };

  const handleNewChat = async () => {
    setMessages([]);
    setActiveConversationId(null);
    setInput('');
    setAttachedFile(null);
  };

  const handleSaveApiKey = () => {
    if (tempApiKey.trim()) {
      setApiKey(tempApiKey);
      localStorage.setItem('gemini_api_key', tempApiKey);
      toast.success("API key saved successfully!");
      setIsSettingsOpen(false);
    } else {
      toast.error("Please enter a valid API key");
    }
  };

  const handleVoiceTranscription = (text: string) => {
    setInput(prev => prev + text);
  };

  // Handle scroll detection for scroll button
  useEffect(() => {
    const handleScroll = (e: Event) => {
      const target = e.target as HTMLElement;
      if (target) {
        const { scrollTop, scrollHeight, clientHeight } = target;
        const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
        setShowScrollButton(!isNearBottom && messages.length > 2);
      }
    };

    const chatContainer = document.querySelector('main');
    if (chatContainer) {
      chatContainer.addEventListener('scroll', handleScroll);
      return () => chatContainer.removeEventListener('scroll', handleScroll);
    }
  }, [messages.length]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  }, [messages.length]);

  return (
    <div className="flex h-screen w-full bg-slate-950 overflow-hidden">
      <AppSidebar
        isSettingsOpen={isSettingsOpen}
        setIsSettingsOpen={setIsSettingsOpen}
        tempApiKey={tempApiKey}
        setTempApiKey={setTempApiKey}
        handleSaveApiKey={handleSaveApiKey}
        handleNewChat={handleNewChat}
        conversations={conversations}
        activeConversationId={activeConversationId}
        onSelectConversation={handleSelectConversation}
        onDeleteConversation={handleDeleteConversation}
      />
      
      <div className="flex flex-col flex-1 min-w-0">
        <GeminiInspiredChatInterface
          messages={messages}
          isLoading={isLoading}
          loadingMessage={loadingMessage}
          examplePrompts={examplePrompts}
          handleSendMessage={handleSendMessage}
          onReviewCode={onReviewCode}
          messagesEndRef={messagesEndRef}
          showScrollButton={showScrollButton}
          scrollToBottom={scrollToBottom}
        />
        
        <GeminiInspiredInputArea
          input={input}
          setInput={setInput}
          attachedFile={attachedFile}
          setAttachedFile={setAttachedFile}
          isLoading={isLoading}
          user={user}
          isCoderMode={isCoderMode}
          setIsCoderMode={setIsCoderMode}
          isDeepSearchMode={isDeepSearchMode}
          setIsDeepSearchMode={setIsDeepSearchMode}
          handleAttachFileClick={handleAttachFileClick}
          handleFileSelect={handleFileSelect}
          handleImageGeneration={handleImageGeneration}
          onFormSubmit={onFormSubmit}
          fileInputRef={fileInputRef}
          onVoiceTranscription={handleVoiceTranscription}
        />
      </div>
    </div>
  );
};

export default Index;
