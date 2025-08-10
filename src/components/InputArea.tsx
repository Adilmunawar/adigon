
import React from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send, Paperclip, X, Image, Settings, Sparkles } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import VoiceInput from '@/components/VoiceInput';

interface InputAreaProps {
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
}

const InputArea = ({
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
  fileInputRef
}: InputAreaProps) => {
  const handleVoiceTranscription = (text: string) => {
    setInput(input + (input ? ' ' : '') + text);
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
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

  if (!user) {
    return (
      <div className="border-t border-border/20 bg-gradient-to-t from-background/95 to-background/80 backdrop-blur-xl p-6">
        <div className="max-w-4xl mx-auto">
          <div className="glass-card p-8 text-center backdrop-blur-sm shadow-lg">
            <div className="w-16 h-16 mx-auto mb-4 bg-primary/10 rounded-full flex items-center justify-center">
              <Settings className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">Welcome to AdiGon AI</h3>
            <p className="text-muted-foreground">Please sign in to start your conversation</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="border-t border-border/10 bg-gradient-to-t from-background via-background/95 to-background/80 backdrop-blur-xl p-4 sm:p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* AI Mode Toggles - Enhanced Design */}
        <div className="flex items-center justify-center gap-8 text-sm">
          <div className="flex items-center gap-4 group">
            <div className="relative">
              <Switch
                checked={isCoderMode}
                onCheckedChange={setIsCoderMode}
                id="coder-mode"
                className="data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-blue-500 data-[state=checked]:to-blue-600 modern-switch"
              />
              {isCoderMode && (
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-500/20 to-blue-600/20 rounded-full blur animate-pulse" />
              )}
            </div>
            <label htmlFor="coder-mode" className="font-medium text-foreground group-hover:text-blue-400 transition-colors cursor-pointer flex items-center gap-2">
              <div className="p-2 rounded-xl bg-blue-500/10">
                <Sparkles className="w-4 h-4 text-blue-400" />
              </div>
              <span className="text-base">Developer Mode</span>
            </label>
          </div>
          
          <div className="flex items-center gap-4 group">
            <div className="relative">
              <Switch
                checked={isDeepSearchMode}
                onCheckedChange={setIsDeepSearchMode}
                id="search-mode"
                className="data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-emerald-500 data-[state=checked]:to-emerald-600 modern-switch"
              />
              {isDeepSearchMode && (
                <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500/20 to-emerald-600/20 rounded-full blur animate-pulse" />
              )}
            </div>
            <label htmlFor="search-mode" className="font-medium text-foreground group-hover:text-emerald-400 transition-colors cursor-pointer flex items-center gap-2">
              <div className="p-2 rounded-xl bg-emerald-500/10">
                <Settings className="w-4 h-4 text-emerald-400" />
              </div>
              <span className="text-base">Deep Search</span>
            </label>
          </div>
        </div>

        {/* Attached File Display - Enhanced */}
        {attachedFile && (
          <div className="glass-card p-6 shadow-lg animate-scale-in">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center">
                <Paperclip className="w-6 h-6 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-base font-medium text-foreground truncate">{attachedFile.name}</p>
                <p className="text-sm text-muted-foreground">
                  {(attachedFile.size / 1024 / 1024).toFixed(2)} MB • {attachedFile.type}
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setAttachedFile(null)}
                className="h-10 w-10 rounded-full hover:bg-destructive/10 hover:text-destructive transition-all duration-200"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
          </div>
        )}

        {/* Main Input Form - Gemini-inspired Design */}
        <form onSubmit={onFormSubmit} className="relative">
          <div className="glass-card overflow-hidden group hover:shadow-2xl transition-all duration-300 hover:border-primary/30">
            <div className="flex items-end gap-3 p-6">
              {/* Text Input - Enhanced */}
              <div className="flex-1 relative">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onPaste={handlePaste}
                  placeholder="Message AdiGon AI... (Ctrl+V to paste images)"
                  disabled={isLoading}
                  className="gemini-input text-lg min-h-[56px] px-6 py-4 resize-none border-none bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0"
                />
              </div>
              
              {/* Action Buttons - Enhanced */}
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  onClick={handleAttachFileClick}
                  className="h-12 w-12 rounded-2xl hover:bg-primary/10 hover:text-primary transition-all duration-200 hover:scale-105"
                  disabled={isLoading}
                >
                  <Paperclip className="w-5 h-5" />
                </Button>
                
                <VoiceInput 
                  onTranscription={handleVoiceTranscription}
                  disabled={isLoading}
                />
                
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  onClick={handleImageGeneration}
                  className="h-12 w-12 rounded-2xl hover:bg-primary/10 hover:text-primary transition-all duration-200 hover:scale-105"
                  disabled={isLoading}
                >
                  <Image className="w-5 h-5" />
                </Button>
                
                <Button
                  type="submit"
                  size="icon"
                  disabled={(!input.trim() && !attachedFile) || isLoading}
                  className="h-12 w-12 rounded-2xl action-button disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none ml-2"
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                  ) : (
                    <Send className="w-5 h-5" />
                  )}
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

export default InputArea;
