
import { useState, useRef, useCallback } from 'react';

interface UseStreamingResponseProps {
  onComplete?: (text: string) => void;
  onUpdate?: (text: string) => void;
}

export const useStreamingResponse = ({ onComplete, onUpdate }: UseStreamingResponseProps = {}) => {
  const [streamingText, setStreamingText] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout>();
  const currentIndexRef = useRef(0);
  const fullTextRef = useRef('');

  const startStreaming = useCallback((fullText: string, speed: number = 30) => {
    fullTextRef.current = fullText;
    currentIndexRef.current = 0;
    setStreamingText('');
    setIsStreaming(true);

    const streamNextChunk = () => {
      const chunkSize = Math.random() > 0.7 ? 2 : 1; // Occasionally write 2 characters
      const nextIndex = Math.min(
        currentIndexRef.current + chunkSize,
        fullTextRef.current.length
      );
      
      const newText = fullTextRef.current.slice(0, nextIndex);
      setStreamingText(newText);
      onUpdate?.(newText);
      
      currentIndexRef.current = nextIndex;

      if (nextIndex < fullTextRef.current.length) {
        const delay = Math.random() * speed + 10; // Add some randomness
        timeoutRef.current = setTimeout(streamNextChunk, delay);
      } else {
        setIsStreaming(false);
        onComplete?.(fullText);
      }
    };

    streamNextChunk();
  }, [onComplete, onUpdate]);

  const stopStreaming = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsStreaming(false);
    if (fullTextRef.current) {
      setStreamingText(fullTextRef.current);
      onComplete?.(fullTextRef.current);
    }
  }, [onComplete]);

  const reset = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setStreamingText('');
    setIsStreaming(false);
    currentIndexRef.current = 0;
    fullTextRef.current = '';
  }, []);

  return {
    streamingText,
    isStreaming,
    startStreaming,
    stopStreaming,
    reset,
  };
};
