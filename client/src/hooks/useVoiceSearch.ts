import { useState, useEffect, useRef, useCallback } from 'react';

interface UseVoiceSearchOptions {
  onResult?: (transcript: string) => void;
  onError?: (error: string) => void;
  lang?: string;
}

export const useVoiceSearch = (options: UseVoiceSearchOptions = {}) => {
  const { onResult, onError, lang = 'en-US' } = options;

  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSupported, setIsSupported] = useState(true);

  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setIsSupported(false);
      setError('Voice search is not supported in this browser.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = lang;

    recognition.onstart = () => {
      setIsListening(true);
      setError(null);
    };

    recognition.onresult = (event: any) => {
      let currentTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        currentTranscript += event.results[i][0].transcript;
      }
      setTranscript(currentTranscript);
      if (onResult) {
        onResult(currentTranscript);
      }
    };

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      setIsListening(false);
      let errMsg = 'Voice recognition error occurred.';
      if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
        errMsg = 'Microphone permission denied. Please allow microphone access.';
      } else if (event.error === 'no-speech') {
        errMsg = 'No speech detected. Please try speaking again.';
      }
      setError(errMsg);
      if (onError) {
        onError(errMsg);
      }
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;
  }, [lang, onResult, onError]);

  const startListening = useCallback(() => {
    if (!recognitionRef.current || isListening) return;
    try {
      setTranscript('');
      setError(null);
      recognitionRef.current.start();
    } catch (e: any) {
      console.error('Failed to start speech recognition:', e);
    }
  }, [isListening]);

  const stopListening = useCallback(() => {
    if (!recognitionRef.current || !isListening) return;
    try {
      recognitionRef.current.stop();
    } catch (e: any) {
      console.error('Failed to stop speech recognition:', e);
    }
  }, [isListening]);

  const toggleListening = useCallback(() => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  }, [isListening, startListening, stopListening]);

  return {
    isListening,
    transcript,
    error,
    isSupported,
    startListening,
    stopListening,
    toggleListening,
    setTranscript
  };
};
