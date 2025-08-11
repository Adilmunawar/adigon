
import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Square, Play, Pause } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from '@/components/ui/sonner';
import { voiceService, VoiceRecordingResult } from '@/services/voiceService';

interface VoiceRecorderProps {
  onRecordingComplete: (result: VoiceRecordingResult) => void;
  onCancel: () => void;
  className?: string;
}

const VoiceRecorder: React.FC<VoiceRecorderProps> = ({
  onRecordingComplete,
  onCancel,
  className = ''
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const intervalRef = useRef<NodeJS.Timeout>();
  const audioRef = useRef<HTMLAudioElement>();

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const startRecording = async () => {
    try {
      const started = await voiceService.startRecording();
      if (started) {
        setIsRecording(true);
        setRecordingTime(0);
        intervalRef.current = setInterval(() => {
          setRecordingTime(prev => prev + 1);
        }, 1000);
        toast.success('Recording started');
      } else {
        toast.error('Failed to start recording. Please check microphone permissions.');
      }
    } catch (error) {
      toast.error('Microphone access denied');
    }
  };

  const stopRecording = async () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    
    setIsRecording(false);
    const result = await voiceService.stopRecording();
    
    if (result.success && result.audioBlob) {
      setAudioBlob(result.audioBlob);
      toast.success('Recording completed');
    } else {
      toast.error('Recording failed');
    }
  };

  const playRecording = () => {
    if (audioBlob && !isPlaying) {
      const url = URL.createObjectURL(audioBlob);
      audioRef.current = new Audio(url);
      audioRef.current.onended = () => setIsPlaying(false);
      audioRef.current.play();
      setIsPlaying(true);
    } else if (audioRef.current && isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  };

  const confirmRecording = () => {
    if (audioBlob) {
      onRecordingComplete({
        success: true,
        audioBlob,
        duration: recordingTime
      });
    }
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Card className={`bg-slate-800/60 border-slate-700/50 ${className}`}>
      <CardContent className="p-4">
        <div className="space-y-4">
          {/* Recording Controls */}
          <div className="flex items-center justify-center gap-4">
            {!isRecording && !audioBlob && (
              <Button
                onClick={startRecording}
                className="bg-red-500 hover:bg-red-600 text-white rounded-full p-4"
                size="icon"
              >
                <Mic className="w-6 h-6" />
              </Button>
            )}
            
            {isRecording && (
              <>
                <div className="flex items-center gap-2 text-red-400">
                  <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                  <span className="font-mono text-lg">{formatTime(recordingTime)}</span>
                </div>
                <Button
                  onClick={stopRecording}
                  className="bg-slate-600 hover:bg-slate-700 text-white rounded-full p-4"
                  size="icon"
                >
                  <Square className="w-6 h-6" />
                </Button>
              </>
            )}
          </div>

          {/* Playback Controls */}
          {audioBlob && !isRecording && (
            <div className="space-y-3">
              <div className="flex items-center justify-center gap-3">
                <Button
                  onClick={playRecording}
                  variant="outline"
                  size="icon"
                  className="border-slate-600 hover:bg-slate-700"
                >
                  {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                </Button>
                <span className="text-sm text-slate-400">
                  Duration: {formatTime(recordingTime)}
                </span>
              </div>
              
              <div className="flex gap-2">
                <Button
                  onClick={confirmRecording}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  Use Recording
                </Button>
                <Button
                  onClick={() => {
                    setAudioBlob(null);
                    setRecordingTime(0);
                  }}
                  variant="outline"
                  className="border-slate-600 hover:bg-slate-700"
                >
                  Re-record
                </Button>
              </div>
            </div>
          )}

          {/* Cancel Button */}
          <Button
            onClick={onCancel}
            variant="ghost"
            className="w-full text-slate-400 hover:text-slate-200"
          >
            Cancel
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default VoiceRecorder;
