
import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/providers/AuthProvider';
import { toast } from '@/components/ui/sonner';
import { supabase } from '@/integrations/supabase/client';
import { Code, MessageSquare, Search, Sparkles, Zap, Cpu, Brain } from 'lucide-react';
import AppSidebar from '@/components/AppSidebar';
import EnhancedChatInterface from '@/components/EnhancedChatInterface';
import EnhancedChatInput from '@/components/EnhancedChatInput';
import AdvancedDeveloperCanvas from '@/components/AdvancedDeveloperCanvas';
import ThreeScene from '@/components/ThreeScene';
import { Message } from '@/components/ChatMessage';
import { useQuery } from '@tanstack/react-query';
import { SidebarProvider } from '@/components/ui/sidebar';
import { geminiService } from '@/services/geminiService';
import { Button } from '@/components/ui/button';
import { FileUploadResult } from '@/services/uploadService';

const loadingMessages = [
  "Processing with advanced AI models...",
  "Analyzing your request across multiple systems...",
  "Leveraging parallel processing capabilities...",
  "Generating optimized response...",
  "Finalizing comprehensive answer...",
  "Almost ready with your result...",
];

const examplePrompts = [
  { text: "Build a complete Instagram clone with authentication", icon: Code },
  { text: "Create a professional dashboard with analytics", icon: Cpu },
  { text: "Develop a real-time chat application", icon: MessageSquare },
  { text: "Generate a complex e-commerce platform", icon: Brain },
  { text: "Research latest AI development trends", icon: Search },
];

