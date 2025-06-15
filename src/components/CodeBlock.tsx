
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Copy, FileCode } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/sonner';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';

interface CodeBlockProps {
  content: string;
}

interface ParsedFile {
  path: string;
  language: string;
  code: string;
}

const parseContent = (content: string): ParsedFile[] => {
    // Splits the content by 'FILE: ' to handle multiple files.
    const filesRaw = content.split('FILE: ').filter(f => f.trim());

    if (filesRaw.length === 0 || (filesRaw.length === 1 && filesRaw[0] === content)) {
        // Fallback for content that doesn't follow the FILE: format.
        const singleBlockMatch = /```(\w*)?\n([\s\S]*?)\n```/s.exec(content);
        if (singleBlockMatch) {
            return [{
                path: 'Code',
                language: singleBlockMatch[1] || 'text',
                code: singleBlockMatch[2].trim()
            }];
        }
        // If no code block is found, return the raw content as a text response.
        return [{ path: 'Response', language: 'text', code: content.trim() }];
    }

    return filesRaw.map((fileRaw) => {
        const firstNewline = fileRaw.indexOf('\n');
        const path = fileRaw.substring(0, firstNewline).trim();
        const codeBlock = fileRaw.substring(firstNewline).trim();

        // Extracts code from the markdown code block.
        const match = /```(\w*)?\n([\s\S]*?)\n```/s.exec(codeBlock);
        if (match) {
            return {
                path,
                language: match[1] || 'text',
                code: match[2].trim()
            };
        }
        
        // Fallback for when the regex doesn't match.
        return {
            path,
            language: 'text',
            code: codeBlock.replace(/```/g, '')
        }
    });
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

  if (!files || files.length === 0 || (files.length === 1 && !files[0].code)) {
    return <div className="prose prose-invert max-w-none break-words"><p>{content}</p></div>;
  }

  if (files.length === 1) {
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
