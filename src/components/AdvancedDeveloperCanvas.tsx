
import React, { useState, useRef, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
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
  Zap,
  Save,
  RefreshCw,
  FileText,
  Trash2
} from 'lucide-react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { toast } from '@/components/ui/sonner';
import { advancedCodeGenerator, GeneratedCode } from '@/services/advancedCodeGenerator';
import { geminiService } from '@/services/geminiService';

interface AdvancedDeveloperCanvasProps {
  isOpen: boolean;
  onClose: () => void;
  initialCode?: string;
  initialFiles?: GeneratedCode[];
}

interface CanvasProject {
  id: string;
  name: string;
  files: GeneratedCode[];
  created: string;
  modified: string;
}

const AdvancedDeveloperCanvas = ({ 
  isOpen, 
  onClose, 
  initialCode = '',
  initialFiles = []
}: AdvancedDeveloperCanvasProps) => {
  const [projectInput, setProjectInput] = useState('');
  const [generatedFiles, setGeneratedFiles] = useState<GeneratedCode[]>(initialFiles);
  const [activeFile, setActiveFile] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [previewContent, setPreviewContent] = useState('');
  const [debugResults, setDebugResults] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState('files');
  const [generationProgress, setGenerationProgress] = useState(0);
  const [editingCode, setEditingCode] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [savedProjects, setSavedProjects] = useState<CanvasProject[]>([]);
  const [currentProjectName, setCurrentProjectName] = useState('');
  const [autoErrorDetection, setAutoErrorDetection] = useState(true);
  
  const previewRef = useRef<HTMLIFrameElement>(null);

  // Load saved projects on mount
  useEffect(() => {
    const saved = localStorage.getItem('advancedCanvas_projects');
    if (saved) {
      try {
        setSavedProjects(JSON.parse(saved));
      } catch (error) {
        console.error('Failed to load saved projects:', error);
      }
    }
    
    // If initial files provided, set them up
    if (initialFiles.length > 0) {
      setGeneratedFiles(initialFiles);
      setActiveFile(initialFiles[0].fileName);
      setEditingCode(initialFiles[0].content);
    } else if (initialCode) {
      const file: GeneratedCode = {
        fileName: 'main.tsx',
        content: initialCode,
        language: 'typescript',
        errors: []
      };
      setGeneratedFiles([file]);
      setActiveFile('main.tsx');
      setEditingCode(initialCode);
    }
  }, [initialCode, initialFiles]);

  // Auto-save current project
  useEffect(() => {
    if (generatedFiles.length > 0 && currentProjectName) {
      const project: CanvasProject = {
        id: Date.now().toString(),
        name: currentProjectName,
        files: generatedFiles,
        created: new Date().toISOString(),
        modified: new Date().toISOString()
      };
      
      const updatedProjects = savedProjects.filter(p => p.name !== currentProjectName);
      updatedProjects.push(project);
      setSavedProjects(updatedProjects);
      localStorage.setItem('advancedCanvas_projects', JSON.stringify(updatedProjects));
    }
  }, [generatedFiles, currentProjectName, savedProjects]);

  // Auto error detection
  useEffect(() => {
    if (autoErrorDetection && editingCode && activeFile) {
      const detectErrors = async () => {
        try {
          const errorCheckPrompt = `Analyze this ${activeFile} code for errors, bugs, and improvements:

${editingCode}

Return a JSON array of issues found (or empty array if no issues):
["issue1", "issue2"]`;

          const response = await geminiService.generateResponse(
            errorCheckPrompt,
            "You are a code analyzer. Return only a JSON array of specific issues found in the code."
          );
          
          const issues = JSON.parse(response);
          if (Array.isArray(issues)) {
            setDebugResults(issues);
          }
        } catch (error) {
          console.log('Auto error detection failed:', error);
        }
      };

      const debounce = setTimeout(detectErrors, 2000);
      return () => clearTimeout(debounce);
    }
  }, [editingCode, activeFile, autoErrorDetection]);

  const handleGenerateProject = async () => {
    if (!projectInput.trim()) {
      toast.error('Please enter a project description');
      return;
    }

    setIsGenerating(true);
    setGenerationProgress(0);
    setGeneratedFiles([]);
    setActiveFile(null);
    setCurrentProjectName(projectInput.slice(0, 30));
    
    try {
      const progressInterval = setInterval(() => {
        setGenerationProgress(prev => Math.min(prev + 10, 90));
      }, 500);

      const files = await advancedCodeGenerator.generateLargeCodebase(
        projectInput,
        'Create a complete, production-ready application with comprehensive features, error handling, and modern UI/UX'
      );
      
      clearInterval(progressInterval);
      setGenerationProgress(100);
      
      setGeneratedFiles(files);
      if (files.length > 0) {
        setActiveFile(files[0].fileName);
        setEditingCode(files[0].content);
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
    // Save current editing if necessary
    if (isEditing && activeFile) {
      saveCurrentFile();
    }
    
    setActiveFile(fileName);
    const file = generatedFiles.find(f => f.fileName === fileName);
    if (file) {
      setEditingCode(file.content);
    }
    setIsEditing(false);
  };

  const saveCurrentFile = () => {
    if (activeFile && editingCode) {
      setGeneratedFiles(prev => prev.map(file => 
        file.fileName === activeFile 
          ? { ...file, content: editingCode }
          : file
      ));
      setIsEditing(false);
      toast.success('File saved!');
    }
  };

  const handleCopyCode = () => {
    const codeToText = isEditing ? editingCode : generatedFiles.find(f => f.fileName === activeFile)?.content;
    if (codeToText) {
      navigator.clipboard.writeText(codeToText);
      toast.success('Code copied to clipboard!');
    }
  };

  const handleDownloadProject = () => {
    if (generatedFiles.length === 0) {
      toast.error('No files to download');
      return;
    }

    const projectData = {
      name: currentProjectName || 'Generated Project',
      files: generatedFiles,
      created: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(projectData, null, 2)], { 
      type: 'application/json' 
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${currentProjectName || 'project'}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.success('Project downloaded!');
  };

  const handleLivePreview = () => {
    const file = generatedFiles.find(f => f.fileName === activeFile);
    const codeToPreview = isEditing ? editingCode : file?.content;
    
    if (codeToPreview) {
      let htmlContent = '';
      
      if (file?.language === 'typescript' || file?.language === 'javascript') {
        htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Live Preview</title>
  <script src="https://unpkg.com/react@18/umd/react.development.js"></script>
  <script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
  <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    body { margin: 0; font-family: system-ui, -apple-system, sans-serif; }
    * { box-sizing: border-box; }
  </style>
</head>
<body>
  <div id="root"></div>
  <script type="text/babel">
    ${codeToPreview}
    
    // Auto-render if it's a React component
    if (typeof App !== 'undefined') {
      ReactDOM.render(<App />, document.getElementById('root'));
    } else if (typeof Component !== 'undefined') {
      ReactDOM.render(<Component />, document.getElementById('root'));
    }
  </script>
</body>
</html>`;
      } else if (file?.language === 'html') {
        htmlContent = codeToPreview;
      } else {
        htmlContent = `
<!DOCTYPE html>
<html>
<head><title>Code Preview</title></head>
<body>
  <pre style="padding: 20px; background: #f5f5f5; font-family: monospace;">${codeToPreview}</pre>
</body>
</html>`;
      }
      
      setPreviewContent(htmlContent);
      setActiveTab('preview');
      toast.success('Preview generated!');
    }
  };

  const handleDebugCode = async () => {
    const file = generatedFiles.find(f => f.fileName === activeFile);
    const codeToDebug = isEditing ? editingCode : file?.content;
    
    if (codeToDebug) {
      try {
        const debugPrompt = `Thoroughly analyze this code for bugs, errors, performance issues, and improvements:

File: ${activeFile}
Code:
${codeToDebug}

Return detailed analysis as a JSON array of objects with "type", "message", and "line" properties:
[{"type": "error", "message": "Description", "line": 0}]`;

        const response = await geminiService.generateResponse(
          debugPrompt,
          "You are an expert code debugger. Analyze code thoroughly and return detailed JSON analysis."
        );
        
        const analysis = JSON.parse(response);
        const issues = Array.isArray(analysis) 
          ? analysis.map(issue => `[${issue.type?.toUpperCase() || 'ISSUE'}] Line ${issue.line || '?'}: ${issue.message || issue}`)
          : [response];
          
        setDebugResults(issues);
        setActiveTab('debug');
        toast.success('Debug analysis complete!');
      } catch (error) {
        console.error('Debug failed:', error);
        setDebugResults([`Debug analysis failed: ${error}`]);
        setActiveTab('debug');
      }
    }
  };

  const loadProject = (project: CanvasProject) => {
    setGeneratedFiles(project.files);
    setCurrentProjectName(project.name);
    if (project.files.length > 0) {
      setActiveFile(project.files[0].fileName);
      setEditingCode(project.files[0].content);
    }
    toast.success(`Loaded project: ${project.name}`);
  };

  const deleteProject = (projectId: string) => {
    setSavedProjects(prev => {
      const updated = prev.filter(p => p.id !== projectId);
      localStorage.setItem('advancedCanvas_projects', JSON.stringify(updated));
      return updated;
    });
    toast.success('Project deleted');
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
              {currentProjectName && (
                <Badge variant="secondary" className="text-xs">
                  {currentProjectName}
                </Badge>
              )}
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
              placeholder="Describe your project (e.g., 'E-commerce platform with React and TypeScript')"
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
                <span>Generating advanced project files...</span>
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
          {/* File Explorer & Saved Projects Sidebar */}
          <div className="w-80 border-r border-slate-800 flex flex-col bg-slate-900/50">
            <Tabs defaultValue="files" className="flex-1 flex flex-col">
              <TabsList className="bg-slate-900 m-2">
                <TabsTrigger value="files" className="text-xs">Current Files</TabsTrigger>
                <TabsTrigger value="saved" className="text-xs">Saved Projects</TabsTrigger>
              </TabsList>
              
              <TabsContent value="files" className="flex-1 m-0 overflow-hidden">
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
                            className={cn(
                              "w-full text-left p-3 rounded-lg text-sm transition-all flex items-center gap-2",
                              activeFile === file.fileName
                                ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                                : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-300'
                            )}
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
              </TabsContent>
              
              <TabsContent value="saved" className="flex-1 m-0 overflow-hidden">
                <div className="p-4 border-b border-slate-800">
                  <h3 className="text-sm font-medium text-slate-300">Saved Projects</h3>
                </div>
                
                <ScrollArea className="flex-1">
                  <div className="p-2">
                    {savedProjects.length === 0 ? (
                      <div className="text-center text-slate-500 py-8">
                        <FileText className="w-8 h-8 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">No saved projects</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {savedProjects.map((project) => (
                          <div key={project.id} className="p-3 bg-slate-800/50 rounded-lg">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="text-sm font-medium text-slate-200 truncate">
                                {project.name}
                              </h4>
                              <Button
                                size="icon"
                                variant="ghost"
                                onClick={() => deleteProject(project.id)}
                                className="h-6 w-6 text-slate-500 hover:text-red-400"
                              >
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            </div>
                            <div className="text-xs text-slate-500 mb-2">
                              {project.files.length} files • {new Date(project.modified).toLocaleDateString()}
                            </div>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => loadProject(project)}
                              className="w-full text-xs border-slate-600 hover:bg-slate-700"
                            >
                              Load Project
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </TabsContent>
            </Tabs>
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
                    {isEditing && (
                      <Button
                        onClick={saveCurrentFile}
                        size="sm"
                        variant="outline"
                        className="border-slate-700 hover:bg-slate-800"
                      >
                        <Save className="w-4 h-4 mr-2" />
                        Save
                      </Button>
                    )}
                    <Button
                      onClick={() => setIsEditing(!isEditing)}
                      size="sm"
                      variant="outline"
                      className={cn(
                        "border-slate-700 hover:bg-slate-800",
                        isEditing && "bg-blue-500/20 border-blue-500/50"
                      )}
                    >
                      <Code2 className="w-4 h-4 mr-2" />
                      {isEditing ? 'View Mode' : 'Edit Mode'}
                    </Button>
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
                  isEditing ? (
                    <div className="h-full flex flex-col">
                      <div className="flex-1 overflow-hidden">
                        <Textarea
                          value={editingCode}
                          onChange={(e) => setEditingCode(e.target.value)}
                          className="w-full h-full bg-slate-900 text-white font-mono text-sm border-0 focus-visible:ring-0 resize-none rounded-none"
                          placeholder="Enter your code here..."
                        />
                      </div>
                    </div>
                  ) : (
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
                  )
                ) : (
                  <div className="flex items-center justify-center h-full text-slate-500">
                    <div className="text-center">
                      <Code2 className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>Select a file to view or edit its content</p>
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
                      sandbox="allow-scripts allow-same-origin"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full text-slate-500 bg-slate-900">
                      <div className="text-center">
                        <Eye className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p>Click "Preview" to see live preview of your code</p>
                      </div>
                    </div>
                  )}
                </div>
              </TabsContent>
              
              <TabsContent value="debug" className="flex-1 m-0 overflow-hidden">
                <div className="h-full bg-slate-900 p-4 overflow-auto">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Terminal className="w-5 h-5 text-green-400" />
                      <span className="text-green-400 font-mono">Debug Console</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <label className="text-xs text-slate-400">Auto-detect errors:</label>
                      <input
                        type="checkbox"
                        checked={autoErrorDetection}
                        onChange={(e) => setAutoErrorDetection(e.target.checked)}
                        className="w-4 h-4"
                      />
                    </div>
                  </div>
                  
                  {debugResults.length === 0 ? (
                    <div className="text-slate-500">
                      <CheckCircle className="w-5 h-5 inline mr-2" />
                      No issues detected. Code looks good!
                    </div>
                  ) : (
                    <div className="space-y-3">
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
