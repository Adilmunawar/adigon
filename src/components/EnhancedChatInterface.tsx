
import React from 'react';
import { Bot, LoaderCircle, ArrowDown, Sparkles } from 'lucide-react';
import ChatMessage, { Message } from '@/components/ChatMessage';
import ThreeScene from '@/components/ThreeScene';
import { Button } from '@/components/ui/button';
import { useIsMobile } from '@/hooks/use-mobile';

interface EnhancedChatInterfaceProps {
  messages: Message[];
  isLoading: boolean;
  loadingMessage: string;
  examplePrompts: Array<{ text: string; icon: any }>;
  handleSendMessage: (prompt: string) => void;
  onReviewCode: (code: string) => void;
  messagesEndRef: React.RefObject<HTMLDivElement>;
  showScrollButton: boolean;
  scrollToBottom: () => void;
}

const EnhancedChatInterface = ({
  messages,
  isLoading,
  loadingMessage,
  examplePrompts,
  handleSendMessage,
  onReviewCode,
  messagesEndRef,
  showScrollButton,
  scrollToBottom
}: EnhancedChatInterfaceProps) => {
  const isMobile = useIsMobile();

  return (
    <main className="flex-1 overflow-y-auto relative">
      <div className={`mx-auto space-y-4 sm:space-y-6 p-4 sm:p-6 ${isMobile ? 'max-w-full' : 'max-w-4xl'}`}>
        {messages.map((msg, index) => (
          <div 
            key={index} 
            className="animate-fade-in-up" 
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <ChatMessage message={msg} onReviewCode={onReviewCode} />
          </div>
        ))}

        {isLoading && (
          <div className="group flex animate-fade-in-up items-start gap-3 sm:gap-4 py-4">
            <div className="flex-shrink-0 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary ring-2 ring-primary/20 animate-pulse">
              <Bot size={isMobile ? 18 : 20} />
            </div>
            <div className="rounded-2xl px-4 py-3 sm:px-5 sm:py-4 text-sm sm:text-base shadow-lg transition-all duration-500 group-hover:shadow-xl border border-border/50 bg-card/50 text-card-foreground backdrop-blur-sm flex items-center max-w-full">
              <LoaderCircle size={isMobile ? 16 : 18} className="animate-spin mr-3 text-primary flex-shrink-0" />
              <p className="text-sm break-words">{loadingMessage}</p>
            </div>
          </div>
        )}

        {messages.length === 0 && !isLoading && (
          <div className="py-8 sm:py-12 text-center animate-fade-in-up">
            <div className="mb-6 sm:mb-8">
              <ThreeScene />
            </div>
            <h2 className={`font-bold text-foreground mb-3 bg-gradient-to-r from-primary/80 to-primary text-transparent bg-clip-text ${
              isMobile ? 'text-2xl' : 'text-3xl'
            }`}>
              Welcome to AdiGon AI
            </h2>
            <p className={`text-muted-foreground mb-8 sm:mb-12 max-w-2xl mx-auto px-4 ${
              isMobile ? 'text-base' : 'text-lg'
            }`}>
              Your intelligent companion for creative tasks, coding, and conversations. What would you like to explore today?
            </p>
            <div className={`grid gap-3 sm:gap-4 max-w-4xl mx-auto px-4 ${
              isMobile 
                ? 'grid-cols-1 sm:grid-cols-2' 
                : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'
            }`}>
              {examplePrompts.map((prompt, index) => {
                const Icon = prompt.icon;
                return (
                  <button 
                    key={prompt.text}
                    onClick={() => handleSendMessage(prompt.text)}
                    className={`group bg-card/50 border border-border/50 rounded-xl hover:bg-primary/5 hover:border-primary/30 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/10 flex flex-col items-center text-center gap-3 sm:gap-4 backdrop-blur-sm animate-fade-in-up ${
                      isMobile ? 'p-4' : 'p-6'
                    }`}
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className={`bg-primary/10 rounded-full text-primary group-hover:bg-primary/20 transition-all duration-300 ${
                      isMobile ? 'p-3' : 'p-4'
                    }`}>
                      <Icon size={isMobile ? 20 : 24} className="transition-transform duration-300 group-hover:scale-110" />
                    </div>
                    <span className={`font-medium text-foreground group-hover:text-primary transition-colors duration-300 ${
                      isMobile ? 'text-xs leading-tight' : 'text-sm'
                    }`}>
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

      {/* Enhanced Scroll to bottom button */}
      {showScrollButton && (
        <Button
          onClick={scrollToBottom}
          size="icon"
          className={`fixed bottom-20 sm:bottom-24 right-4 sm:right-8 rounded-full bg-primary text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 z-10 animate-fade-in-up border-2 border-primary/20 ${
            isMobile ? 'h-11 w-11' : 'h-12 w-12'
          }`}
          aria-label="Scroll to bottom"
        >
          <ArrowDown size={isMobile ? 18 : 20} />
        </Button>
      )}
    </main>
  );
};

export default EnhancedChatInterface;
