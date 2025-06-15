
import React, { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Bot, User, Copy, Code, Paperclip, Speaker, VolumeX } from "lucide-react";
import { toast } from "@/components/ui/sonner";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
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
  const [isSpeaking, setIsSpeaking] = useState(false);
  
  const messageText = message.parts.map((part) => part.text).join("\n");

  const handleCopy = () => {
    if (messageText) {
      navigator.clipboard.writeText(messageText);
      toast.success("Copied to clipboard!");
    }
  };
  
  const handleSpeak = () => {
    if (!('speechSynthesis' in window)) {
      toast.error("Text-to-speech is not supported in your browser.");
      return;
    }

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    } else {
      window.speechSynthesis.cancel(); // Cancel any previous speech
      const utterance = new SpeechSynthesisUtterance(messageText);

      // Attempt to find a female voice
      const voices = window.speechSynthesis.getVoices();
      const femaleVoice = voices.find(voice => 
        voice.lang.startsWith('en') && 
        (voice.name.toLowerCase().includes('female') || 
         voice.name.includes('Zira') || 
         voice.name.includes('Susan') || 
         voice.name.includes('Google US English') ||
         voice.name.includes('Samantha'))
      );
      
      if (femaleVoice) {
        utterance.voice = femaleVoice;
      }

      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = (e) => {
        console.error("Speech synthesis error:", e);
        toast.error("Couldn't play audio for this message.");
        setIsSpeaking(false);
      };
      
      window.speechSynthesis.speak(utterance);
    }
  };

  // Get voices when they are loaded and cleanup on unmount
  useEffect(() => {
    const loadVoices = () => {
        window.speechSynthesis.getVoices();
    };

    if ('speechSynthesis' in window) {
        window.speechSynthesis.onvoiceschanged = loadVoices;
        loadVoices();
    }
    
    return () => {
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
            window.speechSynthesis.onvoiceschanged = null;
        }
    };
  }, []);

  const MarkdownComponents = {
    h1: ({node, ...props}) => <h1 className="text-2xl font-bold my-4" {...props} />,
    h2: ({node, ...props}) => <h2 className="text-xl font-semibold my-3" {...props} />,
    h3: ({node, ...props}) => <h3 className="text-lg font-semibold my-2" {...props} />,
    p: ({node, ...props}) => <p className="mb-4 last:mb-0" {...props} />,
    ul: ({node, ...props}) => <ul className="list-disc list-inside mb-4 pl-4" {...props} />,
    ol: ({node, ...props}) => <ol className="list-decimal list-inside mb-4 pl-4" {...props} />,
    li: ({node, ...props}) => <li className="mb-2" {...props} />,
    a: ({node, ...props}) => <a className="text-primary underline hover:opacity-80" target="_blank" rel="noopener noreferrer" {...props} />,
    code({node, inline, className, children, ...props}) {
      const match = /language-(\w+)/.exec(className || '')
      if (inline) {
        return <code className="bg-secondary text-secondary-foreground px-1 py-0.5 rounded-sm text-sm font-mono" {...props}>{children}</code>
      }
      return (
        <div className="my-4 rounded-md overflow-hidden">
          <SyntaxHighlighter
              style={vscDarkPlus}
              language={match ? match[1] : undefined}
              PreTag="div"
              {...props}
          >
              {String(children).replace(/\n$/, '')}
          </SyntaxHighlighter>
        </div>
      )
    }
  };

  return (
    <div
      className={cn(
        "group flex animate-fade-in-up items-start gap-3 md:gap-4 py-4",
        isUser && "justify-end"
      )}
    >
      {!isUser && (
        <div className="flex-shrink-0 w-8 h-8 md:w-10 md:h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary ring-2 ring-primary/40">
          <Bot size={24} />
        </div>
      )}
      <div className={cn("flex flex-col w-full max-w-xl", isUser ? "items-end" : "items-start")}>
        <div
          className={cn(
            "rounded-2xl px-4 md:px-5 py-3 text-base shadow-lg transition-all duration-300 group-hover:shadow-primary/20",
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
            <ReactMarkdown components={MarkdownComponents} remarkPlugins={[remarkGfm]}>
              {messageText}
            </ReactMarkdown>
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
        {!isUser && (
           <div className="flex gap-1 mt-2 self-start opacity-0 group-hover:opacity-100 transition-opacity duration-300">
             <button
                onClick={handleCopy}
                className="p-1.5 rounded-full text-muted-foreground hover:bg-accent hover:text-accent-foreground focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring"
                aria-label="Copy message"
              >
                <Copy size={16} />
              </button>
               <button
                onClick={handleSpeak}
                className="p-1.5 rounded-full text-muted-foreground hover:bg-accent hover:text-accent-foreground focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring"
                aria-label={isSpeaking ? "Stop speaking" : "Speak message"}
              >
                {isSpeaking ? <VolumeX size={16} /> : <Speaker size={16} />}
              </button>
           </div>
        )}
      </div>
      {isUser && (
        <div className="flex-shrink-0 w-8 h-8 md:w-10 md:h-10 rounded-full bg-muted flex items-center justify-center ring-2 ring-border">
          <User size={24} />
        </div>
      )}
    </div>
  );
};

export default ChatMessage;
