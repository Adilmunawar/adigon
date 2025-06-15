
import { cn } from "@/lib/utils";
import { Bot, User, Copy } from "lucide-react";
import { toast } from "@/components/ui/sonner";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

export interface Message {
  role: "user" | "model";
  parts: { text: string }[];
  imageUrl?: string;
}

interface ChatMessageProps {
  message: Message;
}

const ChatMessage = ({ message }: ChatMessageProps) => {
  const isUser = message.role === "user";

  const handleCopy = () => {
    const messageText = message.parts.map((part) => part.text).join("\n");
    if (messageText) {
      navigator.clipboard.writeText(messageText);
      toast.success("Copied to clipboard!");
    }
  };

  return (
    <div
      className={cn(
        "group flex animate-fade-in-up items-start gap-4 py-4",
        isUser && "justify-end"
      )}
    >
      {!isUser && (
        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary ring-2 ring-primary/40">
          <Bot size={24} />
        </div>
      )}
      <div
        className={cn(
          "max-w-xl rounded-2xl px-5 py-3 text-base shadow-lg transition-all duration-300 group-hover:shadow-primary/20",
          isUser
            ? "bg-gradient-to-br from-primary to-accent text-primary-foreground"
            : "bg-muted"
        )}
      >
        {isUser ? (
          message.parts.map((part, index) => (
            <p key={index} className="leading-relaxed">{part.text}</p>
          ))
        ) : (
          <div className="prose prose-invert max-w-none break-words">
            <ReactMarkdown 
              remarkPlugins={[remarkGfm]}
              components={{
                code({node, inline, className, children, ...props}) {
                  const match = /language-(\w+)/.exec(className || '')
                  return !inline && match ? (
                    <SyntaxHighlighter
                      style={vscDarkPlus}
                      language={match[1]}
                      PreTag="pre"
                      {...props}
                    >
                      {String(children).replace(/\n$/, '')}
                    </SyntaxHighlighter>
                  ) : (
                    <code className={className} {...props}>
                      {children}
                    </code>
                  )
                }
              }}
            >
              {message.parts.map((part) => part.text).join("")}
            </ReactMarkdown>
          </div>
        )}
        {message.imageUrl && (
            <img src={message.imageUrl} alt="Generated content" className="mt-3 rounded-xl max-w-full h-auto" />
        )}
      </div>
      {isUser ? (
        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-muted flex items-center justify-center ring-2 ring-border">
          <User size={24} />
        </div>
      ) : (
        <button
          onClick={handleCopy}
          className="self-center p-1.5 rounded-full text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity hover:bg-accent hover:text-accent-foreground focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring"
          aria-label="Copy message"
        >
          <Copy size={16} />
        </button>
      )}
    </div>
  );
};

export default ChatMessage;
