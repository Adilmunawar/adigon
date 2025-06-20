
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Mic, MicOff } from 'lucide-react';
import { toast } from '@/components/ui/sonner';

interface VoiceInputProps {
  onTranscription: (text: string) => void;
  disabled?: boolean;
}

const VoiceInput: React.FC<VoiceInputProps> = ({ onTranscription, disabled = false }) => {
  const [isRecording, setIsRecording] = useState(false);

  const handleVoiceInput = async () => {
    if (disabled) return;

    if (isRecording) {
      // Stop recording
      setIsRecording(false);
      toast.info('Voice recording stopped');
      return;
    }

    // Check if browser supports speech recognition
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      toast.error('Speech recognition is not supported in this browser');
      return;
    }

    try {
      setIsRecording(true);
      
      // Create speech recognition instance
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        toast.info('Listening... Speak now');
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        onTranscription(transcript);
        toast.success('Voice input captured successfully');
        setIsRecording(false);
      };

      recognition.onerror = (event: any) => {
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
            toast.error('Microphone access denied. Please allow microphone access.');
            break;
          default:
            toast.error('Speech recognition failed. Please try again.');
        }
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      // Start recognition
      recognition.start();

    } catch (error) {
      console.error('Voice input error:', error);
      setIsRecording(false);
      toast.error('Failed to start voice input');
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
          ? 'bg-red-500/10 text-red-500 hover:bg-red-500/20 animate-pulse' 
          : 'hover:bg-primary/10 hover:text-primary'
      }`}
    >
      {isRecording ? (
        <MicOff className="w-5 h-5" />
      ) : (
        <Mic className="w-5 h-5" />
      )}
    </Button>
  );
};

export default VoiceInput;
