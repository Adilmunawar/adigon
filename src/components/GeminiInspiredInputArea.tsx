
import React, { useState, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Send, Paperclip, X, Image, Mic, Code2, Search, Sparkles, Zap, Plus } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useIsMobile } from "@/hooks/use-mobile";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface GeminiInspiredInputAreaProps {
  input: string;
  setInput: (input: string) => void;
  attachedFile: File | null;
  setAttachedFile: (file: File | null) => void;
  isLoading: boolean;
  user: any;
  isCoderMode: boolean;
  setIsCoderMode: (mode: boolean) => void;
  isDeepSearchMode: boolean;
  setIsDeepSearchMode: (mode: boolean) => void;
  handleAttachFileClick: () => void;
  handleFileSelect: (event: React.ChangeEvent<HTMLInputElement>) => void;
  handleImageGeneration: () => void;
  onFormSubmit: (e: React.FormEvent) => void;
  fileInputRef: React.RefObject<HTMLInputElement>;
  onVoiceTranscription?: (text: string) => void;
}

const GeminiInspiredInputArea = ({
  input,
  setInput,
  attachedFile,
  setAttachedFile,
  isLoading,
  user,
  isCoderMode,
  setIsCoderMode,
  isDeepSearchMode,
  setIsDeepSearchMode,
  handleAttachFileClick,
  handleFileSelect,
  handleImageGeneration,
  onFormSubmit,
  fileInputRef,
  onVoiceTranscription
}: GeminiInspiredInputAreaProps) => {
  const isMobile = useIsMobile();
  const [isVoiceRecording, setIsVoiceRecording] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleVoiceClick = () => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      const recognition = new SpeechRecognition();
      
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onstart = () => setIsVoiceRecording(true);
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (onVoiceTranscription) {
          onVoiceTranscription(transcript);
        }
      };
      recognition.onerror = () => setIsVoiceRecording(false);
      recognition.onend = () => setIsVoiceRecording(false);

      recognition.start();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const items = e.clipboardData?.items;
    if (items) {
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (item.type.indexOf('image') !== -1) {
          const file = item.getAsFile();
          if (file) {
            setAttachedFile(file);
            e.preventDefault();
            return;
          }
        }
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey && !isMobile) {
      e.preventDefault();
      if (input.trim() || attachedFile) {
        onFormSubmit(e as any);
      }
    }
  };

  if (!user) {
    return (
      <div className="relative bg-slate-950 border-t border-slate-800/50">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/50 to-transparent" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(120,119,198,0.1),transparent_70%)]" />
        
        <div className="relative container mx-auto px-6 py-12">
          <div className="max-w-md mx-auto">
            <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-8 text-center shadow-2xl">
              <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/30 relative">
                <Sparkles className="w-8 h-8 text-white" />
                <div className="absolute inset-0 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-2xl blur-xl" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">Welcome to AdiGon AI</h3>
              <p className="text-slate-400 text-lg">Please sign in to start your conversation</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative bg-slate-950 border-t border-slate-800/50">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/50 to-transparent" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(120,119,198,0.1),transparent_70%)]" />
      
      <div className="relative container mx-auto px-4 sm:px-6 py-6">
        {/* Mode Controls */}
        <div className="flex items-center justify-center gap-8 mb-6">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center gap-3 group cursor-pointer">
                  <div className="relative">
                    <Switch
                      checked={isCoderMode}
                      onCheckedChange={setIsCoderMode}
                      className="data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-blue-500 data-[state=checked]:to-blue-600 shadow-lg"
                    />
                    {isCoderMode && (
                      <div className="absolute -inset-3 bg-gradient-to-r from-blue-500/20 to-blue-600/20 rounded-full blur-lg animate-pulse" />
                    )}
                  </div>
                  <Badge 
                    variant={isCoderMode ? "default" : "secondary"} 
                    className={`gap-2 px-4 py-2 font-medium rounded-xl border transition-all duration-300 ${
                      isCoderMode 
                        ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white border-blue-400/30 shadow-lg shadow-blue-500/25' 
                        : 'bg-slate-800/50 text-slate-300 border-slate-700/50 hover:bg-slate-700/50'
                    }`}
                  >
                    <Code2 className="w-4 h-4" />
                    Developer Mode
                    <Zap className="w-3 h-3" />
                  </Badge>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>Always generates complete, production-ready code</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center gap-3 group cursor-pointer">
                  <div className="relative">
                    <Switch
                      checked={isDeepSearchMode}
                      onCheckedChange={setIsDeepSearchMode}
                      className="data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-emerald-500 data-[state=checked]:to-emerald-600 shadow-lg"
                    />
                    {isDeepSearchMode && (
                      <div className="absolute -inset-3 bg-gradient-to-r from-emerald-500/20 to-emerald-600/20 rounded-full blur-lg animate-pulse" />
                    )}
                  </div>
                  <Badge 
                    variant={isDeepSearchMode ? "default" : "secondary"} 
                    className={`gap-2 px-4 py-2 font-medium rounded-xl border transition-all duration-300 ${
                      isDeepSearchMode 
                        ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white border-emerald-400/30 shadow-lg shadow-emerald-500/25' 
                        : 'bg-slate-800/50 text-slate-300 border-slate-700/50 hover:bg-slate-700/50'
                    }`}
                  >
                    <Search className="w-4 h-4" />
                    Deep Search
                    <Sparkles className="w-3 h-3" />
                  </Badge>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>Enhanced search with comprehensive research</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        {/* Attached File Display */}
        {attachedFile && (
          <div className="mb-6 max-w-4xl mx-auto">
            <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-4 shadow-xl">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center shadow-lg relative">
                  <Paperclip className="w-5 h-5 text-white" />
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-xl blur" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-white truncate">{attachedFile.name}</p>
                  <p className="text-sm text-slate-400">
                    {(attachedFile.size / 1024 / 1024).toFixed(2)} MB • {attachedFile.type}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setAttachedFile(null)}
                  className="h-10 w-10 rounded-xl hover:bg-red-500/20 hover:text-red-400 text-slate-400 transition-all duration-200"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Enhanced Input Form */}
        <form onSubmit={onFormSubmit} className="relative max-w-4xl mx-auto">
          <div className="relative bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-3xl shadow-2xl overflow-hidden group hover:border-slate-600/50 transition-all duration-500">
            {/* Gradient Border Effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-blue-500/10 opacity-0 group-focus-within:opacity-100 transition-opacity duration-300" />
            
            <div className="relative flex items-end gap-4 p-4">
              {/* Text Input */}
              <div className="flex-1 relative">
                <Textarea
                  ref={textareaRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onPaste={handlePaste}
                  onKeyDown={handleKeyDown}
                  placeholder="Message AdiGon AI... (Ctrl+V for images, Enter to send)"
                  disabled={isLoading}
                  className="border-0 bg-transparent text-white placeholder:text-slate-500 focus-visible:ring-0 focus-visible:ring-offset-0 resize-none min-h-[60px] max-h-40 leading-relaxed text-base"
                  rows={1}
                />
              </div>
              
              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        onClick={handleAttachFileClick}
                        className="h-11 w-11 rounded-2xl hover:bg-slate-700/50 text-slate-400 hover:text-slate-200 transition-all duration-200 hover:scale-105"
                        disabled={isLoading}
                      >
                        <Paperclip className="w-5 h-5" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Attach file</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        onClick={handleVoiceClick}
                        className={`h-11 w-11 rounded-2xl transition-all duration-200 hover:scale-105 ${
                          isVoiceRecording 
                            ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30' 
                            : 'hover:bg-slate-700/50 text-slate-400 hover:text-slate-200'
                        }`}
                        disabled={isLoading}
                      >
                        <Mic className={`w-5 h-5 ${isVoiceRecording ? 'animate-pulse' : ''}`} />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Voice input</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        onClick={handleImageGeneration}
                        className="h-11 w-11 rounded-2xl hover:bg-slate-700/50 text-slate-400 hover:text-slate-200 transition-all duration-200 hover:scale-105"
                        disabled={isLoading}
                      >
                        <Image className="w-5 h-5" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Generate image</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                
                <Button
                  type="submit"
                  size="icon"
                  disabled={(!input.trim() && !attachedFile) || isLoading}
                  className="h-12 w-12 rounded-2xl bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:from-blue-600 hover:to-purple-600 transition-all duration-300 hover:scale-110 shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none ml-2 border border-blue-400/20 relative overflow-hidden"
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <Send className="w-5 h-5" />
                  )}
                  {/* Shimmer Effect */}
                  <div className="absolute inset-0 -translate-x-full hover:translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent transition-transform duration-700 ease-out" />
                </Button>
              </div>
            </div>
          </div>
        </form>

        <input
          ref={fileInputRef}
          type="file"
          onChange={handleFileSelect}
          className="hidden"
          accept="image/*,.txt,.md,.json,.js,.ts,.tsx,.css,.html,.pdf"
        />
      </div>
    </div>
  );
};

export default GeminiInspiredInputArea;
