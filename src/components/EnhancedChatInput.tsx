
import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Send, Paperclip, X, Mic, Image as ImageIcon, Plus } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useIsMobile } from "@/hooks/use-mobile";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { toast } from "@/components/ui/sonner";
import { uploadService, FileUploadResult } from "@/services/uploadService";
import { voiceService, VoiceRecordingResult } from "@/services/voiceService";
import AttachmentPreview from "@/components/AttachmentPreview";
import VoiceRecorder from "@/components/VoiceRecorder";

interface EnhancedChatInputProps {
  input: string;
  setInput: (input: string) => void;
  isLoading: boolean;
  isCoderMode: boolean;
  setIsCoderMode: (mode: boolean) => void;
  isDeepSearchMode: boolean;
  setIsDeepSearchMode: (mode: boolean) => void;
  onSubmit: (e: React.FormEvent, attachments?: FileUploadResult[]) => void;
}

const EnhancedChatInput: React.FC<EnhancedChatInputProps> = ({
  input,
  setInput,
  isLoading,
  isCoderMode,
  setIsCoderMode,
  isDeepSearchMode,
  setIsDeepSearchMode,
  onSubmit
}) => {
  const isMobile = useIsMobile();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  
  const [isFocused, setIsFocused] = useState(false);
  const [attachments, setAttachments] = useState<FileUploadResult[]>([]);
  const [showVoiceRecorder, setShowVoiceRecorder] = useState(false);
  const [showAttachmentMenu, setShowAttachmentMenu] = useState(false);

  const adjustTextareaHeight = useCallback(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      const scrollHeight = Math.min(textarea.scrollHeight, 120);
      textarea.style.height = `${scrollHeight}px`;
    }
  }, []);

  useEffect(() => {
    adjustTextareaHeight();
  }, [input, adjustTextareaHeight]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey && !isMobile) {
      e.preventDefault();
      if (input.trim() || attachments.length > 0) {
        handleSubmit(e as any);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() || attachments.length > 0) {
      onSubmit(e, attachments);
      setAttachments([]);
    }
  };

  const handleFileUpload = async (files: FileList | null, type?: 'file' | 'image') => {
    if (!files || files.length === 0) return;

    const file = files[0];
    
    if (!uploadService.validateFileType(file)) {
      toast.error('File type not supported');
      return;
    }

    try {
      const result = await uploadService.processFile(file);
      
      if (result.success) {
        setAttachments(prev => [...prev, result]);
        toast.success('File attached successfully');
      } else {
        toast.error(result.error || 'Failed to attach file');
      }
    } catch (error) {
      toast.error('Failed to process file');
    }
  };

  const handleVoiceRecording = async (result: VoiceRecordingResult) => {
    if (result.success && result.audioBlob) {
      const file = new File([result.audioBlob], 'voice-recording.webm', {
        type: 'audio/webm'
      });
      
      const uploadResult = await uploadService.processFile(file);
      
      if (uploadResult.success) {
        setAttachments(prev => [...prev, uploadResult]);
        toast.success('Voice recording attached');
      }
    }
    setShowVoiceRecorder(false);
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="relative border-t border-slate-800/50 bg-gradient-to-t from-slate-950 via-slate-900/80 to-transparent">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(59,130,246,0.05),transparent_70%)]" />
      
      <div className="relative container mx-auto px-4 py-4 max-w-4xl">
        {/* Mode Controls */}
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
              Developer Mode
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
              Deep Search
            </Badge>
          </div>
        </div>

        {/* Attachments Display */}
        {attachments.length > 0 && (
          <div className="mb-3 space-y-2">
            {attachments.map((attachment, index) => (
              <AttachmentPreview
                key={index}
                attachment={attachment}
                onRemove={() => removeAttachment(index)}
              />
            ))}
          </div>
        )}

        {/* Voice Recorder */}
        {showVoiceRecorder && (
          <div className="mb-3">
            <VoiceRecorder
              onRecordingComplete={handleVoiceRecording}
              onCancel={() => setShowVoiceRecorder(false)}
            />
          </div>
        )}

        {/* Main Input Container */}
        <form onSubmit={handleSubmit} className="relative">
          <div className={cn(
            "relative flex items-end gap-2 bg-slate-800/60 backdrop-blur-xl border rounded-2xl shadow-2xl transition-all duration-300 overflow-hidden",
            isFocused 
              ? "border-blue-500/50 shadow-blue-500/20" 
              : "border-slate-700/50 hover:border-slate-600/50"
          )}>
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-blue-500/10 opacity-0 group-focus-within:opacity-100 transition-opacity duration-300" />
            
            {/* Text Input */}
            <div className="flex-1 relative min-w-0">
              <Textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                onKeyDown={handleKeyDown}
                placeholder="Message AdiGon AI..."
                disabled={isLoading}
                className="border-0 bg-transparent text-white placeholder:text-slate-500 focus-visible:ring-0 focus-visible:ring-offset-0 resize-none min-h-[48px] max-h-[120px] leading-relaxed px-4 py-3 text-sm"
                rows={1}
              />
            </div>
            
            {/* Action Buttons */}
            <div className="flex items-center gap-1 pr-2 pb-2">
              {/* Attachment Menu */}
              <Popover open={showAttachmentMenu} onOpenChange={setShowAttachmentMenu}>
                <PopoverTrigger asChild>
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 rounded-lg hover:bg-slate-700/50 text-slate-400 hover:text-slate-200"
                    disabled={isLoading}
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-48 p-2 bg-slate-800 border-slate-700">
                  <div className="space-y-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full justify-start gap-2 text-slate-300 hover:bg-slate-700"
                      onClick={() => {
                        fileInputRef.current?.click();
                        setShowAttachmentMenu(false);
                      }}
                    >
                      <Paperclip className="w-4 h-4" />
                      Attach File
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full justify-start gap-2 text-slate-300 hover:bg-slate-700"
                      onClick={() => {
                        imageInputRef.current?.click();
                        setShowAttachmentMenu(false);
                      }}
                    >
                      <ImageIcon className="w-4 h-4" />
                      Attach Image
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full justify-start gap-2 text-slate-300 hover:bg-slate-700"
                      onClick={() => {
                        setShowVoiceRecorder(true);
                        setShowAttachmentMenu(false);
                      }}
                    >
                      <Mic className="w-4 h-4" />
                      Voice Recording
                    </Button>
                  </div>
                </PopoverContent>
              </Popover>
              
              <Button
                type="submit"
                size="icon"
                disabled={(!input.trim() && attachments.length === 0) || isLoading}
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

        {/* Hidden File Inputs */}
        <input
          ref={fileInputRef}
          type="file"
          onChange={(e) => handleFileUpload(e.target.files)}
          className="hidden"
          accept=".txt,.md,.json,.js,.ts,.tsx,.css,.html,.pdf"
        />
        <input
          ref={imageInputRef}
          type="file"
          onChange={(e) => handleFileUpload(e.target.files, 'image')}
          className="hidden"
          accept="image/*"
        />
      </div>
    </div>
  );
};

export default EnhancedChatInput;
