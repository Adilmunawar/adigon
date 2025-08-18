
import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Square, Play, Pause, Download } from 'lucide-react';
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
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const intervalRef = useRef<NodeJS.Timeout>();
  const audioRef = useRef<HTMLAudioElement>();

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, [audioUrl]);

  const startRecording = async () => {
    try {
      // Request microphone permission
      await navigator.mediaDevices.getUserMedia({ audio: true });
      
      const started = await voiceService.startRecording({
        sampleRate: 44100,
        channelCount: 1,
        echoCancellation: true,
        noiseSuppression: true
      });
      
      if (started) {
        setIsRecording(true);
        setRecordingTime(0);
        setAudioBlob(null);
        if (audioUrl) {
          URL.revokeObjectURL(audioUrl);
          setAudioUrl(null);
        }
        
        intervalRef.current = setInterval(() => {
          setRecordingTime(prev => prev + 1);
        }, 1000);
        
        toast.success('🎤 Recording started');
      } else {
        toast.error('Failed to start recording. Please check microphone permissions.');
      }
    } catch (error) {
      console.error('Recording error:', error);
      if (error instanceof DOMException && error.name === 'NotAllowedError') {
        toast.error('Microphone access denied. Please allow microphone access.');
      } else {
        toast.error('Failed to access microphone. Please try again.');
      }
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
      const url = URL.createObjectURL(result.audioBlob);
      setAudioUrl(url);
      toast.success('✅ Recording completed');
    } else {
      toast.error('Recording failed: ' + (result.error || 'Unknown error'));
    }
  };

  const playRecording = () => {
    if (audioUrl && !isPlaying) {
      audioRef.current = new Audio(audioUrl);
      audioRef.current.onended = () => setIsPlaying(false);
      audioRef.current.onerror = () => {
        setIsPlaying(false);
        toast.error('Failed to play recording');
      };
      audioRef.current.play().then(() => {
        setIsPlaying(true);
      }).catch(() => {
        toast.error('Failed to play recording');
      });
    } else if (audioRef.current && isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  };

  const downloadRecording = () => {
    if (audioBlob) {
      const url = URL.createObjectURL(audioBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `voice-recording-${Date.now()}.webm`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success('Recording downloaded');
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
    <Card className={`bg-slate-800/60 border-slate-700/50 backdrop-blur-sm ${className}`}>
      <CardContent className="p-6">
        <div className="space-y-6">
          {/* Recording Status */}
          <div className="text-center">
            <h3 className="text-lg font-semibold text-slate-200 mb-2">Voice Recorder</h3>
            {isRecording && (
              <div className="flex items-center justify-center gap-2 text-red-400">
                <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                <span className="font-mono text-xl">{formatTime(recordingTime)}</span>
              </div>
            )}
          </div>

          {/* Recording Controls */}
          <div className="flex items-center justify-center gap-4">
            {!isRecording && !audioBlob && (
              <Button
                onClick={startRecording}
                className="bg-red-500 hover:bg-red-600 text-white rounded-full w-16 h-16 shadow-lg hover:shadow-xl transition-all duration-200"
                size="icon"
              >
                <Mic className="w-8 h-8" />
              </Button>
            )}
            
            {isRecording && (
              <Button
                onClick={stopRecording}
                className="bg-slate-600 hover:bg-slate-700 text-white rounded-full w-16 h-16 shadow-lg"
                size="icon"
              >
                <Square className="w-8 h-8 fill-current" />
              </Button>
            )}
          </div>

          {/* Playback Controls */}
          {audioBlob && !isRecording && (
            <div className="space-y-4">
              <div className="flex items-center justify-center gap-3">
                <Button
                  onClick={playRecording}
                  variant="outline"
                  size="icon"
                  className="border-slate-600 hover:bg-slate-700 w-12 h-12"
                >
                  {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                </Button>
                
                <Button
                  onClick={downloadRecording}
                  variant="outline"
                  size="icon"
                  className="border-slate-600 hover:bg-slate-700 w-12 h-12"
                >
                  <Download className="w-5 h-5" />
                </Button>
                
                <div className="text-sm text-slate-400 ml-2">
                  {formatTime(recordingTime)}
                </div>
              </div>
              
              {/* Action Buttons */}
              <div className="flex gap-3">
                <Button
                  onClick={confirmRecording}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                >
                  Use Recording
                </Button>
                <Button
                  onClick={() => {
                    setAudioBlob(null);
                    if (audioUrl) {
                      URL.revokeObjectURL(audioUrl);
                      setAudioUrl(null);
                    }
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
            className="w-full text-slate-400 hover:text-slate-200 hover:bg-slate-700/50"
          >
            Cancel
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default VoiceRecorder;
