
import React from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send, Paperclip, X, Image } from "lucide-react";
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
      <div className="border-t border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 p-4">
        <div className="max-w-4xl mx-auto text-center text-muted-foreground">
          Please sign in to start chatting
        </div>
      </div>
    );
  }

  return (
    <div className="border-t border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 p-4">
      <div className="max-w-4xl mx-auto space-y-4">
        {/* Mode toggles */}
        <div className="flex items-center justify-center gap-6 text-sm">
          <div className="flex items-center gap-2">
            <Switch
              checked={isCoderMode}
              onCheckedChange={setIsCoderMode}
              id="coder-mode"
            />
            <label htmlFor="coder-mode" className="font-medium">
              Developer Mode
            </label>
          </div>
          <div className="flex items-center gap-2">
            <Switch
              checked={isDeepSearchMode}
              onCheckedChange={setIsDeepSearchMode}
              id="search-mode"
            />
            <label htmlFor="search-mode" className="font-medium">
              Deep Search
            </label>
          </div>
        </div>

        {/* Attached file indicator */}
        {attachedFile && (
          <div className="flex items-center gap-2 p-3 bg-muted/30 rounded-lg border border-border/50">
            <Paperclip size={16} />
            <span className="text-sm flex-1 truncate">{attachedFile.name}</span>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setAttachedFile(null)}
              className="h-6 w-6"
            >
              <X size={14} />
            </Button>
          </div>
        )}

        {/* Input form */}
        <form onSubmit={onFormSubmit} className="flex items-end gap-3">
          <div className="flex-1 relative">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onPaste={handlePaste}
              placeholder="Type your message... (Ctrl+V to paste images)"
              disabled={isLoading}
              className="pr-4 py-6 text-base bg-background/50 border-border/50 focus:border-primary/50 transition-all duration-300"
            />
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              type="button"
              size="icon"
              variant="outline"
              onClick={handleAttachFileClick}
              className="h-10 w-10 rounded-full"
            >
              <Paperclip size={18} />
            </Button>
            
            <VoiceInput 
              onTranscription={handleVoiceTranscription}
              disabled={isLoading}
            />
            
            <Button
              type="button"
              size="icon"
              variant="outline"
              onClick={handleImageGeneration}
              className="h-10 w-10 rounded-full"
            >
              <Image size={18} />
            </Button>
            
            <Button
              type="submit"
              size="icon"
              disabled={(!input.trim() && !attachedFile) || isLoading}
              className="h-10 w-10 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-300 hover:scale-105"
            >
              <Send size={18} />
            </Button>
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
