
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

interface EnhancedChatMessageProps {
  message: Message;
  onReviewCode?: (code: string) => void;
}

const UserMessageContent = ({ text }: { text: string }) => {
  const attachmentRegex = /\[ATTACHMENT: (.*?)\]\n([\s\S]*?)\n\[\/ATTACHMENT\]\n\n([\s\S]*)/s;
  const match = text.match(attachmentRegex);

  if (!match) {
    return <p className="leading-relaxed whitespace-pre-wrap break-words text-slate-100">{text}</p>;
  }

  const [, fileName, fileContent, userPrompt] = match;

  return (
    <div className="space-y-3">
      {userPrompt && <p className="leading-relaxed whitespace-pre-wrap break-words text-slate-100">{userPrompt}</p>}
      <Accordion type="single" collapsible className="w-full bg-slate-900/50 rounded-2xl border border-slate-700/50 backdrop-blur-xl">
        <AccordionItem value="item-1" className="border-none">
          <AccordionTrigger className="p-4 hover:no-underline justify-start gap-3 text-sm font-semibold text-blue-400 hover:text-blue-300 transition-colors">
            <div className="p-2 bg-blue-500/20 rounded-lg">
              <Paperclip className="h-4 w-4" />
            </div>
            <span>Attachment: {fileName}</span>
          </AccordionTrigger>
          <AccordionContent className="pt-0 px-4 pb-4">
             <div className="bg-slate-950/50 border border-slate-800/50 rounded-xl max-h-60 overflow-y-auto mt-1">
                <pre className="text-xs font-mono p-4 whitespace-pre-wrap break-words text-slate-300">{fileContent}</pre>
             </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
};

const EnhancedChatMessage = ({ message, onReviewCode }: EnhancedChatMessageProps) => {
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
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(messageText);

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
    h1: ({node, ...props}) => <h1 className="text-2xl font-bold my-4 text-white" {...props} />,
    h2: ({node, ...props}) => <h2 className="text-xl font-semibold my-3 text-white" {...props} />,
    h3: ({node, ...props}) => <h3 className="text-lg font-semibold my-2 text-white" {...props} />,
    p: ({node, ...props}) => <p className="mb-4 last:mb-0 break-words text-slate-200 leading-relaxed" {...props} />,
    ul: ({node, ...props}) => <ul className="list-disc list-inside mb-4 pl-4 text-slate-200" {...props} />,
    ol: ({node, ...props}) => <ol className="list-decimal list-inside mb-4 pl-4 text-slate-200" {...props} />,
    li: ({node, ...props}) => <li className="mb-2 text-slate-200" {...props} />,
    a: ({node, ...props}) => <a className="text-blue-400 underline hover:text-blue-300 transition-colors" target="_blank" rel="noopener noreferrer" {...props} />,
    blockquote: ({node, ...props}) => <blockquote className="border-l-4 border-blue-500/50 pl-4 my-4 italic text-slate-300 bg-slate-800/30 py-2 rounded-r-lg" {...props} />,
    code({node, inline, className, children, ...props}) {
      const match = /language-(\w+)/.exec(className || '')
      if (inline) {
        return <code className="bg-slate-800/60 text-blue-300 px-2 py-1 rounded-lg text-sm font-mono break-words border border-slate-700/50" {...props}>{children}</code>
      }
      return (
        <div className="my-6 rounded-2xl overflow-hidden border border-slate-700/50 shadow-2xl">
          <div className="bg-slate-800/80 px-4 py-2 border-b border-slate-700/50 flex items-center justify-between">
            <span className="text-slate-400 text-sm font-medium">{match ? match[1] : 'code'}</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigator.clipboard.writeText(String(children).replace(/\n$/, ''))}
              className="h-8 px-3 text-slate-400 hover:text-white hover:bg-slate-700/50 transition-colors"
            >
              <Copy className="w-3 h-3 mr-1" />
              Copy
            </Button>
          </div>
          <SyntaxHighlighter
              style={vscDarkPlus}
              language={match ? match[1] : undefined}
              PreTag="div"
              customStyle={{
                margin: 0,
                maxWidth: '100%',
                overflow: 'auto',
                background: 'rgb(15 23 42 / 0.8)',
                fontSize: '14px'
              }}
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
        "group flex animate-fade-in-up items-start gap-4 py-6 max-w-none",
        isUser && "justify-end"
      )}
    >
      {!isUser && (
        <div className="flex-shrink-0 w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-blue-500/30 flex items-center justify-center text-blue-400 backdrop-blur-xl shadow-lg">
          <Bot size={24} />
          <div className="absolute inset-0 bg-gradient-to-br from-blue-400/10 to-purple-400/10 rounded-2xl blur" />
        </div>
      )}
      <div className={cn("flex flex-col w-full max-w-4xl", isUser ? "items-end" : "items-start")}>
        <div
          className={cn(
            "px-6 py-4 text-base shadow-2xl transition-all duration-300 group-hover:shadow-blue-500/10 border backdrop-blur-xl max-w-full relative overflow-hidden",
            isUser
              ? "bg-gradient-to-br from-blue-500 to-purple-500 text-white border-blue-400/30 rounded-t-3xl rounded-bl-3xl shadow-blue-500/25"
              : "bg-slate-800/50 text-slate-200 border-slate-700/50 rounded-t-3xl rounded-br-3xl"
          )}
        >
          {/* Shimmer Effect for AI messages */}
          {!isUser && (
            <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full bg-gradient-to-r from-transparent via-white/5 to-transparent transition-transform duration-1000 ease-out" />
          )}
          
          {isUser ? (
            message.parts.map((part, index) => (
              <UserMessageContent key={index} text={part.text} />
            ))
          ) : (
            <div className="overflow-hidden relative">
              <ReactMarkdown components={MarkdownComponents} remarkPlugins={[remarkGfm]}>
                {messageText}
              </ReactMarkdown>
            </div>
          )}
          
          {message.imageUrl && (
              <div className="mt-4 rounded-2xl overflow-hidden bg-slate-900/30 p-3 border border-slate-700/50">
                <img 
                  src={message.imageUrl} 
                  alt="Generated content" 
                  className="w-full h-auto max-w-full rounded-xl shadow-2xl"
                  style={{ maxHeight: '500px', objectFit: 'contain' }}
                />
              </div>
          )}
          
          {!isUser && message.code && onReviewCode && (
            <div className="mt-4 pt-4 border-t border-slate-700/50">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => onReviewCode(message.code!)} 
                className="w-full bg-slate-800/50 border-slate-600/50 text-slate-200 hover:bg-slate-700/50 hover:text-white transition-all duration-200"
              >
                <Code className="mr-2 h-4 w-4" />
                Review Code
              </Button>
            </div>
          )}
        </div>
        
        {!isUser && (
           <div className="flex gap-2 mt-3 self-start opacity-0 group-hover:opacity-100 transition-all duration-300">
             <button
                onClick={handleCopy}
                className="p-2 rounded-xl text-slate-500 hover:bg-slate-800/50 hover:text-slate-300 focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all duration-200 backdrop-blur-sm"
                aria-label="Copy message"
              >
                <Copy size={16} />
              </button>
               <button
                onClick={handleSpeak}
                className="p-2 rounded-xl text-slate-500 hover:bg-slate-800/50 hover:text-slate-300 focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all duration-200 backdrop-blur-sm"
                aria-label={isSpeaking ? "Stop speaking" : "Speak message"}
              >
                {isSpeaking ? <VolumeX size={16} /> : <Speaker size={16} />}
              </button>
           </div>
        )}
      </div>
      {isUser && (
        <div className="flex-shrink-0 w-12 h-12 rounded-2xl bg-slate-700/50 border border-slate-600/50 flex items-center justify-center backdrop-blur-xl shadow-lg">
          <User size={24} className="text-slate-300" />
        </div>
      )}
    </div>
  );
};

export default EnhancedChatMessage;
