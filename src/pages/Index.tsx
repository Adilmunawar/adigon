import React, { useState, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send, LoaderCircle, Bot, LogOut, Code, Upload, Copy } from "lucide-react";
import ChatMessage, { Message } from "@/components/ChatMessage";
import { runChat } from "@/lib/gemini";
import { RunwareService } from "@/lib/runware";
import { toast } from "@/components/ui/sonner";
import ThreeScene from "@/components/ThreeScene";
import AppSidebar from "@/components/AppSidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { useAuth } from "@/providers/AuthProvider";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from "@/components/ui/sheet";
import CodeBlock from "@/components/CodeBlock";

const examplePrompts = [
  "generate image: a futuristic city at night",
  "What is the capital of France?",
  "Write a short poem about space",
  "Explain quantum computing in simple terms",
];

const Index = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [runwareApiKey, setRunwareApiKey] = useState<string | null>(null);
  const [runwareService, setRunwareService] = useState<RunwareService | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [tempApiKey, setTempApiKey] = useState("");
  const { user, logout } = useAuth();
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const [isCoderMode, setIsCoderMode] = useState(false);
  const [coderResponse, setCoderResponse] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
        imageUrl: msg.image_url ?? undefined
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
    const storedApiKey = localStorage.getItem("runwareApiKey");
    if (storedApiKey) {
      setRunwareApiKey(storedApiKey);
      setTempApiKey(storedApiKey);
    }
  }, []);

  useEffect(() => {
    if (runwareApiKey) {
      const service = new RunwareService(runwareApiKey);
      setRunwareService(service);
    } else {
      setRunwareService(null);
    }
  }, [runwareApiKey]);

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
            imageUrl: msg.image_url ?? undefined
          }));
          setMessages(formattedMessages);
        }
      };
      fetchLatestConversation();
    }
  }, [user]);
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSaveApiKey = () => {
    if (tempApiKey) {
      localStorage.setItem("runwareApiKey", tempApiKey);
      setRunwareApiKey(tempApiKey);
      setIsSettingsOpen(false);
      toast.success("API Key saved successfully!");
    } else {
      toast.error("Please enter a valid API key.");
    }
  };
  
  const handleNewChat = () => {
    setMessages([]);
    setActiveConversationId(null);
    toast.info("New chat started!");
  };

  const handleAttachFileClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      console.log("File attached:", file);
      toast.info(`Attached file: ${file.name}`);
      // Future functionality can be added here to process the file
    }
  };

  const handleSendMessage = async (promptOverride?: string) => {
    const originalMessage = promptOverride || input;
    if (!originalMessage.trim() || isLoading || !user) return;

    const userMessage: Message = { role: "user", parts: [{ text: originalMessage }] };
    setMessages((prev) => [...prev, userMessage]);
    
    if (!promptOverride) {
      setInput("");
    }
    
    setIsLoading(true);

    let apiPrompt = originalMessage;
    if (isCoderMode && !originalMessage.toLowerCase().startsWith("generate image:")) {
      apiPrompt = `You are a world-class software engineer specializing in creating production-ready applications. Your task is to provide a complete, well-documented, and performant code solution for the following request. Respond ONLY with a markdown code block with the language specified. Do not include any other text or explanation. Request: "${originalMessage}"`;
    }

    let currentConversationId = activeConversationId;

    try {
      if (!currentConversationId) {
        const { data, error } = await supabase
          .from('conversations')
          .insert({ title: originalMessage.substring(0, 50), user_id: user.id })
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
      });

      if (originalMessage.toLowerCase().startsWith("generate image:")) {
        const prompt = originalMessage.substring("generate image:".length).trim();
        if (!runwareService || !runwareService.isConnected()) {
           const errorMessage: Message = { role: "model", parts: [{ text: "Please set your Runware API key in settings to generate images." }] };
           setMessages((prev) => [...prev, errorMessage]);
           setIsLoading(false);
           return;
        }
        const result = await runwareService.generateImage({ positivePrompt: prompt });
        const modelMessage: Message = { role: 'model', parts: [{ text: `Here is the image for: "${prompt}"` }], imageUrl: result.imageURL };
        setMessages((prev) => [...prev, modelMessage]);
        await supabase.from('messages').insert({
            conversation_id: currentConversationId,
            role: 'model',
            parts: modelMessage.parts,
            image_url: modelMessage.imageUrl,
        });

      } else {
        const history = messages.map(msg => ({
          role: msg.role,
          parts: msg.parts,
        }));
        const response = await runChat(apiPrompt, history);
        
        if (isCoderMode) {
          setCoderResponse(response);
          const modelMessage: Message = { role: "model", parts: [{ text: "I have generated the code in the side panel for you." }] };
          setMessages((prev) => [...prev, modelMessage]);
           await supabase.from('messages').insert({
            conversation_id: currentConversationId,
            role: 'model',
            parts: modelMessage.parts,
          });
        } else {
          const modelMessage: Message = { role: "model", parts: [{ text: response }] };
          setMessages((prev) => [...prev, modelMessage]);
          await supabase.from('messages').insert({
              conversation_id: currentConversationId,
              role: 'model',
              parts: modelMessage.parts,
          });
        }
      }
    } catch (error) {
      console.error("Failed to get response or save message", error);
       const errorMessage: Message = { role: "model", parts: [{ text: "Oops! Something went wrong. Please try again." }] };
       setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const onFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSendMessage();
  };

  return (
    <SidebarProvider>
      <div className="flex h-screen bg-background text-foreground">
        <AppSidebar
          isSettingsOpen={isSettingsOpen}
          setIsSettingsOpen={setIsSettingsOpen}
          tempApiKey={tempApiKey}
          setTempApiKey={setTempApiKey}
          handleSaveApiKey={handleSaveApiKey}
          handleNewChat={handleNewChat}
          conversations={conversations || []}
          activeConversationId={activeConversationId}
          onSelectConversation={handleSelectConversation}
          onDeleteConversation={handleDeleteConversation}
        />
        <div className="flex flex-col flex-1 overflow-hidden">
          <main className="flex-1 overflow-y-auto p-6 relative">
            <SidebarTrigger className="absolute top-4 left-6" />
            {user && (
              <div className="absolute top-4 right-6 flex items-center gap-4">
                <span className="text-sm text-muted-foreground hidden sm:inline">
                  {user.email}
                </span>
                <Button variant="outline" size="icon" onClick={logout} className="rounded-full" aria-label="Logout">
                  <LogOut size={16} />
                </Button>
              </div>
            )}
            <div className="max-w-4xl mx-auto pt-8">
              {messages.map((msg, index) => (
                <ChatMessage key={index} message={msg} />
              ))}

              {messages.length === 0 && !isLoading && (
                <div className="py-8 text-center animate-fade-in-up">
                    <ThreeScene />
                    <h2 className="text-lg font-semibold text-muted-foreground mb-4 mt-4">Try one of these prompts:</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-lg mx-auto">
                        {examplePrompts.map((prompt) => (
                            <Button 
                                key={prompt} 
                                variant="outline" 
                                className="text-left justify-start h-auto py-3 px-4 hover:bg-primary/10 hover:border-primary/50 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/20"
                                onClick={() => handleSendMessage(prompt)}
                            >
                                {prompt}
                            </Button>
                        ))}
                    </div>
                </div>
              )}

              {isLoading && messages.length === 0 && (
                <div className="flex items-start gap-4 py-4 animate-fade-in-up">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary ring-2 ring-primary/40">
                    <Bot size={24} />
                  </div>
                  <div className="max-w-md rounded-2xl px-5 py-3 text-base bg-muted shadow-md flex items-center">
                    <LoaderCircle size={20} className="animate-spin mr-3" />
                    <p>Thinking...</p>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </main>
          <footer className="p-4 border-t border-white/10 bg-background/80 backdrop-blur-sm">
            <form onSubmit={onFormSubmit} className="flex gap-2 max-w-4xl mx-auto items-center">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelect}
                className="hidden"
              />
              <Button
                variant="outline"
                size="icon"
                type="button"
                onClick={handleAttachFileClick}
                disabled={isLoading || !user}
                className="h-12 w-12 rounded-xl flex-shrink-0"
                aria-label="Attach file"
              >
                <Upload size={20} />
              </Button>
              <Button
                variant={isCoderMode ? "secondary" : "outline"}
                size="icon"
                type="button"
                onClick={() => setIsCoderMode(!isCoderMode)}
                disabled={isLoading || !user}
                className="h-12 w-12 rounded-xl flex-shrink-0"
                aria-label="Toggle Coder Mode"
              >
                <Code size={20} />
              </Button>
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={isCoderMode ? "Coder Mode: Describe the file or ask a question..." : "Type 'generate image: a cat' or ask anything..."}
                disabled={isLoading || !user}
                className="flex-1 bg-muted border-border focus:ring-2 focus:ring-primary h-12 text-base px-4 rounded-xl transition-all duration-300 focus:bg-background/70 focus:scale-[1.01]"
              />
              <Button type="submit" disabled={isLoading || !input.trim() || !user} size="icon" className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary to-accent text-primary-foreground transition-all duration-300 hover:scale-110 hover:brightness-110 active:scale-105 [&_svg]:size-6">
                {isLoading && messages.length > 0 ? (
                  <LoaderCircle className="animate-spin" />
                ) : (
                  <Send />
                )}
                <span className="sr-only">Send</span>
              </Button>
            </form>
          </footer>
           <Sheet open={!!coderResponse} onOpenChange={(isOpen) => !isOpen && setCoderResponse(null)}>
            <SheetContent side="right" className="w-full md:w-2/3 lg:w-1/2 xl:w-1/2 p-0 flex flex-col">
              <SheetHeader className="p-6 pb-4">
                <SheetTitle>Coder Mode Output</SheetTitle>
                <SheetDescription>
                  The AI has generated the following code. You can review and copy it.
                </SheetDescription>
              </SheetHeader>
              <div className="flex-1 overflow-y-auto px-6">
                {coderResponse && <CodeBlock content={coderResponse} />}
              </div>
              <SheetFooter className="p-6 pt-4 bg-background/80 backdrop-blur-sm border-t">
                <Button
                  onClick={() => {
                    if (coderResponse) {
                      navigator.clipboard.writeText(coderResponse);
                      toast.success("Copied to clipboard!");
                    }
                  }}
                  className="w-full"
                >
                  <Copy className="mr-2 h-4 w-4" /> Copy Code
                </Button>
              </SheetFooter>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Index;
