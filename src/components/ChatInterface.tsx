
import React from 'react';
import { Bot, LoaderCircle } from 'lucide-react';
import ChatMessage, { Message } from '@/components/ChatMessage';
import ThreeScene from '@/components/ThreeScene';

interface ChatInterfaceProps {
  messages: Message[];
  isLoading: boolean;
  loadingMessage: string;
  examplePrompts: Array<{ text: string; icon: any }>;
  handleSendMessage: (prompt: string) => void;
  onReviewCode: (code: string) => void;
  messagesEndRef: React.RefObject<HTMLDivElement>;
}

const ChatInterface = ({
  messages,
  isLoading,
  loadingMessage,
  examplePrompts,
  handleSendMessage,
  onReviewCode,
  messagesEndRef
}: ChatInterfaceProps) => {
  return (
    <main className="flex-1 overflow-y-auto px-4 py-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {messages.map((msg, index) => (
          <div key={index} className="animate-fade-in-up" style={{ animationDelay: `${index * 50}ms` }}>
            <ChatMessage message={msg} onReviewCode={onReviewCode} />
          </div>
        ))}

        {isLoading && (
          <div className="group flex animate-fade-in-up items-start gap-4 py-4">
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary ring-2 ring-primary/20 animate-pulse">
              <Bot size={20} />
            </div>
            <div className="rounded-2xl px-5 py-4 text-base shadow-lg transition-all duration-500 group-hover:shadow-xl border border-border/50 bg-card/50 text-card-foreground backdrop-blur-sm flex items-center">
              <LoaderCircle size={18} className="animate-spin mr-3 text-primary" />
              <p className="text-sm">{loadingMessage}</p>
            </div>
          </div>
        )}

        {messages.length === 0 && !isLoading && (
          <div className="py-12 text-center animate-fade-in-up">
            <div className="mb-8">
              <ThreeScene />
            </div>
            <h2 className="text-3xl font-bold text-foreground mb-3 bg-gradient-to-r from-primary/80 to-primary text-transparent bg-clip-text">
              Welcome to AdiGon AI
            </h2>
            <p className="text-lg text-muted-foreground mb-12 max-w-2xl mx-auto">
              Your intelligent companion for creative tasks, coding, and conversations. What would you like to explore today?
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-4xl mx-auto">
              {examplePrompts.map((prompt, index) => {
                const Icon = prompt.icon;
                return (
                  <button 
                    key={prompt.text}
                    onClick={() => handleSendMessage(prompt.text)}
                    className="group p-6 bg-card/50 border border-border/50 rounded-xl hover:bg-primary/5 hover:border-primary/30 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/10 flex flex-col items-center text-center gap-4 backdrop-blur-sm animate-fade-in-up"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className="bg-primary/10 p-4 rounded-full text-primary group-hover:bg-primary/20 transition-all duration-300">
                      <Icon size={24} className="transition-transform duration-300 group-hover:scale-110" />
                    </div>
                    <span className="font-medium text-sm text-foreground group-hover:text-primary transition-colors duration-300">
                      {prompt.text}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>
    </main>
  );
};

export default ChatInterface;