const Index = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [conversations, setConversations] = useState<{id: string, title: string}[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [isCoderMode, setIsCoderMode] = useState(false);
  const [isDeepSearchMode, setIsDeepSearchMode] = useState(false);
  const [isAdvancedCanvasOpen, setIsAdvancedCanvasOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { data: userProfile } = useQuery({
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
    console.log('Loading conversations for user:', user.id);
    
    const { data, error } = await supabase
      .from('conversations')
      .select('id, title, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error loading conversations:', error);
      toast.error("Failed to load conversations");
      return;
    }
    
    console.log('Loaded conversations:', data);
    setConversations(data || []);
  };

  useEffect(() => {
    if (user) {
      loadConversations();
    }
  }, [user]);

  const handleSelectConversation = async (conversationId: string) => {
    console.log('Selecting conversation:', conversationId);
    setActiveConversationId(conversationId);
    setIsLoading(true);
    
    try {
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
      
      console.log('Loaded messages:', data);
      const loadedMessages = data.map((msg: any) => ({
        role: msg.role,
        parts: msg.parts,
        ...(msg.image_url && { imageUrl: msg.image_url })
      }));
      setMessages(loadedMessages);
      toast.success("Conversation loaded successfully");
    } catch (error) {
      console.error('Error in handleSelectConversation:', error);
      toast.error("Failed to load conversation");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteConversation = async (conversationId: string) => {
    try {
      const { error } = await supabase
        .from('conversations')
        .delete()
        .eq('id', conversationId)
        .eq('user_id', user?.id);
      
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
    } catch (error) {
      console.error('Error in handleDeleteConversation:', error);
      toast.error("Failed to delete conversation");
    }
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

  const handleSendMessage = async (messageText: string, attachments?: FileUploadResult[]) => {
    if ((!messageText.trim() && (!attachments || attachments.length === 0)) || isLoading) return;

    const currentMessages = [...messages];
    let enhancedMessage = messageText;
    let imageUrl = null;

    // Process attachments
    if (attachments && attachments.length > 0) {
      for (const attachment of attachments) {
        if (attachment.type === 'image' && attachment.url) {
          imageUrl = attachment.url;
        } else if (attachment.type === 'document' || attachment.type === 'audio') {
          enhancedMessage = `[ATTACHMENT: ${attachment.name}]\n${enhancedMessage}`;
        }
      }
    }

    const userMessage: Message = {
      role: "user" as const,
      parts: [{ text: enhancedMessage }],
      ...(imageUrl && { imageUrl })
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    // Cycle through loading messages
    let messageIndex = 0;
    setLoadingMessage(loadingMessages[messageIndex]);
    const loadingInterval = setInterval(() => {
      messageIndex = (messageIndex + 1) % loadingMessages.length;
      setLoadingMessage(loadingMessages[messageIndex]);
    }, 2000);

    try {
      let systemPrompt = "You are AdiGon AI, a sophisticated and highly advanced AI assistant with cutting-edge capabilities.";
      
      if (isCoderMode) {
        systemPrompt += " You are in Advanced Developer Mode. Generate complete, enterprise-grade applications with multiple files, proper architecture, error handling, TypeScript, React, and modern best practices. Create production-ready code with comprehensive functionality.";
      }
      
      if (isDeepSearchMode) {
        systemPrompt += " You are in Deep Research Mode. Provide comprehensive, well-researched responses with multiple perspectives, detailed analysis, current information, and advanced insights.";
      }

      let fileData = null;
      if (imageUrl) {
        const response = await fetch(imageUrl);
        const blob = await response.blob();
        const base64 = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = () => {
            const result = reader.result as string;
            resolve(result.split(',')[1]);
          };
          reader.readAsDataURL(blob);
        });
        fileData = { file: blob, base64, dataUrl: imageUrl };
      }

      const aiResponse = await geminiService.generateResponse(
        enhancedMessage,
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
          let conversationId = activeConversationId;
          
          if (!conversationId) {
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
            conversationId = newConversation.id;
            setActiveConversationId(conversationId);
            await loadConversations();
          }

          // Save messages
          const messagesToSave = [userMessage, aiMessage].map((msg, index) => ({
            conversation_id: conversationId,
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
          toast.error("Failed to save conversation");
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

  const onFormSubmit = async (e: React.FormEvent, attachments?: FileUploadResult[]) => {
    e.preventDefault();
    await handleSendMessage(input, attachments);
  };

  const onReviewCode = (code: string) => {
    setIsAdvancedCanvasOpen(true);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleNewChat = async () => {
    setMessages([]);
    setActiveConversationId(null);
    setInput('');
  };

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full bg-slate-950 overflow-hidden relative">
        {/* Three.js Background */}
        <div className="fixed inset-0 opacity-30 pointer-events-none z-0">
          <ThreeScene className="w-full h-full" />
        </div>
        
        {/* Sidebar */}
        <div className="relative z-30">
          <AppSidebar
            isSettingsOpen={false}
            setIsSettingsOpen={() => {}}
            tempApiKey=""
            setTempApiKey={() => {}}
            handleSaveApiKey={() => {}}
            handleNewChat={handleNewChat}
            conversations={conversations}
            activeConversationId={activeConversationId}
            onSelectConversation={handleSelectConversation}
            onDeleteConversation={handleDeleteConversation}
          />
        </div>
        
        {/* Main Content Area */}
        <div className="flex flex-col flex-1 min-w-0 relative z-20">
          {/* Advanced Developer Canvas Button */}
          <div className="absolute top-4 right-4 z-40">
            <Button
              onClick={() => setIsAdvancedCanvasOpen(true)}
              size="sm"
              className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white shadow-2xl backdrop-blur-sm border border-purple-500/30"
            >
              <Zap className="w-4 h-4 mr-2" />
              Advanced Canvas
            </Button>
          </div>

          <EnhancedChatInterface
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
          
          <EnhancedChatInput
            input={input}
            setInput={setInput}
            isLoading={isLoading}
            isCoderMode={isCoderMode}
            setIsCoderMode={setIsCoderMode}
            isDeepSearchMode={isDeepSearchMode}
            setIsDeepSearchMode={setIsDeepSearchMode}
            onSubmit={onFormSubmit}
          />
        </div>

        {/* Advanced Developer Canvas */}
        <div className="relative z-50">
          <AdvancedDeveloperCanvas
            isOpen={isAdvancedCanvasOpen}
            onClose={() => setIsAdvancedCanvasOpen(false)}
          />
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Index;
