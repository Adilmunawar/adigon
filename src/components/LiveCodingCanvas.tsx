
import React, { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Code2, Download, Copy, X, Play, Pause } from 'lucide-react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { useStreamingResponse } from '@/hooks/useStreamingResponse';
import { toast } from '@/components/ui/sonner';

interface LiveCodingCanvasProps {
  isOpen: boolean;
  onClose: () => void;
  codeContent: string;
  projectTitle: string;
}

const LiveCodingCanvas = ({ isOpen, onClose, codeContent, projectTitle }: LiveCodingCanvasProps) => {
  const [currentFile, setCurrentFile] = useState(0);
  const [files, setFiles] = useState<Array<{ name: string; content: string; language: string }>>([]);
  const canvasRef = useRef<HTMLDivElement>(null);

  const { streamingText, isStreaming, startStreaming, stopStreaming } = useStreamingResponse({
    onComplete: (text) => {
      // When streaming completes, parse and update files
      parseAndSetFiles(text);
    }
  });

  const parseAndSetFiles = (content: string) => {
    if (content.includes('FILE: ')) {
      const fileMatches = content.split('FILE: ').filter(f => f.trim());
      const parsedFiles = fileMatches.map((fileContent, index) => {
        const lines = fileContent.split('\n');
        const fileName = lines[0].trim();
        const codeMatch = fileContent.match(/```(\w+)?\n([\s\S]*?)\n```/);
        
        if (codeMatch) {
          return {
            name: fileName || `File ${index + 1}`,
            content: codeMatch[2] || '',
            language: codeMatch[1] || 'typescript'
          };
        }
        
        return {
          name: fileName || `File ${index + 1}`,
          content: lines.slice(1).join('\n'),
          language: 'typescript'
        };
      });
      setFiles(parsedFiles);
    } else {
      // Single file or plain text
      setFiles([{
        name: projectTitle || 'Generated Code',
        content: content,
        language: 'typescript'
      }]);
    }
  };

  useEffect(() => {
    if (isOpen && codeContent) {
      setFiles([]);
      setCurrentFile(0);
      startStreaming(codeContent, 20); // Faster streaming for code
    }
  }, [isOpen, codeContent, startStreaming]);

  const handleCopyCode = () => {
    if (files[currentFile]) {
      navigator.clipboard.writeText(files[currentFile].content);
      toast.success('Code copied to clipboard!');
    }
  };

  const handleDownload = () => {
    if (files[currentFile]) {
      const blob = new Blob([files[currentFile].content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = files[currentFile].name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success('File downloaded!');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl h-[90vh] bg-slate-950 border-slate-800 text-white">
        <DialogHeader className="border-b border-slate-800 pb-4">
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-3 text-xl">
              <div className="p-2 bg-blue-500/20 rounded-lg">
                <Code2 className="w-5 h-5 text-blue-400" />
              </div>
              Live Code Generation
              {isStreaming && (
                <div className="flex items-center gap-2 text-sm text-green-400">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                  Generating...
                </div>
              )}
            </DialogTitle>
            <div className="flex items-center gap-2">
              {isStreaming && (
                <Button
                  onClick={stopStreaming}
                  size="sm"
                  variant="outline"
                  className="border-slate-700 hover:bg-slate-800"
                >
                  <Pause className="w-4 h-4 mr-2" />
                  Pause
                </Button>
              )}
              <Button
                onClick={handleCopyCode}
                size="sm"
                variant="outline"
                className="border-slate-700 hover:bg-slate-800"
                disabled={!files[currentFile]}
              >
                <Copy className="w-4 h-4 mr-2" />
                Copy
              </Button>
              <Button
                onClick={handleDownload}
                size="sm"
                variant="outline"
                className="border-slate-700 hover:bg-slate-800"
                disabled={!files[currentFile]}
              >
                <Download className="w-4 h-4 mr-2" />
                Download
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 flex overflow-hidden">
          {/* File Tabs */}
          {files.length > 1 && (
            <div className="w-64 border-r border-slate-800 p-4">
              <h3 className="text-sm font-medium text-slate-300 mb-3">Files</h3>
              <div className="space-y-2">
                {files.map((file, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentFile(index)}
                    className={`w-full text-left p-3 rounded-lg text-sm transition-all ${
                      currentFile === index
                        ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                        : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-300'
                    }`}
                  >
                    <div className="font-mono truncate">{file.name}</div>
                    <div className="text-xs text-slate-500 mt-1">{file.language}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Code Display */}
          <div className="flex-1 overflow-hidden">
            <div ref={canvasRef} className="h-full overflow-auto">
              {isStreaming ? (
                <div className="p-6">
                  <div className="bg-slate-900/50 rounded-lg p-4 font-mono text-sm">
                    <div className="text-green-400 mb-2">// Generating code...</div>
                    <pre className="whitespace-pre-wrap text-slate-300">
                      {streamingText}
                      <span className="animate-pulse bg-blue-400 w-2 h-5 inline-block ml-1" />
                    </pre>
                  </div>
                </div>
              ) : files[currentFile] ? (
                <SyntaxHighlighter
                  style={vscDarkPlus as any}
                  language={files[currentFile].language}
                  PreTag="div"
                  customStyle={{
                    margin: 0,
                    background: 'transparent',
                    padding: '1.5rem',
                    height: '100%',
                    overflow: 'auto'
                  }}
                  codeTagProps={{
                    style: { fontFamily: "var(--font-mono)" }
                  }}
                >
                  {files[currentFile].content}
                </SyntaxHighlighter>
              ) : (
                <div className="flex items-center justify-center h-full text-slate-500">
                  <div className="text-center">
                    <Code2 className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No code generated yet</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LiveCodingCanvas;
