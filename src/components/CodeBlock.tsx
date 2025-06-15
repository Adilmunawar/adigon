
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Copy, FileCode, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/sonner';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';

interface CodeBlockProps {
  content: string;
}

export interface ParsedFile {
  path: string;
  language: string;
  code: string;
}

const SystemMessageDisplay = ({ message }: { message: string }) => {
    return (
        <div className="rounded-xl border border-destructive/50 bg-destructive/10 p-4 text-destructive-foreground/80">
            <div className="flex items-start gap-4">
                <AlertTriangle className="h-5 w-5 flex-shrink-0 text-destructive" />
                <div className="flex-1 text-sm">
                   <p className="leading-relaxed whitespace-pre-wrap">{message}</p>
                </div>
            </div>
        </div>
    );
};

export const parseContent = (content: string): ParsedFile[] => {
    // A single response is a system message if it does NOT contain 'FILE: ' and does NOT contain a markdown code block.
    const isSystemMessage = !content.includes('FILE: ') && !/```(\w*)?\n([\s\S]*?)\n```/s.test(content);

    if (isSystemMessage && content.trim()) {
        return [{ path: 'SYSTEM_MESSAGE', language: 'text', code: content.trim() }];
    }

    if (content.includes('FILE: ')) {
        const filesRaw = content.split('FILE: ').filter(f => f.trim());
        if (filesRaw.length > 0) {
            return filesRaw.map((fileRaw) => {
                const firstNewline = fileRaw.indexOf('\n');
                const path = firstNewline === -1 ? fileRaw.trim() : fileRaw.substring(0, firstNewline).trim();
                const codeBlock = firstNewline === -1 ? '' : fileRaw.substring(firstNewline).trim();

                const match = /```(\w*)?\n([\s\S]*?)\n```/s.exec(codeBlock);
                if (match) {
                    return {
                        path,
                        language: match[1] || 'text',
                        code: match[2].trim()
                    };
                }
                
                return {
                    path,
                    language: 'text',
                    code: codeBlock.replace(/```/g, '')
                }
            });
        }
    }
    
    // This case handles a single markdown block without a FILE: prefix
    const singleBlockMatch = /```(\w*)?\n([\s\S]*?)\n```/s.exec(content);
    if (singleBlockMatch) {
        return [{
            path: 'Code',
            language: singleBlockMatch[1] || 'text',
            code: singleBlockMatch[2].trim()
        }];
    }

    return [];
};

const CodeDisplay = ({ file }: { file: ParsedFile }) => {
    const handleCopy = (code: string) => {
        navigator.clipboard.writeText(code);
        toast.success("Code copied to clipboard!");
    };
    
    return (
        <div className="relative group rounded-xl border bg-secondary/30 backdrop-blur-sm shadow-lg overflow-hidden transition-all duration-300 hover:border-primary/50 hover:shadow-primary/20">
            <div className="flex justify-between items-center px-4 py-2 bg-secondary/50 border-b text-muted-foreground">
                <div className="flex items-center gap-2">
                    <FileCode size={16} />
                    <p className="text-sm font-mono">{file.path}</p>
                </div>
                <Button variant="ghost" size="icon" onClick={() => handleCopy(file.code)} className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-primary/20 transition-all duration-300 opacity-60 group-hover:opacity-100">
                    <Copy size={16} />
                </Button>
            </div>
            <SyntaxHighlighter
                style={vscDarkPlus as any}
                language={file.language}
                PreTag="div"
                customStyle={{ margin: 0, background: 'transparent', padding: '1rem', overflow: 'auto' }}
                codeTagProps={{style: {fontFamily: "var(--font-mono)"}}}
            >
                {file.code}
            </SyntaxHighlighter>
        </div>
    );
};


const CodeBlock = ({ content }: CodeBlockProps) => {
  const files = parseContent(content);

  if (!files || files.length === 0) {
    return null;
  }

  if (files.length === 1) {
    if (files[0].path === 'SYSTEM_MESSAGE') {
        return <SystemMessageDisplay message={files[0].code} />;
    }
    return <CodeDisplay file={files[0]} />;
  }

  return (
    <Tabs defaultValue={files[0].path} className="w-full">
      <ScrollArea className="w-full whitespace-nowrap border-b">
        <TabsList className="-mb-px">
          {files.map((file) => (
            <TabsTrigger key={file.path} value={file.path}>{file.path}</TabsTrigger>
          ))}
        </TabsList>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
      {files.map((file) => (
        <TabsContent key={file.path} value={file.path} className="mt-4">
          <CodeDisplay file={file} />
        </TabsContent>
      ))}
    </Tabs>
  );
};

export default CodeBlock;
