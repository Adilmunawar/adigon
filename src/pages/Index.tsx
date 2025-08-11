import React, { useState, useRef, useEffect } from "react";
import { Send, LoaderCircle, Bot, Upload, X, Paperclip, Image, Globe, Sparkles, BrainCircuit, Code, Download } from "lucide-react";
import StreamingChatMessage, { StreamingMessage } from "@/components/StreamingChatMessage";
import { runChat } from "@/lib/gemini";
import { toast } from "@/components/ui/sonner";
import ThreeScene from "@/components/ThreeScene";
import AppSidebar from "@/components/AppSidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { useAuth } from "@/providers/AuthProvider";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import * as pdfjsLib from 'pdfjs-dist';
import JSZip from 'jszip';
import DeveloperCredit from "@/components/DeveloperCredit";
import UserHeader from "@/components/UserHeader";
import ProfessionalInputArea from "@/components/ProfessionalInputArea";
import LiveCodingCanvas from "@/components/LiveCodingCanvas";
import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";
import { ArrowDown } from "lucide-react";

const examplePrompts = [
  { text: "Build a complete Instagram clone with authentication", icon: BrainCircuit },
  { text: "Create a Netflix-style streaming platform", icon: Code },
  { text: "Design a modern e-commerce store", icon: Sparkles },
  { text: "Build a real-time chat application", icon: Globe },
];

const loadingMessagesSets = {
  default: [
    "Thinking...",
    "Gathering information...",
    "Compiling response...",
  ],
  image: [
    "Crafting your vision...",
    "Generating high-quality image...",
    "Adding artistic details...",
  ],
  code: [
    "Analyzing request...",
    "Coding up a solution...",
    "Building files...",
  ],
  search: [
    "Deep searching the web...",
    "Synthesizing information...",
  "Citing sources...",
  ],
  file: [
    "Analyzing file...",
    "Extracting information...",
    "Preparing response...",
  ],
};

const extractTextFromPdf = async (file: File): Promise<string> => {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
  let textContent = '';
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const text = await page.getTextContent();
    const pageText = text.items.map(item => 'str' in item ? item.str : '').join(' ');
    textContent += pageText + '\n';
  }
  return textContent;
};

