
import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Mic, Square, Volume2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { toast } from '@/components/ui/sonner';

interface VoiceRecorderProps {
  onResult: (transcript: string) => void;
  onStop: () => void;
}

const VoiceRecorder: React.FC<VoiceRecorderProps> = ({ onResult, onStop }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [duration, setDuration] = useState(0);
  const [recognition, setRecognition] = useState<any>(null);
  const intervalRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    startRecording();
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const startRecording = async () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      toast.error('Speech recognition is not supported in this browser');
      onStop();
      return;
    }

    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
      
      const recognitionInstance = new SpeechRecognition();
      recognitionInstance.continuous = true;
      recognitionInstance.interimResults = true;
      recognitionInstance.lang = 'en-US';

      recognitionInstance.onstart = () => {
        setIsRecording(true);
        intervalRef.current = setInterval(() => {
          setDuration(prev => prev + 1);
        }, 1000);
      };

      recognitionInstance.onresult = (event: any) => {
        let finalTranscript = '';
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          }
        }
        
        if (finalTranscript) {
          onResult(finalTranscript);
          stopRecording();
        }
      };

      recognitionInstance.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        toast.error('Voice recognition failed');
        stopRecording();
      };

      recognitionInstance.onend = () => {
        stopRecording();
      };

      setRecognition(recognitionInstance);
      recognitionInstance.start();

    } catch (error) {
      console.error('Failed to start recording:', error);
      toast.error('Failed to access microphone');
      onStop();
    }
  };

  const stopRecording = () => {
    if (recognition) {
      recognition.stop();
    }
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    setIsRecording(false);
    onStop();
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Card className="bg-slate-800/60 backdrop-blur-xl border-slate-700/50">
      <CardContent className="p-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-red-500/20 rounded-full">
              <Mic className={`w-4 h-4 text-red-400 ${isRecording ? 'animate-pulse' : ''}`} />
            </div>
            <div>
              <p className="text-sm text-slate-300">Recording...</p>
              <p className="text-xs text-slate-500">{formatTime(duration)}</p>
            </div>
          </div>
          
          <div className="flex-1">
            <Progress 
              value={Math.min((duration / 30) * 100, 100)} 
              className="h-2" 
            />
          </div>
          
          <Button
            onClick={stopRecording}
            size="sm"
            variant="outline"
            className="border-slate-600 hover:bg-slate-700"
          >
            <Square className="w-4 h-4 mr-2" />
            Stop
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default VoiceRecorder;
