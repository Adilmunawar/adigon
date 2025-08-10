
import React, { useState, useEffect } from 'react';
import { Bot, User, Copy, ThumbsUp, ThumbsDown, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useStreamingResponse } from '@/hooks/useStreamingResponse';
import { toast } from '@/components/ui/sonner';
import CodeBlock from '@/components/CodeBlock';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export interface StreamingMessage {
  role: 'user' | 'model';
  parts: { text: string }[];
  imageUrl?: string;
  code?: string;
}

interface StreamingChatMessageProps {
  message: StreamingMessage;
  onReviewCode?: (code: string) => void;
  shouldStream?: boolean;
}

const StreamingChatMessage = ({ message, onReviewCode, shouldStream = false }: StreamingChatMessageProps) => {
  const [displayText, setDisplayText] = useState('');
  const [isComplete, setIsComplete] = useState(false);

  const { streamingText, isStreaming, startStreaming } = useStreamingResponse({
    onComplete: (text) => {
      setDisplayText(text);
      setIsComplete(true);
    },
    onUpdate: (text) => {
      setDisplayText(text);
    }
  });

  useEffect(() => {
    const fullText = message.parts[0]?.text || '';
    
    if (shouldStream && message.role === 'model' && !isComplete) {
      startStreaming(fullText, 25);
    } else {
      setDisplayText(fullText);
      setIsComplete(true);
    }
  }, [message, shouldStream, startStreaming, isComplete]);

  const handleCopy = () => {
    navigator.clipboard.writeText(displayText);
    toast.success('Message copied to clipboard!');
  };

  const handleReviewCode = () => {
    if (message.code && onReviewCode) {
      onReviewCode(message.code);
    }
  };

  const isUser = message.role === 'user';

  return (
    <div className={`group flex gap-4 py-6 ${isUser ? 'flex-row-reverse' : ''}`}>
      {/* Avatar */}
      <div className={`flex-shrink-0 w-10 h-10 rounded-2xl flex items-center justify-center ${
        isUser 
          ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/25' 
          : 'bg-gradient-to-br from-slate-100 to-slate-200 text-slate-700 border border-slate-200 shadow-lg'
      }`}>
        {isUser ? <User size={18} /> : <Bot size={18} />}
      </div>

      {/* Message Content */}
      <div className={`flex-1 min-w-0 ${isUser ? 'text-right' : ''}`}>
        {/* Message Bubble */}
        <div className={`inline-block max-w-4xl ${
          isUser 
            ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-3xl rounded-tr-lg px-6 py-4 shadow-lg shadow-blue-500/20' 
            : 'bg-gradient-to-br from-white to-slate-50 border border-slate-200 text-slate-800 rounded-3xl rounded-tl-lg px-6 py-4 shadow-lg shadow-slate-200/50'
        }`}>
          {/* User uploaded image */}
          {message.imageUrl && isUser && (
            <div className="mb-4">
              <img
                src={message.imageUrl}
                alt="User uploaded content"
                className="max-w-sm rounded-2xl shadow-lg"
              />
            </div>
          )}

          {/* Text Content */}
          <div className={`prose prose-sm max-w-none ${
            isUser 
              ? 'prose-invert prose-headings:text-white prose-p:text-white/90 prose-strong:text-white' 
              : 'prose-slate prose-headings:text-slate-800 prose-p:text-slate-700 prose-strong:text-slate-800'
          }`}>
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {displayText}
            </ReactMarkdown>
            {isStreaming && (
              <span className="inline-block w-2 h-5 bg-current animate-pulse ml-1 opacity-70" />
            )}
          </div>

          {/* AI generated image */}
          {message.imageUrl && !isUser && (
            <div className="mt-4">
              <img
                src={message.imageUrl}
                alt="AI generated content"
                className="max-w-md rounded-2xl shadow-lg border border-slate-200"
              />
            </div>
          )}

          {/* Code Content */}
          {message.code && (
            <div className="mt-6">
              <CodeBlock content={message.code} />
            </div>
          )}
        </div>

        {/* Action Buttons */}
        {!isUser && isComplete && (
          <div className="flex items-center gap-2 mt-3 opacity-0 group-hover:opacity-100 transition-all duration-200">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCopy}
              className="h-8 px-3 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-xl"
            >
              <Copy size={14} className="mr-1.5" />
              Copy
            </Button>
            
            {message.code && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleReviewCode}
                className="h-8 px-3 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-xl"
              >
                <Bot size={14} className="mr-1.5" />
                Review Code
              </Button>
            )}

            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-xl"
            >
              <ThumbsUp size={14} />
            </Button>
            
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-xl"
            >
              <ThumbsDown size={14} />
            </Button>
            
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-xl"
            >
              <MoreHorizontal size={14} />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default StreamingChatMessage;
