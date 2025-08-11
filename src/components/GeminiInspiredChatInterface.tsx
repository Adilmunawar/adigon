
import React from 'react';
import { Bot, LoaderCircle, ArrowDown, Sparkles, Zap } from 'lucide-react';
import ChatMessage, { Message } from '@/components/ChatMessage';
import ThreeScene from '@/components/ThreeScene';
import { Button } from '@/components/ui/button';
import { useIsMobile } from '@/hooks/use-mobile';

interface GeminiInspiredChatInterfaceProps {
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

const GeminiInspiredChatInterface = ({
  messages,
  isLoading,
  loadingMessage,
  examplePrompts,
  handleSendMessage,
  onReviewCode,
  messagesEndRef,
  showScrollButton,
  scrollToBottom
}: GeminiInspiredChatInterfaceProps) => {
  const isMobile = useIsMobile();

  return (
    <main className="flex-1 overflow-hidden relative bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_50%,rgba(120,119,198,0.1),transparent_50%),radial-gradient(circle_at_80%_50%,rgba(120,119,198,0.05),transparent_50%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:4rem_4rem]" />
      
      <div className="relative h-full overflow-y-auto scrollbar-thin scrollbar-track-transparent scrollbar-thumb-slate-700/50">
        <div className={`mx-auto space-y-6 p-4 sm:p-6 lg:p-8 min-h-full flex flex-col ${isMobile ? 'max-w-full' : 'max-w-5xl'}`}>
          
          {/* Welcome Section */}
          {messages.length === 0 && !isLoading && (
            <div className="flex-1 flex flex-col justify-center items-center py-12 text-center animate-fade-in-up">
              <div className="mb-8">
                <ThreeScene />
              </div>
              
              {/* Welcome Header */}
              <div className="mb-12 space-y-6">
                <div className="relative">
                  <h1 className={`font-bold text-white mb-4 tracking-tight ${
                    isMobile ? 'text-4xl' : 'text-6xl lg:text-7xl'
                  }`}>
                    <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-blue-400 bg-clip-text text-transparent">
                      AdiGon AI
                    </span>
                  </h1>
                  <div className="absolute -inset-4 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-full blur-3xl -z-10" />
                </div>
                
                <p className={`text-slate-300 max-w-2xl mx-auto leading-relaxed ${
                  isMobile ? 'text-lg px-4' : 'text-xl px-6'
                }`}>
                  Your intelligent companion for creative tasks, coding, and conversations. 
                  <span className="text-blue-400 font-medium"> What would you like to explore today?</span>
                </p>
              </div>
              
              {/* Example Prompts */}
              <div className={`grid gap-4 max-w-6xl mx-auto w-full ${
                isMobile 
                  ? 'grid-cols-1 px-4' 
                  : 'grid-cols-2 lg:grid-cols-4 px-6'
              }`}>
                {examplePrompts.map((prompt, index) => {
                  const Icon = prompt.icon;
                  return (
                    <button 
                      key={prompt.text}
                      onClick={() => handleSendMessage(prompt.text)}
                      className={`group relative bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl hover:bg-slate-700/50 hover:border-slate-600/50 transition-all duration-300 transform hover:-translate-y-2 hover:shadow-2xl hover:shadow-blue-500/10 flex flex-col items-center text-center gap-4 overflow-hidden animate-fade-in-up ${
                        isMobile ? 'p-6' : 'p-8'
                      }`}
                      style={{ animationDelay: `${index * 150}ms` }}
                    >
                      {/* Gradient Border Effect */}
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      
                      <div className={`relative bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-2xl text-blue-400 group-hover:from-blue-400/30 group-hover:to-purple-400/30 group-hover:text-blue-300 transition-all duration-300 ${
                        isMobile ? 'p-4' : 'p-5'
                      }`}>
                        <Icon size={isMobile ? 24 : 28} className="transition-transform duration-300 group-hover:scale-110" />
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-400/10 to-purple-400/10 rounded-2xl blur group-hover:blur-md transition-all duration-300" />
                      </div>
                      
                      <span className={`relative font-medium text-slate-200 group-hover:text-white transition-colors duration-300 leading-snug ${
                        isMobile ? 'text-sm' : 'text-base'
                      }`}>
                        {prompt.text}
                      </span>
                      
                      {/* Shine Effect */}
                      <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full bg-gradient-to-r from-transparent via-white/5 to-transparent transition-transform duration-700 ease-out" />
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Messages */}
          <div className="flex-1 space-y-6">
            {messages.map((msg, index) => (
              <div 
                key={index} 
                className="animate-fade-in-up" 
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <ChatMessage message={msg} onReviewCode={onReviewCode} />
              </div>
            ))}

            {/* Loading State */}
            {isLoading && (
              <div className="group flex animate-fade-in-up items-start gap-4 py-6">
                <div className="flex-shrink-0 w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-blue-500/30 flex items-center justify-center text-blue-400 backdrop-blur-xl">
                  <Bot size={20} className="animate-pulse" />
                </div>
                <div className="flex-1 bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-3xl px-6 py-4 max-w-4xl">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <LoaderCircle size={18} className="animate-spin text-blue-400" />
                      <div className="absolute inset-0 bg-blue-400/20 rounded-full blur animate-pulse" />
                    </div>
                    <div className="space-y-2 flex-1">
                      <p className="text-slate-300 text-sm font-medium">{loadingMessage}</p>
                      <div className="flex gap-1">
                        <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
                        <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
                        <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} className="h-4" />
          </div>
        </div>
      </div>

      {/* Enhanced Scroll Button */}
      {showScrollButton && (
        <Button
          onClick={scrollToBottom}
          size="icon"
          className={`fixed bottom-24 right-6 rounded-2xl bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:from-blue-600 hover:to-purple-600 shadow-2xl shadow-blue-500/25 hover:shadow-blue-500/40 transition-all duration-300 hover:scale-110 z-20 border border-blue-400/20 backdrop-blur-xl ${
            isMobile ? 'h-12 w-12' : 'h-14 w-14'
          }`}
          aria-label="Scroll to bottom"
        >
          <ArrowDown size={isMobile ? 18 : 20} />
          <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded-2xl blur-lg" />
        </Button>
      )}
    </main>
  );
};

export default GeminiInspiredChatInterface;
