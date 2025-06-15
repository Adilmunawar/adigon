
import React, { useState, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send, LoaderCircle, Settings } from "lucide-react";
import ChatMessage, { Message } from "@/components/ChatMessage";
import { runChat } from "@/lib/gemini";
import { RunwareService } from "@/lib/runware";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/sonner";

const Index = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'model',
      parts: [{ text: "Hello! I am AdiGon. You can chat with me or ask me to generate an image. To generate an image, type 'generate image: ' followed by your prompt." }]
    }
  ]);
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

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: "user", parts: [{ text: input }] };
    setMessages((prev) => [...prev, userMessage]);
    const currentInput = input;
    setInput("");
    setIsLoading(true);

    try {
      if (currentInput.toLowerCase().startsWith("generate image:")) {
        const prompt = currentInput.substring("generate image:".length).trim();
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
        const response = await runChat(currentInput, history);
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

  return (
    <div className="flex flex-col h-screen bg-background text-foreground">
      <header className="p-4 border-b flex items-center justify-center relative">
        <h1 className="text-xl font-semibold">AdiGon</h1>
        <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
          <DialogTrigger asChild>
            <Button variant="ghost" size="icon" className="absolute right-4 top-1/2 -translate-y-1/2">
              <Settings size={20} />
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Settings</DialogTitle>
              <DialogDescription>
                Manage your API keys here. You can get your Runware API key from the {" "}
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
              <Button onClick={handleSaveApiKey}>Save changes</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </header>
      <main className="flex-1 overflow-y-auto p-4">
        <div className="max-w-4xl mx-auto">
          {messages.map((msg, index) => (
            <ChatMessage key={index} message={msg} />
          ))}
          {isLoading && (
            <div className="flex items-start gap-3 py-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground">
                <LoaderCircle size={20} className="animate-spin" />
              </div>
              <div className="max-w-md rounded-xl px-4 py-3 text-sm bg-muted">
                <p>Thinking...</p>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </main>
      <footer className="p-4 border-t">
        <form onSubmit={handleSendMessage} className="flex gap-2 max-w-4xl mx-auto">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type 'generate image: a cat' or ask anything..."
            disabled={isLoading}
            className="flex-1"
          />
          <Button type="submit" disabled={isLoading}>
            {isLoading ? (
              <LoaderCircle size={20} className="animate-spin" />
            ) : (
              <Send size={20} />
            )}
            <span className="sr-only">Send</span>
          </Button>
        </form>
      </footer>
    </div>
  );
};

export default Index;
