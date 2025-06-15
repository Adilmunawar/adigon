
import { cn } from "@/lib/utils";
import { Bot, User, Copy, Code, Paperclip } from "lucide-react";
import { toast } from "@/components/ui/sonner";
import CodeBlock from "./CodeBlock";
import { Button } from "./ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export interface Message {
  role: "user" | "model";
  parts: { text: string }[];
  imageUrl?: string;
  code?: string;
}

interface ChatMessageProps {
  message: Message;
  onReviewCode?: (code: string) => void;
}

const UserMessageContent = ({ text }: { text: string }) => {
  const attachmentRegex = /\[ATTACHMENT: (.*?)\]\n([\s\S]*?)\n\[\/ATTACHMENT\]\n\n([\s\S]*)/s;
  const match = text.match(attachmentRegex);

  if (!match) {
    return <p className="leading-relaxed whitespace-pre-wrap">{text}</p>;
  }

  const [, fileName, fileContent, userPrompt] = match;

  return (
    <div className="space-y-3">
      {userPrompt && <p className="leading-relaxed whitespace-pre-wrap">{userPrompt}</p>}
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="item-1" className="border-none bg-primary/10 rounded-lg">
          <AccordionTrigger className="p-3 hover:no-underline justify-start gap-2 text-sm font-semibold">
            <Paperclip className="h-4 w-4" />
            <span>Attachment: {fileName}</span>
          </AccordionTrigger>
          <AccordionContent className="pt-0 px-2 pb-2">
             <div className="bg-background/50 rounded-md max-h-60 overflow-y-auto mt-1">
                <pre className="text-xs font-mono p-3 whitespace-pre-wrap break-words">{fileContent}</pre>
             </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
};

const ChatMessage = ({ message, onReviewCode }: ChatMessageProps) => {
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
            <UserMessageContent key={index} text={part.text} />
          ))
        ) : (
          <CodeBlock content={message.parts.map((part) => part.text).join("")} />
        )}
        {message.imageUrl && (
            <img src={message.imageUrl} alt="Generated content" className="mt-3 rounded-xl max-w-full h-auto" />
        )}
        {!isUser && message.code && onReviewCode && (
          <div className="mt-3 border-t pt-3">
            <Button variant="outline" size="sm" onClick={() => onReviewCode(message.code!)} className="w-full">
              <Code className="mr-2 h-4 w-4" />
              Review Code
            </Button>
          </div>
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
