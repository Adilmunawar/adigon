
import React, { useState, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send, LoaderCircle, Settings, Bot, RefreshCw } from "lucide-react";
import ChatMessage, { Message } from "@/components/ChatMessage";
import { runChat } from "@/lib/gemini";
import { RunwareService } from "@/lib/runware";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/sonner";

const initialMessage: Message = {
  role: 'model',
  parts: [{ text: "Hello! I am AdiGon. You can chat with me or ask me to generate an image. To generate an image, type 'generate image: ' followed by your prompt." }]
};

const examplePrompts = [
  "generate image: a futuristic city at night",
  "What is the capital of France?",
  "Write a short poem about space",
  "Explain quantum computing in simple terms",
];

const Index = () => {
  const [messages, setMessages] = useState<Message[]>([initialMessage]);
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
    setMessages([initialMessage]);
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
    <div className="flex flex-col h-screen bg-background text-foreground">
      <header className="p-4 border-b border-white/10 flex items-center justify-between backdrop-blur-md bg-background/30 sticky top-0 z-10">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 text-transparent bg-clip-text">
          AdiGon
        </h1>
        <div className="flex items-center gap-2">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" size="icon">
                <RefreshCw size={20} />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="bg-background">
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will start a new chat and your current conversation will be cleared.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleNewChat} className="bg-primary hover:bg-primary/90">Continue</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
            <DialogTrigger asChild>
              <Button variant="ghost" size="icon">
                <Settings size={20} />
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-background">
              <DialogHeader>
                <DialogTitle>Settings</DialogTitle>
                <DialogDescription>
                  Manage your API keys here. You can get your Runware API key from the{" "}
                  <a href="https://runware.ai/" target="_blank" rel="noopener noreferrer" className="underline">Runware dashboard</a>.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="runware-api-key" className="text-right">
                    Runware API Key
                  </Label>
                  <Input
                    id="runware-api-key"
                    value={tempApiKey}
                    onChange={(e) => setTempApiKey(e.target.value)}
                    className="col-span-3"
                    type="password"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleSaveApiKey} className="bg-primary hover:bg-primary/90">Save changes</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </header>
      <main className="flex-1 overflow-y-auto p-6">
        <div className="max-w-4xl mx-auto">
          {messages.map((msg, index) => (
            <ChatMessage key={index} message={msg} />
          ))}

          {messages.length === 1 && !isLoading && (
            <div className="py-8 text-center animate-fade-in-up">
                <h2 className="text-lg font-semibold text-muted-foreground mb-4">Try one of these prompts:</h2>
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
      <footer className="p-4 border-t border-white/10 backdrop-blur-md bg-background/30 sticky bottom-0">
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
  );
};

export default Index;
