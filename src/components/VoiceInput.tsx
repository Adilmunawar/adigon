
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Mic, MicOff, Square } from 'lucide-react';
import { toast } from '@/components/ui/sonner';

interface VoiceInputProps {
  onTranscription: (text: string) => void;
  disabled?: boolean;
}

const VoiceInput: React.FC<VoiceInputProps> = ({ onTranscription, disabled = false }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recognition, setRecognition] = useState<any>(null);

  const handleVoiceInput = async () => {
    if (disabled) return;

    if (isRecording) {
      // Stop recording
      if (recognition) {
        recognition.stop();
      }
      setIsRecording(false);
      return;
    }

    // Check if browser supports speech recognition
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      toast.error('Speech recognition is not supported in this browser. Please try Chrome or Edge.');
      return;
    }

    try {
      // Request microphone permission first
      await navigator.mediaDevices.getUserMedia({ audio: true });
      
      const recognitionInstance = new SpeechRecognition();
      
      recognitionInstance.continuous = false;
      recognitionInstance.interimResults = false;
      recognitionInstance.lang = 'en-US';
      recognitionInstance.maxAlternatives = 1;

      recognitionInstance.onstart = () => {
        setIsRecording(true);
        toast.info('🎤 Listening... Speak now');
      };

      recognitionInstance.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        console.log('Voice transcript:', transcript);
        onTranscription(transcript);
        toast.success('✅ Voice input captured successfully');
      };

      recognitionInstance.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsRecording(false);
        
        switch (event.error) {
          case 'no-speech':
            toast.error('No speech detected. Please try again.');
            break;
          case 'network':
            toast.error('Network error. Please check your connection.');
            break;
          case 'not-allowed':
            toast.error('Microphone access denied. Please allow microphone access and try again.');
            break;
          case 'audio-capture':
            toast.error('No microphone found. Please connect a microphone.');
            break;
          case 'service-not-allowed':
            toast.error('Speech recognition service not allowed.');
            break;
          default:
            toast.error(`Speech recognition failed: ${event.error}`);
        }
      };

      recognitionInstance.onend = () => {
        setIsRecording(false);
        console.log('Speech recognition ended');
      };

      setRecognition(recognitionInstance);
      recognitionInstance.start();

    } catch (error) {
      console.error('Voice input error:', error);
      setIsRecording(false);
      
      if (error instanceof DOMException && error.name === 'NotAllowedError') {
        toast.error('Microphone access denied. Please allow microphone access in your browser settings.');
      } else if (error instanceof DOMException && error.name === 'NotFoundError') {
        toast.error('No microphone found. Please connect a microphone.');
      } else {
        toast.error('Failed to start voice input. Please try again.');
      }
    }
  };

  return (
    <Button
      type="button"
      size="icon"
      variant="ghost"
      onClick={handleVoiceInput}
      disabled={disabled}
      className={`h-10 w-10 rounded-full transition-all duration-200 hover:scale-105 ${
        isRecording 
          ? 'bg-red-500/20 text-red-500 hover:bg-red-500/30 animate-pulse border-2 border-red-500/50' 
          : 'hover:bg-primary/10 hover:text-primary'
      }`}
      title={isRecording ? 'Stop recording' : 'Start voice input'}
    >
      {isRecording ? (
        <Square className="w-4 h-4 fill-current" />
      ) : (
        <Mic className="w-5 h-5" />
      )}
    </Button>
  );
};

export default VoiceInput;