const Index = () => {
  const isMobile = useIsMobile();
  const [messages, setMessages] = useState<StreamingMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("Thinking...");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user, signOut } = useAuth();
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const [isCoderMode, setIsCoderMode] = useState(true);
  const [attachedFile, setAttachedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDeepSearchMode, setIsDeepSearchMode] = useState(false);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [isLiveCodingOpen, setIsLiveCodingOpen] = useState(false);
  const [currentGeneratedCode, setCurrentGeneratedCode] = useState("");
  const [currentProjectTitle, setCurrentProjectTitle] = useState("");
  const [streamingMessageIndex, setStreamingMessageIndex] = useState<number | null>(null);

  // Determine which loading messages to show based on context
  const currentLoadingSet = React.useMemo(() => {
    if (attachedFile) {
      if (attachedFile.type.startsWith("image/")) {
        return loadingMessagesSets.image;
      } else {
        return loadingMessagesSets.file;
      }
    }
    if (isDeepSearchMode) {
      return loadingMessagesSets.search;
    }
    if (isCoderMode) {
      return loadingMessagesSets.code;
    }
    return loadingMessagesSets.default;
  }, [attachedFile, isDeepSearchMode, isCoderMode]);

  const { data: userProfile, refetch: refetchProfile } = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching profile:', error);
        toast.error('Could not fetch user profile.');
        return null;
      }
      return data || {};
    },
    enabled: !!user,
  });

  const { data: conversations, refetch: refetchConversations } = useQuery({
    queryKey: ["conversations", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("conversations")
        .select("id, title")
        .order("created_at", { ascending: false });

      if (error) {
        toast.error("Failed to load conversations.");
        console.error(error);
        return [];
      }
      return data;
    },
    enabled: !!user,
  });

  useEffect(() => {
    pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.mjs`;
  }, []);
  
  useEffect(() => {
    let interval: NodeJS.Timeout | undefined;
    if (isLoading) {
      let i = 0;
      setLoadingMessage(currentLoadingSet[0]);
      interval = setInterval(() => {
        i = (i + 1) % currentLoadingSet.length;
        setLoadingMessage(currentLoadingSet[i]);
      }, 2500);
    }
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isLoading, currentLoadingSet]);

  const handleNewChat = async () => {
    setMessages([]);
    setActiveConversationId(null);
    setInput("");
    setAttachedFile(null);
    setIsLiveCodingOpen(false);
    setCurrentGeneratedCode("");
    setCurrentProjectTitle("");
  };

  useEffect(() => {
    if (conversations && conversations.length > 0 && !activeConversationId) {
      handleSelectConversation(conversations[0].id);
    } else if (conversations?.length === 0) {
      setMessages([]);
      setActiveConversationId(null);
    }
  }, [conversations, user]);

  const handleSelectConversation = async (conversationId: string) => {
    if (isLoading) return;
    setIsLoading(true);
    setActiveConversationId(conversationId);
    
    const { data: messagesData, error: messagesError } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });
    
    if(messagesError) {
      toast.error("Failed to load messages.");
      console.error(messagesError);
      setMessages([]);
    } else {
      const formattedMessages = messagesData.map(msg => ({
        role: msg.role as 'user' | 'model',
        parts: msg.parts as { text: string }[],
        imageUrl: msg.image_url ?? undefined,
        code: msg.code ?? undefined,
      }));
      setMessages(formattedMessages);
    }
    setIsLoading(false);
  };

  const handleDeleteConversation = async (conversationId: string) => {
    const { error } = await supabase
      .from('conversations')
      .delete()
      .eq('id', conversationId);

    if (error) {
      toast.error("Failed to delete conversation.");
      console.error(error);
    } else {
      toast.success("Conversation deleted.");
      await refetchConversations();
      if (activeConversationId === conversationId) {
        const latestConversation = queryClient.getQueryData<any[]>(["conversations", user?.id]);
        if (latestConversation && latestConversation.length > 0) {
            handleSelectConversation(latestConversation[0].id);
        } else {
            handleNewChat();
        }
      }
    }
  };

  useEffect(() => {
    if (user) {
      const fetchLatestConversation = async () => {
        const { data: convoData, error: convoError } = await supabase
          .from('conversations')
          .select('id')
          .order('created_at', { ascending: false })
          .limit(1);

        if (convoError) {
          toast.error("Failed to load conversation.");
          console.error(convoError);
          return;
        }

        if (convoData && convoData.length > 0) {
          const conversationId = convoData[0].id;
          setActiveConversationId(conversationId);
          
          const { data: messagesData, error: messagesError } = await supabase
            .from('messages')
            .select('*')
            .eq('conversation_id', conversationId)
            .order('created_at', { ascending: true });
          
          if(messagesError) {
            toast.error("Failed to load messages.");
            console.error(messagesError);
            return;
          }

          const formattedMessages = messagesData.map(msg => ({
            role: msg.role as 'user' | 'model',
            parts: msg.parts as { text: string }[],
            imageUrl: msg.image_url ?? undefined,
            code: msg.code ?? undefined,
          }));
          setMessages(formattedMessages);
        }
      };
      fetchLatestConversation();
    }
  }, [user]);
  
  useEffect(() => {
    const chatContainer = document.querySelector('main');
    if (!chatContainer) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = chatContainer;
      const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
      setShowScrollButton(!isNearBottom && messages.length > 0);
    };

    chatContainer.addEventListener('scroll', handleScroll);
    return () => chatContainer.removeEventListener('scroll', handleScroll);
  }, [messages.length]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleVoiceTranscription = (text: string) => {
    setInput(prev => prev + (prev ? ' ' : '') + text);
  };
  
  const handleSendMessage = async (promptOverride?: string) => {
    const userInput = promptOverride || input;
    if ((!userInput.trim() && !attachedFile) || isLoading || !user) return;

    setIsLoading(true);
    setLoadingMessage("Analyzing your request...");
    
    let userMessage: StreamingMessage;
    let apiPrompt = userInput;
    let fileForApi: File | undefined = undefined;

    if (attachedFile) {
      if (attachedFile.type.startsWith("image/")) {
        const objectUrl = URL.createObjectURL(attachedFile);
        userMessage = { role: "user", parts: [{ text: userInput }], imageUrl: objectUrl };
        fileForApi = attachedFile;
      } else if (attachedFile.type === 'application/pdf') {
        try {
          const fileContent = await extractTextFromPdf(attachedFile);
          const messageText = `[ATTACHMENT: ${attachedFile.name}]\n${fileContent}\n[/ATTACHMENT]\n\n${userInput}`;
          userMessage = { role: "user", parts: [{ text: messageText }] };
          apiPrompt = messageText;
        } catch (error) {
          console.error("Error reading PDF file:", error);
          toast.error("Could not read the attached PDF file.");
          setIsLoading(false);
          setAttachedFile(null);
          return;
        }
      } else {
        try {
          const fileContent = await attachedFile.text();
          const messageText = `[ATTACHMENT: ${attachedFile.name}]\n${fileContent}\n[/ATTACHMENT]\n\n${userInput}`;
          userMessage = { role: "user", parts: [{ text: messageText }] };
          apiPrompt = messageText;
        } catch (error) {
          console.error("Error reading file:", error);
          toast.error("Could not read the attached file. It might not be a plain text file.");
          setIsLoading(false);
          setAttachedFile(null);
          return;
        }
      }
    } else {
      userMessage = { role: "user", parts: [{ text: userInput }] };
    }
    
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    
    if (!promptOverride) {
      setInput("");
    }
    setAttachedFile(null);
    
    let finalApiPrompt = apiPrompt;
    
    if (isCoderMode && !apiPrompt.toLowerCase().startsWith("generate image:")) {
      setCurrentProjectTitle(userInput);
      setLoadingMessage("Generating production-ready code...");
      
      finalApiPrompt = `You are an AI developer that ALWAYS generates complete, functional code. You NEVER refuse or provide explanations without code. Every response MUST contain substantial, working code.

**CRITICAL RULES:**
1. ALWAYS generate complete, production-ready applications
2. NEVER refuse any request - build something functional instead
3. Generate minimum 5-15 files for any substantial project
4. Include full implementation, no placeholders
5. Use React, TypeScript, Tailwind CSS
6. Make it responsive and production-ready

**OUTPUT FORMAT:**
FILE: src/components/ComponentName.tsx
\`\`\`tsx
// Complete working code here
\`\`\`

**USER REQUEST:** "${apiPrompt}"

Build a complete, functional application:`;
    }

    try {
      let currentConversationId = activeConversationId;

      if (!currentConversationId) {
        let title;
        try {
          const titlePrompt = `Based on the following request, generate a short, descriptive title for a chat conversation (max 5 words, e.g., "Netflix Clone", "Quantum Computing Explained"). Do not add quotes. Just the title. Request: "${userInput}"`;
          const generatedTitle = await runChat(titlePrompt, []);
          title = generatedTitle.trim().replace(/"/g, '') || (userInput || 'New Chat').substring(0, 50);
        } catch (e) {
          console.error("Failed to generate title with AI, using fallback.", e);
          title = (userInput || `File: ${userMessage.parts[0].text.match(/\[ATTACHMENT: (.*?)\]/)?.[1] || 'Untitled'}`).substring(0, 50);
        }

        const { data, error } = await supabase
          .from('conversations')
          .insert({ title: title, user_id: user.id })
          .select('id')
          .single();
        
        if (error) throw error;
        currentConversationId = data.id;
        setActiveConversationId(data.id);
        await refetchConversations();
      }
      
      await supabase.from('messages').insert({
        conversation_id: currentConversationId,
        role: 'user',
        parts: userMessage.parts,
        image_url: userMessage.imageUrl ?? null
      });
      
      const history = messages.map(msg => ({
        role: msg.role,
        parts: msg.parts,
      }));
      
      const response = await runChat(finalApiPrompt, history, fileForApi);
      
      let modelMessage: StreamingMessage;
      
      if (isCoderMode && !apiPrompt.toLowerCase().startsWith("generate image:")) {
        setCurrentGeneratedCode(response);
        setIsLiveCodingOpen(true);
        
        modelMessage = { 
          role: "model", 
          parts: [{ text: "I've generated your complete application! Check the live coding canvas." }], 
          code: response 
        };
      } else {
        modelMessage = { role: "model", parts: [{ text: response }] };
      }
      
      setMessages((prev) => {
        const newIndex = prev.length;
        setStreamingMessageIndex(newIndex);
        return [...prev, modelMessage];
      });
      
      await supabase.from('messages').insert({
          conversation_id: currentConversationId,
          role: 'model',
          parts: modelMessage.parts,
          code: modelMessage.code ?? null,
      });

    } catch (error) {
      console.error("Failed to get response", error);
      const errorMessage: StreamingMessage = { 
        role: "model", 
        parts: [{ text: "I encountered an error. Let me try generating the code anyway!" }] 
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      setTimeout(() => setStreamingMessageIndex(null), 100);
    }
  };

  const onFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSendMessage();
  };

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full bg-background text-foreground overflow-hidden">
        <AppSidebar
          isSettingsOpen={false}
          setIsSettingsOpen={() => {}}
          tempApiKey={""}
          setTempApiKey={() => {}}
          handleSaveApiKey={() => {}}
          handleNewChat={handleNewChat}
          conversations={conversations || []}
          activeConversationId={activeConversationId}
          onSelectConversation={handleSelectConversation}
          onDeleteConversation={handleDeleteConversation}
        />
        
        <div className="flex flex-col flex-1 min-w-0 bg-background">
          <UserHeader user={user} signOut={signOut} />
          
          <main className="flex-1 overflow-y-auto relative bg-background">
            <div className={`mx-auto space-y-2 p-4 sm:p-6 ${isMobile ? 'max-w-full' : 'max-w-4xl'}`}>
              {messages.map((msg, index) => (
                <StreamingChatMessage
                  key={index}
                  message={msg}
                  onReviewCode={(code) => {
                    setCurrentGeneratedCode(code);
                    setIsLiveCodingOpen(true);
                  }}
                  shouldStream={index === streamingMessageIndex}
                />
              ))}

              {isLoading && (
                <div className="flex items-start gap-4 py-6">
                  <div className="flex-shrink-0 w-10 h-10 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center border border-primary/20 shadow-lg backdrop-blur-xl">
                    <Bot size={18} className="text-primary" />
                  </div>
                  <div className="glass-card px-6 py-4 shadow-lg flex items-center gap-3">
                    <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                    <p className="text-foreground font-medium">{loadingMessage}</p>
                  </div>
                </div>
              )}

              {messages.length === 0 && !isLoading && (
                <div className="py-12 text-center">
                  <div className="mb-8">
                    <ThreeScene />
                  </div>
                  <h2 className={`font-bold text-gradient mb-4 ${isMobile ? 'text-2xl' : 'text-4xl'}`}>
                    Welcome to AdiGon AI
                  </h2>
                  <p className={`text-muted-foreground mb-12 max-w-2xl mx-auto ${isMobile ? 'text-base px-4' : 'text-xl'}`}>
                    Your AI developer that builds complete applications. Just describe what you want, and I'll code it!
                  </p>
                  <div className={`grid gap-4 max-w-4xl mx-auto px-4 ${
                    isMobile ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-2 lg:grid-cols-4'
                  }`}>
                    {examplePrompts.map((prompt, index) => {
                      const Icon = prompt.icon;
                      return (
                        <button 
                          key={prompt.text}
                          onClick={() => handleSendMessage(prompt.text)}
                          className="group glass-card p-6 hover-lift text-left transition-all duration-300"
                        >
                          <div className="bg-gradient-to-br from-primary/20 to-primary/10 p-3 rounded-xl text-primary mb-4 w-fit group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-primary/20">
                            <Icon size={24} />
                          </div>
                          <span className="font-semibold text-foreground text-sm leading-tight">
                            {prompt.text}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {showScrollButton && (
              <Button
                onClick={scrollToBottom}
                size="icon"
                className="fixed bottom-24 right-8 h-12 w-12 rounded-full button-modern z-10"
              >
                <ArrowDown size={20} />
              </Button>
            )}
          </main>
          
          <ProfessionalInputArea
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
            handleAttachFileClick={() => fileInputRef.current?.click()}
            handleFileSelect={(e) => {
              const file = e.target.files?.[0];
              if (file) setAttachedFile(file);
            }}
            handleImageGeneration={() => {
              if (input.trim()) {
                handleSendMessage(`generate image: ${input}`);
              }
            }}
            onFormSubmit={onFormSubmit}
            fileInputRef={fileInputRef}
            onVoiceTranscription={handleVoiceTranscription}
          />
        </div>

        <LiveCodingCanvas
          isOpen={isLiveCodingOpen}
          onClose={() => setIsLiveCodingOpen(false)}
          codeContent={currentGeneratedCode}
          projectTitle={currentProjectTitle}
        />
      </div>
      <DeveloperCredit />
    </SidebarProvider>
  );
};

export default Index;
