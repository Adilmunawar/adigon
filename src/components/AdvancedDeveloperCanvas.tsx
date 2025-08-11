
import React, { useState, useRef, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Code2, 
  Play, 
  Download, 
  Copy, 
  FileCode, 
  Folder, 
  AlertTriangle, 
  CheckCircle,
  Loader2,
  Terminal,
  Bug,
  Eye,
  Settings,
  Zap
} from 'lucide-react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { toast } from '@/components/ui/sonner';
import { advancedCodeGenerator, GeneratedCode } from '@/services/advancedCodeGenerator';

interface AdvancedDeveloperCanvasProps {
  isOpen: boolean;
  onClose: () => void;
}

const AdvancedDeveloperCanvas = ({ isOpen, onClose }: AdvancedDeveloperCanvasProps) => {
  const [projectInput, setProjectInput] = useState('');
  const [generatedFiles, setGeneratedFiles] = useState<GeneratedCode[]>([]);
  const [activeFile, setActiveFile] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [previewContent, setPreviewContent] = useState('');
  const [debugResults, setDebugResults] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState('files');
  const [generationProgress, setGenerationProgress] = useState(0);
  
  const previewRef = useRef<HTMLIFrameElement>(null);

  const handleGenerateProject = async () => {
    if (!projectInput.trim()) {
      toast.error('Please enter a project description');
      return;
    }

    setIsGenerating(true);
    setGenerationProgress(0);
    setGeneratedFiles([]);
    setActiveFile(null);
    
    try {
      // Progress simulation
      const progressInterval = setInterval(() => {
        setGenerationProgress(prev => Math.min(prev + 10, 90));
      }, 500);

      const files = await advancedCodeGenerator.generateLargeCodebase(
        projectInput,
        'Create a modern, responsive application with TypeScript, React, and Tailwind CSS'
      );
      
      clearInterval(progressInterval);
      setGenerationProgress(100);
      
      setGeneratedFiles(files);
      if (files.length > 0) {
        setActiveFile(files[0].fileName);
      }
      
      toast.success(`Generated ${files.length} files successfully!`);
    } catch (error) {
      console.error('Generation failed:', error);
      toast.error('Failed to generate project');
    } finally {
      setIsGenerating(false);
      setTimeout(() => setGenerationProgress(0), 1000);
    }
  };

  const handleFileSelect = (fileName: string) => {
    setActiveFile(fileName);
  };

  const handleCopyCode = () => {
    const file = generatedFiles.find(f => f.fileName === activeFile);
    if (file) {
      navigator.clipboard.writeText(file.content);
      toast.success('Code copied to clipboard!');
    }
  };

  const handleDownloadProject = () => {
    if (generatedFiles.length === 0) {
      toast.error('No files to download');
      return;
    }

    // Create and download zip file (simplified version)
    const blob = new Blob([JSON.stringify(generatedFiles, null, 2)], { 
      type: 'application/json' 
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'generated-project.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.success('Project downloaded!');
  };

  const handleLivePreview = () => {
    const file = generatedFiles.find(f => f.fileName === activeFile);
    if (file && file.language === 'typescript') {
      // Simple preview generation
      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Live Preview</title>
          <script src="https://unpkg.com/react@18/umd/react.development.js"></script>
          <script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
          <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
          <script src="https://cdn.tailwindcss.com"></script>
          <style>body { margin: 0; font-family: system-ui; }</style>
        </head>
        <body>
          <div id="root"></div>
          <script type="text/babel">
            ${file.content}
          </script>
        </body>
        </html>
      `;
      setPreviewContent(htmlContent);
      setActiveTab('preview');
    }
  };

  const handleDebugCode = async () => {
    const file = generatedFiles.find(f => f.fileName === activeFile);
    if (file) {
      setDebugResults(file.errors);
      setActiveTab('debug');
    }
  };

  const activeFileData = generatedFiles.find(f => f.fileName === activeFile);
  const totalErrors = generatedFiles.reduce((acc, file) => acc + file.errors.length, 0);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-7xl h-[95vh] bg-slate-950 border-slate-800 text-white flex flex-col">
        <DialogHeader className="border-b border-slate-800 pb-4 flex-shrink-0">
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-3 text-xl">
              <div className="p-2 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-xl border border-blue-500/30">
                <Code2 className="w-6 h-6 text-blue-400" />
              </div>
              Advanced Developer Canvas
              <Badge variant="outline" className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 border-blue-500/30 text-blue-300">
                <Zap className="w-3 h-3 mr-1" />
                AI Powered
              </Badge>
            </DialogTitle>
            
            <div className="flex items-center gap-2">
              <Button
                onClick={handleDownloadProject}
                size="sm"
                variant="outline"
                className="border-slate-700 hover:bg-slate-800"
                disabled={generatedFiles.length === 0}
              >
                <Download className="w-4 h-4 mr-2" />
                Download
              </Button>
            </div>
          </div>
        </DialogHeader>

        {/* Project Generation Input */}
        <div className="p-4 border-b border-slate-800 flex-shrink-0">
          <div className="flex gap-3">
            <Input
              value={projectInput}
              onChange={(e) => setProjectInput(e.target.value)}
              placeholder="Describe your project (e.g., 'Instagram clone with authentication')"
              className="flex-1 bg-slate-800 border-slate-700 text-white"
              disabled={isGenerating}
            />
            <Button
              onClick={handleGenerateProject}
              disabled={isGenerating || !projectInput.trim()}
              className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 min-w-32"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 mr-2" />
                  Generate
                </>
              )}
            </Button>
          </div>
          
          {isGenerating && (
            <div className="mt-3">
              <div className="flex justify-between text-sm text-slate-400 mb-2">
                <span>Generating project files...</span>
                <span>{generationProgress}%</span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${generationProgress}%` }}
                />
              </div>
            </div>
          )}
        </div>

        <div className="flex-1 flex overflow-hidden">
          {/* File Explorer Sidebar */}
          <div className="w-80 border-r border-slate-800 flex flex-col bg-slate-900/50">
            <div className="p-4 border-b border-slate-800">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-slate-300">Project Files</h3>
                <Badge variant="secondary" className="text-xs">
                  {generatedFiles.length} files
                </Badge>
              </div>
              {totalErrors > 0 && (
                <div className="flex items-center gap-2 mt-2 text-xs text-yellow-400">
                  <AlertTriangle className="w-3 h-3" />
                  {totalErrors} issues detected
                </div>
              )}
            </div>
            
            <ScrollArea className="flex-1">
              <div className="p-2">
                {generatedFiles.length === 0 ? (
                  <div className="text-center text-slate-500 py-8">
                    <Folder className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No files generated yet</p>
                  </div>
                ) : (
                  <div className="space-y-1">
                    {generatedFiles.map((file) => (
                      <button
                        key={file.fileName}
                        onClick={() => handleFileSelect(file.fileName)}
                        className={`w-full text-left p-3 rounded-lg text-sm transition-all flex items-center gap-2 ${
                          activeFile === file.fileName
                            ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                            : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-300'
                        }`}
                      >
                        <FileCode className="w-4 h-4 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="truncate font-mono">{file.fileName}</div>
                          <div className="text-xs text-slate-500">{file.language}</div>
                        </div>
                        {file.errors.length > 0 && (
                          <AlertTriangle className="w-3 h-3 text-yellow-400 flex-shrink-0" />
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Main Content Area */}
          <div className="flex-1 flex flex-col overflow-hidden">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
              <div className="border-b border-slate-800 p-2 flex items-center justify-between">
                <TabsList className="bg-slate-900">
                  <TabsTrigger value="files" className="data-[state=active]:bg-slate-700">
                    <FileCode className="w-4 h-4 mr-2" />
                    Code Editor
                  </TabsTrigger>
                  <TabsTrigger value="preview" className="data-[state=active]:bg-slate-700">
                    <Eye className="w-4 h-4 mr-2" />
                    Live Preview
                  </TabsTrigger>
                  <TabsTrigger value="debug" className="data-[state=active]:bg-slate-700">
                    <Bug className="w-4 h-4 mr-2" />
                    Debug Console
                  </TabsTrigger>
                </TabsList>
                
                {activeFileData && (
                  <div className="flex items-center gap-2">
                    <Button
                      onClick={handleLivePreview}
                      size="sm"
                      variant="outline"
                      className="border-slate-700 hover:bg-slate-800"
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      Preview
                    </Button>
                    <Button
                      onClick={handleDebugCode}
                      size="sm"
                      variant="outline"
                      className="border-slate-700 hover:bg-slate-800"
                    >
                      <Bug className="w-4 h-4 mr-2" />
                      Debug
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
                  </div>
                )}
              </div>
              
              <TabsContent value="files" className="flex-1 m-0 overflow-hidden">
                {activeFileData ? (
                  <div className="h-full overflow-auto">
                    <SyntaxHighlighter
                      style={vscDarkPlus as any}
                      language={activeFileData.language}
                      PreTag="div"
                      showLineNumbers
                      customStyle={{
                        margin: 0,
                        background: 'rgb(15 23 42)',
                        padding: '1rem',
                        height: '100%',
                        overflow: 'auto'
                      }}
                    >
                      {activeFileData.content}
                    </SyntaxHighlighter>
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-full text-slate-500">
                    <div className="text-center">
                      <Code2 className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>Select a file to view its content</p>
                    </div>
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="preview" className="flex-1 m-0 overflow-hidden">
                <div className="h-full bg-white">
                  {previewContent ? (
                    <iframe
                      ref={previewRef}
                      srcDoc={previewContent}
                      className="w-full h-full border-0"
                      title="Live Preview"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full text-slate-500 bg-slate-900">
                      <div className="text-center">
                        <Eye className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p>Click "Preview" to see live preview</p>
                      </div>
                    </div>
                  )}
                </div>
              </TabsContent>
              
              <TabsContent value="debug" className="flex-1 m-0 overflow-hidden">
                <div className="h-full bg-slate-900 p-4 overflow-auto">
                  <div className="flex items-center gap-2 mb-4">
                    <Terminal className="w-5 h-5 text-green-400" />
                    <span className="text-green-400 font-mono">Debug Console</span>
                  </div>
                  
                  {debugResults.length === 0 ? (
                    <div className="text-slate-500">
                      <CheckCircle className="w-5 h-5 inline mr-2" />
                      No issues detected. Code looks good!
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {debugResults.map((error, index) => (
                        <div key={index} className="flex items-start gap-2 p-3 bg-yellow-900/20 border border-yellow-500/30 rounded-lg">
                          <AlertTriangle className="w-4 h-4 text-yellow-400 mt-0.5 flex-shrink-0" />
                          <span className="text-yellow-200 text-sm">{error}</span>
                        </div>
                      ))}
                    </div>
                  )}
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
