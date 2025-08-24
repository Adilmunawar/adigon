import React, { useState, useRef, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Code2, Download, Copy, X, Play, Pause, Settings, Zap, Save, Folder, Bug, Sparkles } from 'lucide-react';
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
import { cn } from '@/lib/utils';

interface DeveloperCanvasProps {
  isOpen: boolean;
  onClose: () => void;
  initialCode?: string;
  title?: string;
}

const DeveloperCanvas = ({ isOpen, onClose, initialCode = '', title = 'Developer Canvas' }: DeveloperCanvasProps) => {
  const [code, setCode] = useState(initialCode);
  const [language, setLanguage] = useState('typescript');
  const [temperature, setTemperature] = useState([0.7]);
  const [maxTokens, setMaxTokens] = useState([1000]);
  const [isExecuting, setIsExecuting] = useState(false);
  const [output, setOutput] = useState('');
  const [activeTab, setActiveTab] = useState('code');
  const canvasRef = useRef<HTMLDivElement>(null);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(code);
    toast.success('Code copied to clipboard!');
  };

  const handleDownload = () => {
    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `code.${language === 'typescript' ? 'ts' : language}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Code downloaded!');
  };

  const handleExecute = async () => {
    setIsExecuting(true);
    setActiveTab('output');
    
    try {
      // Simulate code execution
      await new Promise(resolve => setTimeout(resolve, 2000));
      setOutput(`Execution completed successfully!\n\nLanguage: ${language}\nTemperature: ${temperature[0]}\nMax Tokens: ${maxTokens[0]}\n\nCode output would appear here...`);
    } catch (error) {
      setOutput(`Error: ${error}`);
    } finally {
      setIsExecuting(false);
    }
  };

  const formatCode = () => {
    try {
      if (language === 'json') {
        const formatted = JSON.stringify(JSON.parse(code), null, 2);
        setCode(formatted);
        toast.success('Code formatted!');
      } else {
        toast.info('Auto-formatting available for JSON only');
      }
    } catch (error) {
      toast.error('Invalid JSON syntax');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-7xl h-[90vh] bg-slate-950 border-slate-800 text-white flex flex-col">
        <DialogHeader className="border-b border-slate-800 pb-4 flex-shrink-0">
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-3 text-xl">
              <div className="p-2 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-xl border border-blue-500/30">
                <Code2 className="w-6 h-6 text-blue-400" />
              </div>
              {title}
              <Badge variant="outline" className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 border-blue-500/30 text-blue-300">
                <Zap className="w-3 h-3 mr-1" />
                Pro Canvas
              </Badge>
            </DialogTitle>
            
            <div className="flex items-center gap-2">
              <Button
                onClick={formatCode}
                size="sm"
                variant="outline"
                className="border-slate-700 hover:bg-slate-800"
              >
                <Settings className="w-4 h-4 mr-2" />
                Format
              </Button>
              <Button
                onClick={handleExecute}
                size="sm"
                disabled={isExecuting}
                className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
              >
                {isExecuting ? (
                  <>
                    <Pause className="w-4 h-4 mr-2" />
                    Running...
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 mr-2" />
                    Execute
                  </>
                )}
              </Button>
              <Button
                onClick={handleCopyCode}
                size="sm"
                variant="outline"
                className="border-slate-700 hover:bg-slate-800"
              >
                <Copy className="w-4 h-4 mr-2" />
                Copy
              </Button>
              <Button
                onClick={handleDownload}
                size="sm"
                variant="outline"
                className="border-slate-700 hover:bg-slate-800"
              >
                <Download className="w-4 h-4 mr-2" />
                Download
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 flex overflow-hidden">
          {/* Settings Sidebar */}
          <div className="w-80 border-r border-slate-800 p-4 flex-shrink-0 overflow-y-auto">
            <div className="space-y-6">
              <Card className="bg-slate-900/50 border-slate-700/50">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm text-slate-300">Configuration</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-xs text-slate-400">Language</Label>
                    <Select value={language} onValueChange={setLanguage}>
                      <SelectTrigger className="bg-slate-800 border-slate-700">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="typescript">TypeScript</SelectItem>
                        <SelectItem value="javascript">JavaScript</SelectItem>
                        <SelectItem value="python">Python</SelectItem>
                        <SelectItem value="json">JSON</SelectItem>
                        <SelectItem value="html">HTML</SelectItem>
                        <SelectItem value="css">CSS</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-xs text-slate-400">Temperature: {temperature[0]}</Label>
                    <Slider
                      value={temperature}
                      onValueChange={setTemperature}
                      max={1}
                      min={0}
                      step={0.1}
                      className="w-full"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-xs text-slate-400">Max Tokens: {maxTokens[0]}</Label>
                    <Slider
                      value={maxTokens}
                      onValueChange={setMaxTokens}
                      max={4000}
                      min={100}
                      step={100}
                      className="w-full"
                    />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-900/50 border-slate-700/50">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm text-slate-300">Statistics</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-xs">
                  <div className="flex justify-between text-slate-400">
                    <span>Lines:</span>
                    <span>{code.split('\n').length}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Characters:</span>
                    <span>{code.length}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Words:</span>
                    <span>{code.split(/\s+/).filter(w => w.length > 0).length}</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 flex flex-col overflow-hidden">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
              <TabsList className="bg-slate-900 border-b border-slate-800 rounded-none p-2">
                <TabsTrigger value="code" className="data-[state=active]:bg-slate-700">
                  Code Editor
                </TabsTrigger>
                <TabsTrigger value="output" className="data-[state=active]:bg-slate-700">
                  Output
                </TabsTrigger>
                <TabsTrigger value="preview" className="data-[state=active]:bg-slate-700">
                  Preview
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="code" className="flex-1 m-0 overflow-hidden">
                <div className="h-full overflow-auto">
                  <textarea
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="w-full h-full bg-slate-900 text-white font-mono text-sm p-4 border-none outline-none resize-none"
                    placeholder="Enter your code here..."
                    style={{ minHeight: '100%' }}
                  />
                </div>
              </TabsContent>
              
              <TabsContent value="output" className="flex-1 m-0 overflow-hidden">
                <div className="h-full overflow-auto bg-slate-900 p-4">
                  {isExecuting ? (
                    <div className="flex items-center gap-3 text-yellow-400">
                      <div className="w-4 h-4 border-2 border-yellow-400/30 border-t-yellow-400 rounded-full animate-spin" />
                      Executing code...
                    </div>
                  ) : (
                    <pre className="text-slate-300 text-sm whitespace-pre-wrap">
                      {output || 'No output yet. Click "Execute" to run your code.'}
                    </pre>
                  )}
                </div>
              </TabsContent>
              
              <TabsContent value="preview" className="flex-1 m-0 overflow-hidden">
                <div className="h-full overflow-auto">
                  <SyntaxHighlighter
                    style={vscDarkPlus as any}
                    language={language}
                    PreTag="div"
                    customStyle={{
                      margin: 0,
                      background: 'rgb(15 23 42)',
                      padding: '1rem',
                      height: '100%',
                      overflow: 'auto'
                    }}
                  >
                    {code || '// Your code preview will appear here'}
                  </SyntaxHighlighter>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DeveloperCanvas;
