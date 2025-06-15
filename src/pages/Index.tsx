import React, { useState, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send, LoaderCircle, Bot } from "lucide-react";
import ChatMessage, { Message } from "@/components/ChatMessage";
import { runChat } from "@/lib/gemini";
import { RunwareService } from "@/lib/runware";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/sonner";
import ThreeScene from "@/components/ThreeScene";
import AppSidebar from "@/components/AppSidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";

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
    toast.info("New chat started!");
  };

  const handleSendMessage = async (promptOverride?: string) => {
    const messageToSend = promptOverride || input;
    if (!messageToSend.trim() || isLoading) return;

    const userMessage: Message = { role: "user", parts: [{ text: messageToSend }] };
    setMessages((prev) => [...prev, userMessage]);
    
    if (!promptOverride) {
      setInput("");
    }
    
    setIsLoading(true);

    try {
      if (messageToSend.toLowerCase().startsWith("generate image:")) {
        const prompt = messageToSend.substring("generate image:".length).trim();
        if (!runwareService || !runwareService.isConnected()) {
           const errorMessage: Message = { role: "model", parts: [{ text: "Please set your Runware API key in settings to generate images." }] };
           setMessages((prev) => [...prev, errorMessage]);
           setIsLoading(false);
           return;
        }
        const result = await runwareService.generateImage({ positivePrompt: prompt });
        const modelMessage: Message = { role: 'model', parts: [{ text: `Here is the image for: "${prompt}"` }], imageUrl: result.imageURL };
        setMessages((prev) => [...prev, modelMessage]);

      } else {
        const history = messages.map(msg => ({
          role: msg.role,
          parts: msg.parts,
        }));
        const response = await runChat(messageToSend, history);
        const modelMessage: Message = { role: "model", parts: [{ text: response }] };
        setMessages((prev) => [...prev, modelMessage]);
      }
    } catch (error) {
      console.error("Failed to get response", error);
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
        />
        <div className="flex flex-col flex-1 overflow-hidden">
          <main className="flex-1 overflow-y-auto p-6 relative">
            <SidebarTrigger className="absolute top-4 left-6" />
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

              {isLoading && (
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
            <form onSubmit={onFormSubmit} className="flex gap-4 max-w-4xl mx-auto">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type 'generate image: a cat' or ask anything..."
                disabled={isLoading}
                className="flex-1 bg-muted border-border focus:ring-2 focus:ring-primary h-12 text-base px-4 rounded-xl transition-all duration-300 focus:bg-background/70 focus:scale-[1.01]"
              />
              <Button type="submit" disabled={isLoading} size="icon" className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary to-accent text-primary-foreground transition-all duration-300 hover:scale-110 hover:brightness-110 active:scale-105 [&_svg]:size-6">
                {isLoading ? (
                  <LoaderCircle className="animate-spin" />
                ) : (
                  <Send />
                )}
                <span className="sr-only">Send</span>
              </Button>
            </form>
          </footer>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Index;
