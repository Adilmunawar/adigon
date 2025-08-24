
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Send, Plus, Code2, Loader2, User } from 'lucide-react';
import { runChat } from '@/lib/gemini';
import { useToast } from "@/hooks/use-toast"
import { ChatBubble } from '@/components/ChatBubble';
import AdvancedDeveloperCanvas from '@/components/AdvancedDeveloperCanvas';
import LiveCodingCanvas from '@/components/LiveCodingCanvas';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"

const Index = () => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [responseLength, setResponseLength] = useState('adaptive');
  const [codeDetailLevel, setCodeDetailLevel] = useState('comprehensive');
  const [aiCreativity, setAiCreativity] = useState(0.7);
  const [isCanvasOpen, setIsCanvasOpen] = useState(false);
  const [canvasCode, setCanvasCode] = useState('');
  const [isLiveCanvasOpen, setIsLiveCanvasOpen] = useState(false);
  const [liveCanvasCode, setLiveCanvasCode] = useState('');
  const [projectTitle, setProjectTitle] = useState('');
  const [isDeveloperMode, setIsDeveloperMode] = useState(false);
  const navigate = useNavigate();
  const bottomRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Scroll to the bottom when messages update
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleResponse = async () => {
    if (!input.trim()) return;

    setLoading(true);
    setError(null);

    const userMessage = { role: 'user', parts: [{ text: input }] };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput('');

    try {
      const response = await runChat(input, updatedMessages, null, { responseLength, codeDetailLevel, aiCreativity });
      const aiResponse = { role: 'model', parts: [{ text: response }] };
      setMessages([...updatedMessages, aiResponse]);

      // Extract project title from the first response
      if (messages.length === 0) {
        const titleMatch = response.match(/FILE:\s*([^\n\/]+)/);
        if (titleMatch && titleMatch[1]) {
          setProjectTitle(titleMatch[1]);
        } else {
          setProjectTitle('Generated Project');
        }
      }

      // Open live canvas if code is generated
      if (response.includes('FILE:')) {
        setLiveCanvasCode(response);
        setIsLiveCanvasOpen(true);
      }
    } catch (e: any) {
      setError(e.message || 'An error occurred');
      toast({
        variant: "destructive",
        title: "Uh oh! Something went wrong.",
        description: "There was a problem with your request.",
      })
      console.error("Gemini Error: ", e)
    } finally {
      setLoading(false);
    }
  };

  const handleDeveloperMode = () => {
    if (messages.length === 0) {
      toast({
        title: "Start a conversation",
        description: "Start a conversation to enable developer mode",
      });
      return;
    }
    
    // Get the last assistant message for code generation
    const lastAssistantMessage = messages
      .filter(msg => msg.role === 'model')
      .pop();
    
    if (!lastAssistantMessage) {
      toast({
        title: "No AI response available",
        description: "No AI response available for developer mode",
      });
      return;
    }
    
    // Pass the message content to the canvas for AI processing
    setCanvasCode(lastAssistantMessage.parts[0]?.text || '');
    setIsCanvasOpen(true);
  };

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-gray-100 to-gray-200">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">
            AI Code Generator
          </h1>
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" onClick={() => navigate('/pricing')}>
              Upgrade
            </Button>
            <Avatar>
              <AvatarFallback>
                <User className="w-4 h-4" />
              </AvatarFallback>
            </Avatar>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto mb-4">
          {messages.map((message, index) => (
            <ChatBubble key={index} message={message} />
          ))}
          {error && <p className="text-red-500">{error}</p>}
          {loading && (
            <div className="flex items-center justify-start gap-2 text-gray-600">
              <Loader2 className="w-4 h-4 animate-spin" />
              Generating response...
            </div>
          )}
          <div ref={bottomRef} /> {/* Scroll anchor */}
        </div>

        {/* Input Area */}
        <div className="flex items-center gap-3">
          <Input
            type="text"
            placeholder="Describe what you want to build..."
            className="flex-1"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' ? handleResponse() : null}
            disabled={loading}
          />
          <Button onClick={handleResponse} disabled={loading}>
            {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Send className="w-4 h-4 mr-2" />}
            Send
          </Button>
        </div>
      </div>

      {/* Settings Sidebar */}
      <div className="bg-white shadow border-t">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <h2 className="text-md font-semibold text-gray-700">Settings</h2>
          <div className="flex items-center gap-6">
            <div>
              <Label htmlFor="response-length" className="block text-sm font-medium text-gray-700">
                Response Length
              </Label>
              <Select value={responseLength} onValueChange={setResponseLength}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Adaptive" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="brief">Brief</SelectItem>
                  <SelectItem value="adaptive">Adaptive</SelectItem>
                  <SelectItem value="detailed">Detailed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="code-detail" className="block text-sm font-medium text-gray-700">
                Code Detail
              </Label>
              <Select value={codeDetailLevel} onValueChange={setCodeDetailLevel}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Comprehensive" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="minimal">Minimal</SelectItem>
                  <SelectItem value="comprehensive">Comprehensive</SelectItem>
                  <SelectItem value="enterprise">Enterprise</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="ai-creativity" className="block text-sm font-medium text-gray-700">
                AI Creativity
              </Label>
              <Card className="w-[180px]">
                <CardContent>
                  <Slider
                    defaultValue={[aiCreativity]}
                    max={1}
                    step={0.1}
                    onValueChange={(value) => setAiCreativity(value[0])}
                  />
                </CardContent>
              </Card>
            </div>

            <div className="flex items-center space-x-2">
              <Switch id="developer-mode" onCheckedChange={setIsDeveloperMode} />
              <Label htmlFor="developer-mode">Developer Mode</Label>
            </div>

            {isDeveloperMode && (
              <Button variant="secondary" onClick={handleDeveloperMode}>
                <Code2 className="w-4 h-4 mr-2" />
                Open in Canvas
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Developer Canvas Modal */}
      <AdvancedDeveloperCanvas
        isOpen={isCanvasOpen}
        onClose={() => setIsCanvasOpen(false)}
        initialCode={canvasCode}
        title={projectTitle}
      />

      {/* Live Coding Canvas Modal */}
      <LiveCodingCanvas
        isOpen={isLiveCanvasOpen}
        onClose={() => setIsLiveCanvasOpen(false)}
        codeContent={liveCanvasCode}
        projectTitle={projectTitle}
      />
    </div>
  );
};

export default Index;
