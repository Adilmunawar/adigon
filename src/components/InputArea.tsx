
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
          <div className="bg-card/50 border border-border/50 rounded-2xl p-8 text-center backdrop-blur-sm shadow-lg">
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
      <div className="max-w-4xl mx-auto space-y-4">
        {/* AI Mode Toggles */}
        <div className="flex items-center justify-center gap-8 text-sm">
          <div className="flex items-center gap-3 group">
            <div className="relative">
              <Switch
                checked={isCoderMode}
                onCheckedChange={setIsCoderMode}
                id="coder-mode"
                className="data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-blue-500 data-[state=checked]:to-blue-600"
              />
              {isCoderMode && (
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-500/20 to-blue-600/20 rounded-full blur animate-pulse" />
              )}
            </div>
            <label htmlFor="coder-mode" className="font-medium text-foreground group-hover:text-blue-500 transition-colors cursor-pointer flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              Developer Mode
            </label>
          </div>
          <div className="flex items-center gap-3 group">
            <div className="relative">
              <Switch
                checked={isDeepSearchMode}
                onCheckedChange={setIsDeepSearchMode}
                id="search-mode"
                className="data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-emerald-500 data-[state=checked]:to-emerald-600"
              />
              {isDeepSearchMode && (
                <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500/20 to-emerald-600/20 rounded-full blur animate-pulse" />
              )}
            </div>
            <label htmlFor="search-mode" className="font-medium text-foreground group-hover:text-emerald-500 transition-colors cursor-pointer flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Deep Search
            </label>
          </div>
        </div>

        {/* Attached File Display */}
        {attachedFile && (
          <div className="bg-gradient-to-r from-muted/30 to-muted/20 border border-border/30 rounded-2xl p-4 backdrop-blur-sm shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                <Paperclip className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{attachedFile.name}</p>
                <p className="text-xs text-muted-foreground">
                  {(attachedFile.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setAttachedFile(null)}
                className="h-8 w-8 rounded-full hover:bg-destructive/10 hover:text-destructive transition-colors"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Main Input Form */}
        <form onSubmit={onFormSubmit} className="relative">
          <div className="bg-card/60 border border-border/20 rounded-3xl shadow-xl backdrop-blur-xl overflow-hidden group hover:shadow-2xl transition-all duration-300 hover:border-primary/20">
            <div className="flex items-end gap-2 p-4">
              {/* Text Input */}
              <div className="flex-1 relative">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onPaste={handlePaste}
                  placeholder="Message AdiGon AI... (Ctrl+V to paste images)"
                  disabled={isLoading}
                  className="border-0 bg-transparent text-lg placeholder:text-muted-foreground/70 focus-visible:ring-0 focus-visible:ring-offset-0 resize-none min-h-[48px] pr-4"
                />
              </div>
              
              {/* Action Buttons */}
              <div className="flex items-center gap-1">
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  onClick={handleAttachFileClick}
                  className="h-10 w-10 rounded-full hover:bg-primary/10 hover:text-primary transition-all duration-200 hover:scale-105"
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
                  className="h-10 w-10 rounded-full hover:bg-primary/10 hover:text-primary transition-all duration-200 hover:scale-105"
                  disabled={isLoading}
                >
                  <Image className="w-5 h-5" />
                </Button>
                
                <Button
                  type="submit"
                  size="icon"
                  disabled={(!input.trim() && !attachedFile) || isLoading}
                  className="h-10 w-10 rounded-full bg-gradient-to-r from-primary to-primary/80 text-primary-foreground hover:from-primary/90 hover:to-primary/70 transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none ml-2"
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
