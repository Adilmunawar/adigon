
import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Send, Paperclip, X, Mic, Code2, Sparkles, Plus, Image } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useIsMobile } from "@/hooks/use-mobile";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface ProfessionalChatInputProps {
  input: string;
  setInput: (input: string) => void;
  attachedFile: File | null;
  setAttachedFile: (file: File | null) => void;
  isLoading: boolean;
  isCoderMode: boolean;
  setIsCoderMode: (mode: boolean) => void;
  isDeepSearchMode: boolean;
  setIsDeepSearchMode: (mode: boolean) => void;
  onSubmit: (e: React.FormEvent) => void;
  onAttachFile: () => void;
  onImageGeneration: () => void;
  onVoiceInput?: () => void;
  fileInputRef: React.RefObject<HTMLInputElement>;
}

const ProfessionalChatInput = ({
  input,
  setInput,
  attachedFile,
  setAttachedFile,
  isLoading,
  isCoderMode,
  setIsCoderMode,
  isDeepSearchMode,
  setIsDeepSearchMode,
  onSubmit,
  onAttachFile,
  onImageGeneration,
  onVoiceInput,
  fileInputRef
}: ProfessionalChatInputProps) => {
  const isMobile = useIsMobile();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [isFocused, setIsFocused] = useState(false);

  const adjustTextareaHeight = useCallback(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      const scrollHeight = Math.min(textarea.scrollHeight, 200);
      textarea.style.height = `${scrollHeight}px`;
    }
  }, []);

  useEffect(() => {
    adjustTextareaHeight();
  }, [input, adjustTextareaHeight]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey && !isMobile) {
      e.preventDefault();
      if (input.trim() || attachedFile) {
        onSubmit(e as any);
      }
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

  return (
    <div className="relative border-t border-slate-800/50 bg-gradient-to-t from-slate-950 via-slate-900/80 to-transparent">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(59,130,246,0.05),transparent_70%)]" />
      
      <div className="relative container mx-auto px-4 py-4 max-w-4xl">
        {/* Mode Controls - Compact Row */}
        <div className="flex items-center justify-center gap-6 mb-4">
          <div className="flex items-center gap-2">
            <Switch
              checked={isCoderMode}
              onCheckedChange={setIsCoderMode}
              className="data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-blue-500 data-[state=checked]:to-blue-600"
            />
            <Badge 
              variant={isCoderMode ? "default" : "secondary"} 
              className={cn(
                "gap-1.5 px-3 py-1 text-xs font-medium transition-all",
                isCoderMode 
                  ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white' 
                  : 'bg-slate-800/50 text-slate-400'
              )}
            >
              <Code2 className="w-3 h-3" />
              Developer
            </Badge>
          </div>

          <div className="flex items-center gap-2">
            <Switch
              checked={isDeepSearchMode}
              onCheckedChange={setIsDeepSearchMode}
              className="data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-emerald-500 data-[state=checked]:to-emerald-600"
            />
            <Badge 
              variant={isDeepSearchMode ? "default" : "secondary"} 
              className={cn(
                "gap-1.5 px-3 py-1 text-xs font-medium transition-all",
                isDeepSearchMode 
                  ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white' 
                  : 'bg-slate-800/50 text-slate-400'
              )}
            >
              <Sparkles className="w-3 h-3" />
              Deep Search
            </Badge>
          </div>
        </div>

        {/* Attached File Display - Compact */}
        {attachedFile && (
          <div className="mb-3">
            <div className="inline-flex items-center gap-2 bg-slate-800/60 backdrop-blur-xl border border-slate-700/50 rounded-xl px-3 py-2 text-sm">
              <Paperclip className="w-4 h-4 text-blue-400" />
              <span className="text-slate-300 truncate max-w-48">{attachedFile.name}</span>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setAttachedFile(null)}
                className="h-6 w-6 rounded-lg hover:bg-red-500/20 hover:text-red-400"
              >
                <X className="w-3 h-3" />
              </Button>
            </div>
          </div>
        )}

        {/* Main Input Container - Compact and Professional */}
        <form onSubmit={onSubmit} className="relative">
          <div className={cn(
            "relative flex items-end gap-2 bg-slate-800/60 backdrop-blur-xl border rounded-2xl shadow-2xl transition-all duration-300 overflow-hidden",
            isFocused 
              ? "border-blue-500/50 shadow-blue-500/20" 
              : "border-slate-700/50 hover:border-slate-600/50"
          )}>
            {/* Gradient Border Effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-blue-500/10 opacity-0 group-focus-within:opacity-100 transition-opacity duration-300" />
            
            {/* Text Input */}
            <div className="flex-1 relative min-w-0">
              <Textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                onPaste={handlePaste}
                onKeyDown={handleKeyDown}
                placeholder="Message AdiGon AI..."
                disabled={isLoading}
                className="border-0 bg-transparent text-white placeholder:text-slate-500 focus-visible:ring-0 focus-visible:ring-offset-0 resize-none min-h-[48px] max-h-[120px] leading-relaxed px-4 py-3 text-sm"
                rows={1}
              />
            </div>
            
            {/* Action Buttons - Compact Row */}
            <div className="flex items-center gap-1 pr-2 pb-2">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      onClick={onAttachFile}
                      className="h-8 w-8 rounded-lg hover:bg-slate-700/50 text-slate-400 hover:text-slate-200"
                      disabled={isLoading}
                    >
                      <Paperclip className="w-4 h-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Attach file</TooltipContent>
                </Tooltip>
              </TooltipProvider>
              
              {onVoiceInput && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        onClick={onVoiceInput}
                        className="h-8 w-8 rounded-lg hover:bg-slate-700/50 text-slate-400 hover:text-slate-200"
                        disabled={isLoading}
                      >
                        <Mic className="w-4 h-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Voice input</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
              
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      onClick={onImageGeneration}
                      className="h-8 w-8 rounded-lg hover:bg-slate-700/50 text-slate-400 hover:text-slate-200"
                      disabled={isLoading}
                    >
                      <Image className="w-4 h-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Generate image</TooltipContent>
                </Tooltip>
              </TooltipProvider>
              
              <Button
                type="submit"
                size="icon"
                disabled={(!input.trim() && !attachedFile) || isLoading}
                className="h-8 w-8 rounded-lg bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:from-blue-600 hover:to-purple-600 transition-all duration-200 hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none ml-1"
              >
                {isLoading ? (
                  <div className="w-3 h-3 border border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>
        </form>

        <input
          ref={fileInputRef}
          type="file"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) setAttachedFile(file);
          }}
          className="hidden"
          accept="image/*,.txt,.md,.json,.js,.ts,.tsx,.css,.html,.pdf"
        />
      </div>
    </div>
  );
};

export default ProfessionalChatInput;
