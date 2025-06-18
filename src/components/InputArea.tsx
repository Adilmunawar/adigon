
import React, { useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Send, LoaderCircle, Upload, Code, Globe, Image, X, Paperclip, Mic, MicOff } from 'lucide-react';
import { toast } from '@/components/ui/sonner';

interface InputAreaProps {
  input: string;
  setInput: (value: string) => void;
  attachedFile: File | null;
  setAttachedFile: (file: File | null) => void;
  isLoading: boolean;
  user: any;
  isCoderMode: boolean;
  setIsCoderMode: (value: boolean) => void;
  isDeepSearchMode: boolean;
  setIsDeepSearchMode: (value: boolean) => void;
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
  const [isVoiceRecording, setIsVoiceRecording] = React.useState(false);

  // Handle clipboard paste for images
  useEffect(() => {
    const handlePaste = async (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (item.type.startsWith('image/')) {
          e.preventDefault();
          const file = item.getAsFile();
          if (file) {
            if (file.size > 10 * 1024 * 1024) {
              toast.error("Image is too large. Please use an image smaller than 10MB.");
              return;
            }
            setAttachedFile(file);
            toast.success(`Pasted image: ${file.name || 'clipboard-image.png'}`);
          }
        }
      }
    };

    document.addEventListener('paste', handlePaste);
    return () => document.removeEventListener('paste', handlePaste);
  }, [setAttachedFile]);

  // Mock voice recording functionality
  const handleVoiceToggle = () => {
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      toast.error("Speech recognition is not supported in your browser.");
      return;
    }

    if (isVoiceRecording) {
      setIsVoiceRecording(false);
      toast.info("Voice recording stopped.");
    } else {
      setIsVoiceRecording(true);
      toast.info("Voice recording started. Speak now...");
      
      // Simulate stopping after 5 seconds for demo
      setTimeout(() => {
        setIsVoiceRecording(false);
        toast.success("Voice input processed!");
      }, 5000);
    }
  };

  return (
    <footer className="p-4 border-t border-border/50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="max-w-4xl mx-auto">
        {/* Paste instruction hint */}
        {!attachedFile && (
          <div className="mb-2 text-xs text-muted-foreground text-center opacity-70">
            💡 Tip: Press Ctrl+V to paste images directly from clipboard
          </div>
        )}

        {attachedFile && (
          <div className="mb-3 flex items-center justify-between rounded-xl border border-border/50 bg-card/50 p-3 text-sm backdrop-blur-sm animate-fade-in-up">
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Paperclip className="h-4 w-4 text-primary" />
              </div>
              <span className="truncate font-medium">{attachedFile.name}</span>
              <span className="text-xs text-muted-foreground">
                {(attachedFile.size / 1024 / 1024).toFixed(1)}MB
              </span>
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 hover:bg-destructive/10 hover:text-destructive transition-colors duration-200" 
              onClick={() => setAttachedFile(null)}
            >
              <X size={16} />
            </Button>
          </div>
        )}
        
        <form onSubmit={onFormSubmit} className="flex gap-3 items-end">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            className="hidden"
          />
          
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="icon"
              type="button"
              onClick={handleAttachFileClick}
              disabled={isLoading || !user}
              className="h-12 w-12 rounded-xl border-border/50 hover:bg-primary/5 hover:border-primary/30 transition-all duration-300 hover:scale-105"
              aria-label="Attach file"
            >
              <Upload size={20} />
            </Button>
            
            <Button
              variant={isCoderMode ? "default" : "outline"}
              size="icon"
              type="button"
              onClick={() => {
                setIsCoderMode(!isCoderMode);
                if (!isCoderMode && isDeepSearchMode) {
                  setIsDeepSearchMode(false);
                  toast.info("Deep Search disabled while Coder Mode is active.");
                }
              }}
              disabled={isLoading || !user}
              className="h-12 w-12 rounded-xl transition-all duration-300 hover:scale-105"
              aria-label="Toggle Coder Mode"
            >
              <Code size={20} />
            </Button>
            
            <Button
              variant={isDeepSearchMode ? "default" : "outline"}
              size="icon"
              type="button"
              onClick={() => {
                setIsDeepSearchMode(!isDeepSearchMode);
                if (!isDeepSearchMode && isCoderMode) {
                  setIsCoderMode(false);
                  toast.info("Coder Mode disabled while Deep Search is active.");
                }
              }}
              disabled={isLoading || !user}
              className="h-12 w-12 rounded-xl transition-all duration-300 hover:scale-105"
              aria-label="Toggle Deep Search Mode"
            >
              <Globe size={20} />
            </Button>

            <Button
              variant={isVoiceRecording ? "default" : "outline"}
              size="icon"
              type="button"
              onClick={handleVoiceToggle}
              disabled={isLoading || !user}
              className="h-12 w-12 rounded-xl transition-all duration-300 hover:scale-105"
              aria-label="Voice input"
            >
              {isVoiceRecording ? <MicOff size={20} /> : <Mic size={20} />}
            </Button>
          </div>
          
          <div className="flex-1 relative">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={
                isVoiceRecording
                  ? "🎤 Listening..."
                  : isDeepSearchMode
                  ? "Deep Search: Ask anything to search online..."
                  : isCoderMode
                  ? "Coder Mode: Describe the application to build..."
                  : "Type a message or describe an image to generate..."
              }
              disabled={isLoading || !user || isVoiceRecording}
              className="h-12 pr-24 text-base rounded-xl border-border/50 bg-card/50 backdrop-blur-sm focus:bg-card focus:border-primary/50 transition-all duration-300 placeholder:text-muted-foreground/70"
            />
            
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
              <Button
                variant="ghost"
                size="icon"
                type="button"
                onClick={handleImageGeneration}
                disabled={isLoading || !user || !input.trim()}
                className="h-8 w-8 rounded-lg hover:bg-primary/10 transition-all duration-200"
                aria-label="Generate Image"
              >
                <Image size={16} />
              </Button>
              
              <Button 
                type="submit" 
                disabled={(isLoading || (!input.trim() && !attachedFile)) || !user} 
                size="icon" 
                className="h-8 w-8 rounded-lg bg-primary text-primary-foreground transition-all duration-300 hover:scale-110 hover:shadow-lg shadow-primary/30 disabled:opacity-50 disabled:hover:scale-100"
              >
                {isLoading ? (
                  <LoaderCircle className="animate-spin" size={16} />
                ) : (
                  <Send size={16} />
                )}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </footer>
  );
};

export default InputArea;
