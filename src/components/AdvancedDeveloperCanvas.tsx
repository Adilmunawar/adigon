
import React, { useState, useRef, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Code2, Download, Copy, X, Play, Pause, Settings, Zap, Save, Folder, Bug, Sparkles, Send, Bot, User, FileCode, Eye, MessageSquare, Wand2 } from 'lucide-react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { toast } from '@/components/ui/sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { GeneratedCode } from '@/services/advancedCodeGenerator';
import { aiCodeAgent, CodeProject, ProjectFile } from '@/services/aiCodeAgent';

interface DeveloperCanvasProps {
  isOpen: boolean;
  onClose: () => void;
  initialCode?: string;
  initialFiles?: GeneratedCode[];
  title?: string;
}

interface ChatMessage {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const AdvancedDeveloperCanvas = ({ isOpen, onClose, initialCode = '', title = 'AI Code Agent' }: DeveloperCanvasProps) => {
  const [project, setProject] = useState<CodeProject | null>(null);
  const [currentFile, setCurrentFile] = useState<ProjectFile | null>(null);
  const [activeTab, setActiveTab] = useState('files');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState('');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [isChatMode, setIsChatMode] = useState(false);
  const canvasRef = useRef<HTMLDivElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages]);

  const handleGenerateProject = async (prompt: string) => {
    if (!prompt.trim()) return;

    setIsGenerating(true);
    setActiveTab('files');
    setGenerationProgress('Initializing AI Code Agent...');

    try {
      const newProject = await aiCodeAgent.generateCompleteApplication(
        prompt,
        (progress) => {
          setGenerationProgress(progress);
        }
      );
      
      setProject(newProject);
      if (newProject.files.length > 0) {
        setCurrentFile(newProject.files[0]);
      }
      
      toast.success('Project generated successfully!');
      setGenerationProgress('');
    } catch (error) {
      console.error('Generation failed:', error);
      toast.error('Failed to generate project. Please try again.');
      setGenerationProgress('');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleChatSubmit = async () => {
    if (!chatInput.trim() || isGenerating) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: chatInput,
      timestamp: new Date()
    };

    setChatMessages(prev => [...prev, userMessage]);
    const currentInput = chatInput;
    setChatInput('');

    // If no project exists, treat as project generation request
    if (!project) {
      await handleGenerateProject(currentInput);
      return;
    }

    // Handle code improvement requests
    if (currentFile) {
      setIsGenerating(true);
      
      try {
        const improvedCode = await aiCodeAgent.improveCode(
          currentFile.content,
          currentInput
        );

        const updatedFile = { ...currentFile, content: improvedCode };
        const updatedProject = {
          ...project,
          files: project.files.map(f => 
            f.path === currentFile.path ? updatedFile : f
          )
        };

        setProject(updatedProject);
        setCurrentFile(updatedFile);

        const assistantMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          type: 'assistant',
          content: `✅ Code improved successfully! I've updated ${currentFile.path} based on your request: "${currentInput}"`,
          timestamp: new Date()
        };

        setChatMessages(prev => [...prev, assistantMessage]);
        toast.success('Code updated successfully!');
      } catch (error) {
        const errorMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          type: 'assistant',
          content: `❌ Sorry, I couldn't process that request. Error: ${error}`,
          timestamp: new Date()
        };
        setChatMessages(prev => [...prev, errorMessage]);
        toast.error('Failed to improve code');
      } finally {
        setIsGenerating(false);
      }
    }
  };

  const handleFileSelect = (file: ProjectFile) => {
    setCurrentFile(file);
    setActiveTab('editor');
  };

  const handleCopyCode = () => {
    if (currentFile) {
      navigator.clipboard.writeText(currentFile.content);
      toast.success('Code copied to clipboard!');
    }
  };

  const handleDownloadProject = () => {
    if (!project) return;

    const projectData = {
      name: project.name,
      description: project.description,
      files: project.files,
      architecture: project.architecture,
      dependencies: project.dependencies
    };

    const blob = new Blob([JSON.stringify(projectData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${project.name.replace(/\s+/g, '-').toLowerCase()}-project.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Project downloaded!');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[95vw] h-[95vh] bg-slate-950 border-slate-800 text-white flex flex-col">
        <DialogHeader className="border-b border-slate-800 pb-4 flex-shrink-0">
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-3 text-xl">
              <div className="p-2 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-xl border border-purple-500/30">
                <Bot className="w-6 h-6 text-purple-400" />
              </div>
              {title}
              <Badge variant="outline" className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 border-purple-500/30 text-purple-300">
                <Wand2 className="w-3 h-3 mr-1" />
                AI Agent
              </Badge>
              {isGenerating && (
                <Badge variant="outline" className="bg-green-500/20 border-green-500/30 text-green-300">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse mr-2" />
                  Generating...
                </Badge>
              )}
            </DialogTitle>
            
            <div className="flex items-center gap-2">
              <Button
                onClick={() => setIsChatMode(!isChatMode)}
                size="sm"
                variant={isChatMode ? "default" : "outline"}
                className={isChatMode ? "bg-purple-500 hover:bg-purple-600" : "border-slate-700 hover:bg-slate-800"}
              >
                <MessageSquare className="w-4 h-4 mr-2" />
                Chat Mode
              </Button>
              {project && (
                <>
                  <Button
                    onClick={handleCopyCode}
                    size="sm"
                    variant="outline"
                    className="border-slate-700 hover:bg-slate-800"
                    disabled={!currentFile}
                  >
                    <Copy className="w-4 h-4 mr-2" />
                    Copy File
                  </Button>
                  <Button
                    onClick={handleDownloadProject}
                    size="sm"
                    variant="outline"
                    className="border-slate-700 hover:bg-slate-800"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download Project
                  </Button>
                </>
              )}
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 flex overflow-hidden">
          {/* Left Sidebar */}
          <div className="w-80 border-r border-slate-800 flex flex-col">
            {isChatMode ? (
              <div className="flex-1 flex flex-col p-4">
                <div className="flex items-center gap-2 mb-4">
                  <Bot className="w-5 h-5 text-purple-400" />
                  <h3 className="font-medium">AI Assistant</h3>
                </div>
                
                <ScrollArea className="flex-1 pr-4 mb-4">
                  <div className="space-y-4">
                    {chatMessages.map((message) => (
                      <div
                        key={message.id}
                        className={cn(
                          "flex gap-3",
                          message.type === 'user' ? 'justify-end' : 'justify-start'
                        )}
                      >
                        <div
                          className={cn(
                            "max-w-[80%] p-3 rounded-lg text-sm",
                            message.type === 'user'
                              ? 'bg-purple-500 text-white'
                              : 'bg-slate-800 text-slate-100 border border-slate-700'
                          )}
                        >
                          {message.content}
                        </div>
                      </div>
                    ))}
                    <div ref={chatEndRef} />
                  </div>
                </ScrollArea>

                <div className="flex gap-2">
                  <Input
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder={project ? "Ask for code improvements..." : "Describe the app you want to build..."}
                    className="bg-slate-800 border-slate-700"
                    onKeyPress={(e) => e.key === 'Enter' && handleChatSubmit()}
                    disabled={isGenerating}
                  />
                  <Button
                    onClick={handleChatSubmit}
                    size="sm"
                    disabled={isGenerating || !chatInput.trim()}
                    className="bg-purple-500 hover:bg-purple-600"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex-1 p-4 overflow-y-auto">
                <Card className="bg-slate-900/50 border-slate-700/50 mb-4">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm text-slate-300 flex items-center gap-2">
                      <Folder className="w-4 h-4" />
                      Project Files
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {project ? (
                      <div className="space-y-2">
                        <div className="text-xs text-slate-400 mb-3">
                          {project.files.length} files generated
                        </div>
                        {project.files.map((file) => (
                          <button
                            key={file.path}
                            onClick={() => handleFileSelect(file)}
                            className={cn(
                              "w-full text-left p-2 rounded text-xs transition-all flex items-center gap-2",
                              currentFile?.path === file.path
                                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                                : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-300'
                            )}
                          >
                            <FileCode className="w-3 h-3" />
                            <div className="truncate">{file.path}</div>
                          </button>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center text-slate-500 py-8">
                        <Bot className="w-8 h-8 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">No project generated yet</p>
                        <p className="text-xs mt-1">Switch to Chat Mode to start</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {project && (
                  <Card className="bg-slate-900/50 border-slate-700/50">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm text-slate-300">Project Info</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 text-xs">
                      <div>
                        <div className="text-slate-400">Name:</div>
                        <div className="text-slate-200">{project.name}</div>
                      </div>
                      <div>
                        <div className="text-slate-400">Status:</div>
                        <Badge 
                          variant="outline" 
                          className={cn(
                            "text-xs",
                            project.status === 'complete' 
                              ? 'bg-green-500/20 border-green-500/30 text-green-300'
                              : project.status === 'generating'
                              ? 'bg-yellow-500/20 border-yellow-500/30 text-yellow-300'
                              : 'bg-red-500/20 border-red-500/30 text-red-300'
                          )}
                        >
                          {project.status}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}
          </div>

          {/* Main Content */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {isGenerating && generationProgress && (
              <div className="bg-slate-900 border-b border-slate-800 p-4">
                <div className="flex items-center gap-3 text-yellow-400">
                  <div className="w-4 h-4 border-2 border-yellow-400/30 border-t-yellow-400 rounded-full animate-spin" />
                  {generationProgress}
                </div>
              </div>
            )}

            <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
              <TabsList className="bg-slate-900 border-b border-slate-800 rounded-none p-2">
                <TabsTrigger value="files" className="data-[state=active]:bg-slate-700">
                  <Folder className="w-4 h-4 mr-2" />
                  Files
                </TabsTrigger>
                <TabsTrigger value="editor" className="data-[state=active]:bg-slate-700">
                  <Code2 className="w-4 h-4 mr-2" />
                  Code Editor
                </TabsTrigger>
                <TabsTrigger value="preview" className="data-[state=active]:bg-slate-700">
                  <Eye className="w-4 h-4 mr-2" />
                  Preview
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="files" className="flex-1 m-0 overflow-hidden">
                <div className="h-full overflow-auto bg-slate-900 p-6">
                  {project ? (
                    <div className="space-y-6">
                      <div>
                        <h2 className="text-2xl font-bold text-white mb-2">{project.name}</h2>
                        <p className="text-slate-400 mb-4">{project.description}</p>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                          <Card className="bg-slate-800 border-slate-700">
                            <CardContent className="p-4">
                              <div className="text-sm font-medium text-slate-300 mb-2">Files Generated</div>
                              <div className="text-2xl font-bold text-purple-400">{project.files.length}</div>
                            </CardContent>
                          </Card>
                          <Card className="bg-slate-800 border-slate-700">
                            <CardContent className="p-4">
                              <div className="text-sm font-medium text-slate-300 mb-2">Dependencies</div>
                              <div className="text-2xl font-bold text-blue-400">{project.dependencies.length}</div>
                            </CardContent>
                          </Card>
                        </div>
                        
                        <div className="grid gap-4">
                          {project.files.map((file) => (
                            <Card 
                              key={file.path}
                              className="bg-slate-800 border-slate-700 hover:border-slate-600 cursor-pointer transition-all"
                              onClick={() => handleFileSelect(file)}
                            >
                              <CardContent className="p-4">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-3">
                                    <FileCode className="w-5 h-5 text-slate-400" />
                                    <div>
                                      <div className="font-medium text-slate-200">{file.path}</div>
                                      <div className="text-xs text-slate-400">{file.type} • {file.language}</div>
                                    </div>
                                  </div>
                                  <div className="text-xs text-slate-500">
                                    {file.content.split('\n').length} lines
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-full text-slate-500">
                      <div className="text-center">
                        <Bot className="w-16 h-16 mx-auto mb-4 opacity-50" />
                        <h3 className="text-lg font-medium mb-2">AI Code Agent Ready</h3>
                        <p className="mb-4">Switch to Chat Mode and tell me what you want to build!</p>
                        <Button
                          onClick={() => setIsChatMode(true)}
                          className="bg-purple-500 hover:bg-purple-600"
                        >
                          <MessageSquare className="w-4 h-4 mr-2" />
                          Start Chatting
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </TabsContent>
              
              <TabsContent value="editor" className="flex-1 m-0 overflow-hidden">
                <div className="h-full overflow-auto">
                  {currentFile ? (
                    <SyntaxHighlighter
                      style={vscDarkPlus as any}
                      language={currentFile.language}
                      PreTag="div"
                      customStyle={{
                        margin: 0,
                        background: 'rgb(15 23 42)',
                        padding: '1rem',
                        height: '100%',
                        overflow: 'auto'
                      }}
                    >
                      {currentFile.content}
                    </SyntaxHighlighter>
                  ) : (
                    <div className="flex items-center justify-center h-full text-slate-500">
                      <div className="text-center">
                        <FileCode className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p>Select a file to view its code</p>
                      </div>
                    </div>
                  )}
                </div>
              </TabsContent>
              
              <TabsContent value="preview" className="flex-1 m-0 overflow-hidden">
                <div className="h-full bg-white">
                  <iframe
                    src="about:blank"
                    className="w-full h-full border-none"
                    title="Code Preview"
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-slate-900/50 text-white">
                    <div className="text-center">
                      <Eye className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>Live preview coming soon...</p>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AdvancedDeveloperCanvas;
