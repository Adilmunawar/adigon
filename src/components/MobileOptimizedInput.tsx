import React, { useState } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send, Paperclip, X, Image, Mic, MicOff, Code2, Search, Sparkles } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useIsMobile } from "@/hooks/use-mobile";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface MobileOptimizedInputProps {
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
  onVoiceTranscription: (text: string) => void;
}

const MobileOptimizedInput = ({
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
}: MobileOptimizedInputProps) => {
  const isMobile = useIsMobile();
  const [isVoiceRecording, setIsVoiceRecording] = useState(false);
  const [showModePanel, setShowModePanel] = useState(false);

  const handleVoiceToggle = () => {
    if (isVoiceRecording) {
      setIsVoiceRecording(false);
      // Stop recording logic here
    } else {
      setIsVoiceRecording(true);
      // Start recording logic here
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
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
      <div className="sticky bottom-0 left-0 right-0 border-t border-border/20 bg-gradient-to-t from-background via-background/98 to-background/95 backdrop-blur-xl">
        <div className="container mx-auto px-4 py-6">
          <div className="bg-card/60 border border-border/30 rounded-3xl p-8 text-center backdrop-blur-sm shadow-xl">
            <div className="w-16 h-16 mx-auto mb-4 bg-primary/10 rounded-full flex items-center justify-center">
              <Sparkles className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">Welcome to AdiGon AI</h3>
            <p className="text-muted-foreground">Please sign in to start your conversation</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="sticky bottom-0 left-0 right-0 border-t border-border/10 bg-gradient-to-t from-background via-background/98 to-background/95 backdrop-blur-xl">
        <div className="container mx-auto px-3 sm:px-6 py-3 sm:py-4 space-y-3 sm:space-y-4">
          
          {/* AI Mode Toggles - Mobile Optimized */}
          {isMobile ? (
            <div className="flex items-center justify-between">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowModePanel(!showModePanel)}
                className="text-xs"
              >
                <Code2 className="w-4 h-4 mr-1" />
                AI Modes
              </Button>
              <div className="flex gap-2">
                {isCoderMode && <Badge variant="secondary" className="text-xs">Developer</Badge>}
                {isDeepSearchMode && <Badge variant="secondary" className="text-xs">Deep Search</Badge>}
              </div>
            </div>
          ) : (
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
                <Tooltip>
                  <TooltipTrigger asChild>
                    <label htmlFor="coder-mode" className="font-medium text-foreground group-hover:text-blue-500 transition-colors cursor-pointer flex items-center gap-2">
                      <Code2 className="w-4 h-4" />
                      Developer Mode
                    </label>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Generate complete, production-ready code with detailed explanations</p>
                  </TooltipContent>
                </Tooltip>
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
                <Tooltip>
                  <TooltipTrigger asChild>
                    <label htmlFor="search-mode" className="font-medium text-foreground group-hover:text-emerald-500 transition-colors cursor-pointer flex items-center gap-2">
                      <Search className="w-4 h-4" />
                      Deep Search
                    </label>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Search the web for comprehensive, cited information</p>
                  </TooltipContent>
                </Tooltip>
              </div>
            </div>
          )}

          {/* Mobile Mode Panel */}
          {isMobile && showModePanel && (
            <div className="bg-card/80 border border-border/30 rounded-2xl p-4 backdrop-blur-sm space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Code2 className="w-4 h-4 text-blue-500" />
                  <span className="text-sm font-medium">Developer Mode</span>
                </div>
                <Switch
                  checked={isCoderMode}
                  onCheckedChange={setIsCoderMode}
                  className="data-[state=checked]:bg-blue-500"
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Search className="w-4 h-4 text-emerald-500" />
                  <span className="text-sm font-medium">Deep Search</span>
                </div>
                <Switch
                  checked={isDeepSearchMode}
                  onCheckedChange={setIsDeepSearchMode}
                  className="data-[state=checked]:bg-emerald-500"
                />
              </div>
            </div>
          )}

          {/* Developer Mode Enhancement */}
          {isCoderMode && (
            <div className="bg-gradient-to-r from-blue-500/10 to-blue-600/10 border border-blue-500/20 rounded-2xl p-4 backdrop-blur-sm">
              <div className="flex items-start gap-3">
                <Code2 className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
                <div className="space-y-2 text-sm">
                  <p className="font-medium text-blue-400">Developer Mode Active</p>
                  <p className="text-muted-foreground text-xs leading-relaxed">
                    I'll generate complete, production-ready applications with:
                    • Full TypeScript implementations with proper types
                    • Responsive UI with Tailwind CSS and accessibility features
                    • Error handling, loading states, and edge cases
                    • Modern React patterns and best practices
                    • Multiple organized files and proper architecture
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Attached File Display */}
          {attachedFile && (
            <div className="bg-gradient-to-r from-muted/40 to-muted/20 border border-border/30 rounded-2xl p-3 sm:p-4 backdrop-blur-sm shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Paperclip className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
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
                  className="h-8 w-8 rounded-full hover:bg-destructive/10 hover:text-destructive transition-colors flex-shrink-0"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}

          {/* Main Input Form */}
          <form onSubmit={onFormSubmit} className="relative">
            <div className="bg-card/70 border border-border/20 rounded-3xl shadow-2xl backdrop-blur-xl overflow-hidden group hover:shadow-3xl transition-all duration-300 hover:border-primary/20">
              <div className="flex items-end gap-2 p-3 sm:p-4">
                {/* Text Input */}
                <div className="flex-1 relative">
                  {isMobile ? (
                    <Textarea
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onPaste={handlePaste}
                      placeholder="Message AdiGon AI..."
                      disabled={isLoading}
                      className="border-0 bg-transparent text-base placeholder:text-muted-foreground/70 focus-visible:ring-0 focus-visible:ring-offset-0 resize-none min-h-[44px] max-h-32"
                      rows={1}
                    />
                  ) : (
                    <Textarea
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onPaste={handlePaste}
                      placeholder="Message AdiGon AI... (Ctrl+V to paste images)"
                      disabled={isLoading}
                      className="border-0 bg-transparent text-lg placeholder:text-muted-foreground/70 focus-visible:ring-0 focus-visible:ring-offset-0 resize-none min-h-[48px] max-h-40"
                      rows={1}
                    />
                  )}
                </div>
                
                {/* Action Buttons */}
                <div className="flex items-center gap-1">
                  {!isMobile && (
                    <>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            type="button"
                            size="icon"
                            variant="ghost"
                            onClick={handleAttachFileClick}
                            className="h-9 w-9 sm:h-10 sm:w-10 rounded-full hover:bg-primary/10 hover:text-primary transition-all duration-200 hover:scale-105"
                            disabled={isLoading}
                          >
                            <Paperclip className="w-4 h-4 sm:w-5 sm:h-5" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Attach file</TooltipContent>
                      </Tooltip>
                      
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            type="button"
                            size="icon"
                            variant="ghost"
                            onClick={handleVoiceToggle}
                            className={`h-9 w-9 sm:h-10 sm:w-10 rounded-full transition-all duration-200 hover:scale-105 ${
                              isVoiceRecording 
                                ? 'bg-red-500/20 text-red-500 hover:bg-red-500/30' 
                                : 'hover:bg-primary/10 hover:text-primary'
                            }`}
                            disabled={isLoading}
                          >
                            {isVoiceRecording ? (
                              <MicOff className="w-4 h-4 sm:w-5 sm:h-5" />
                            ) : (
                              <Mic className="w-4 h-4 sm:w-5 sm:h-5" />
                            )}
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          {isVoiceRecording ? 'Stop recording' : 'Voice input'}
                        </TooltipContent>
                      </Tooltip>
                      
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            type="button"
                            size="icon"
                            variant="ghost"
                            onClick={handleImageGeneration}
                            className="h-9 w-9 sm:h-10 sm:w-10 rounded-full hover:bg-primary/10 hover:text-primary transition-all duration-200 hover:scale-105"
                            disabled={isLoading}
                          >
                            <Image className="w-4 h-4 sm:w-5 sm:h-5" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Generate image</TooltipContent>
                      </Tooltip>
                    </>
                  )}
                  
                  <Button
                    type="submit"
                    size="icon"
                    disabled={(!input.trim() && !attachedFile) || isLoading}
                    className="h-9 w-9 sm:h-10 sm:w-10 rounded-full bg-gradient-to-r from-primary to-primary/80 text-primary-foreground hover:from-primary/90 hover:to-primary/70 transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none ml-1 sm:ml-2"
                  >
                    {isLoading ? (
                      <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                    ) : (
                      <Send className="w-4 h-4 sm:w-5 sm:h-5" />
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </form>

          {/* Mobile Action Bar */}
          {isMobile && (
            <div className="flex items-center justify-center gap-2 py-2">
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={handleAttachFileClick}
                className="flex items-center gap-2 text-xs"
                disabled={isLoading}
              >
                <Paperclip className="w-4 h-4" />
                Attach
              </Button>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={handleVoiceToggle}
                className={`flex items-center gap-2 text-xs ${
                  isVoiceRecording ? 'text-red-500' : ''
                }`}
                disabled={isLoading}
              >
                {isVoiceRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                {isVoiceRecording ? 'Recording' : 'Voice'}
              </Button>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={handleImageGeneration}
                className="flex items-center gap-2 text-xs"
                disabled={isLoading}
              >
                <Image className="w-4 h-4" />
                Image
              </Button>
            </div>
          )}

          <input
            ref={fileInputRef}
            type="file"
            onChange={handleFileSelect}
            className="hidden"
            accept="image/*,.txt,.md,.json,.js,.ts,.tsx,.css,.html,.pdf"
          />
        </div>
      </div>
    </TooltipProvider>
  );
};

export default MobileOptimizedInput;
