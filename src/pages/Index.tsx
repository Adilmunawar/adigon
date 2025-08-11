import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/providers/AuthProvider';
import { toast } from '@/components/ui/sonner';
import { supabase } from '@/integrations/supabase/client';
import { Code, Image, MessageSquare, Search, Sparkles, Zap, Cpu } from 'lucide-react';
import AppSidebar from '@/components/AppSidebar';
import GeminiInspiredChatInterface from '@/components/GeminiInspiredChatInterface';
import ProfessionalChatInput from '@/components/ProfessionalChatInput';
import DeveloperCanvas from '@/components/DeveloperCanvas';
import { Message } from '@/components/ChatMessage';
import { useQuery } from '@tanstack/react-query';
import { SidebarProvider } from '@/components/ui/sidebar';
import { geminiService } from '@/services/geminiService';
import { Button } from '@/components/ui/button';

const loadingMessages = [
  "Processing with advanced AI models...",
  "Analyzing your request across multiple systems...",
  "Generating optimized response...",
  "Finalizing comprehensive answer...",
  "Almost ready with your result...",
];

const examplePrompts = [
  { text: "Build a React component with TypeScript", icon: Code },
  { text: "Create a professional dashboard", icon: Cpu },
  { text: "Generate an artistic image", icon: Image },
  { text: "Explain complex concepts simply", icon: MessageSquare },
  { text: "Research latest technologies", icon: Search },
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
  const [isCoderMode, setIsCoderMode] = useState(false);
  const [isDeepSearchMode, setIsDeepSearchMode] = useState(false);
  const [isDeveloperCanvasOpen, setIsDeveloperCanvasOpen] = useState(false);
  const [developerCanvasCode, setDeveloperCanvasCode] = useState('');
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

  const [apiKey, setApiKey] = useState('');
  const [tempApiKey, setTempApiKey] = useState('');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

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

  const handleSendMessage = async (messageText: string, fileData?: any) => {
    if ((!messageText.trim() && !fileData) || isLoading) return;

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
      let systemPrompt = "You are AdiGon AI, a sophisticated and helpful AI assistant with advanced capabilities.";
      
      if (isCoderMode) {
        systemPrompt += " You are in Developer Mode. Always provide complete, production-ready code with proper error handling, TypeScript types, and best practices. Include detailed explanations and consider edge cases. Format your responses professionally.";
      }
      
      if (isDeepSearchMode) {
        systemPrompt += " You are in Deep Search Mode. Provide comprehensive, well-researched responses with multiple perspectives, detailed analysis, and current information.";
      }

      const aiResponse = await geminiService.generateResponse(
        messageText,
        systemPrompt,
        fileData
      );

      clearInterval(loadingInterval);
      setIsLoading(false);

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
      
      toast.error("I encountered an error processing your request. Our advanced AI system will retry automatically.");
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
    setInput("Generate a professional, high-quality image of ");
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
    setDeveloperCanvasCode(code);
    setIsDeveloperCanvasOpen(true);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleNewChat = async () => {
    setMessages([]);
    setActiveConversationId(null);
    setInput('');
    setAttachedFile(null);
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

  useEffect(() => {
    if (user) {
      loadConversations();
    }
  }, [user]);

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full bg-slate-950 overflow-hidden">
        <AppSidebar
          isSettingsOpen={false}
          setIsSettingsOpen={() => {}}
          tempApiKey=""
          setTempApiKey={() => {}}
          handleSaveApiKey={() => {}}
          handleNewChat={handleNewChat}
          conversations={conversations}
          activeConversationId={activeConversationId}
          onSelectConversation={() => {}}
          onDeleteConversation={() => {}}
        />
        
        <div className="flex flex-col flex-1 min-w-0 relative">
          {/* Developer Canvas Button - Fixed Position */}
          <div className="absolute top-4 right-4 z-10">
            <Button
              onClick={() => setIsDeveloperCanvasOpen(true)}
              size="sm"
              className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white shadow-lg"
            >
              <Code className="w-4 h-4 mr-2" />
              Developer Canvas
            </Button>
          </div>

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
          
          <ProfessionalChatInput
            input={input}
            setInput={setInput}
            attachedFile={attachedFile}
            setAttachedFile={setAttachedFile}
            isLoading={isLoading}
            isCoderMode={isCoderMode}
            setIsCoderMode={setIsCoderMode}
            isDeepSearchMode={isDeepSearchMode}
            setIsDeepSearchMode={setIsDeepSearchMode}
            onSubmit={onFormSubmit}
            onAttachFile={handleAttachFileClick}
            onImageGeneration={handleImageGeneration}
            onVoiceInput={() => {
              if ('webkitSpeechRecognition' in window) {
                const recognition = new (window as any).webkitSpeechRecognition();
                recognition.continuous = false;
                recognition.interimResults = false;
                recognition.lang = 'en-US';
                recognition.onresult = (event: any) => {
                  const transcript = event.results[0][0].transcript;
                  handleVoiceTranscription(transcript);
                };
                recognition.start();
              }
            }}
            fileInputRef={fileInputRef}
          />
        </div>

        <DeveloperCanvas
          isOpen={isDeveloperCanvasOpen}
          onClose={() => setIsDeveloperCanvasOpen(false)}
          initialCode={developerCanvasCode}
          title="AdiGon AI Developer Canvas"
        />
      </div>
    </SidebarProvider>
  );
};

export default Index;
