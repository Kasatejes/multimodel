import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useVoiceSearch } from '../hooks/useVoiceSearch';
import { Mic, Search, X, Sparkles, Navigation, Command } from 'lucide-react';

interface VoiceSearchBarProps {
  value: string;
  onChange: (val: string) => void;
  onSearch?: (query: string) => void;
  placeholder?: string;
  className?: string;
}

export const VoiceSearchBar: React.FC<VoiceSearchBarProps> = ({
  value,
  onChange,
  onSearch,
  placeholder = 'Voice command or search...',
  className = ''
}) => {
  const navigate = useNavigate();
  const [detectedCommand, setDetectedCommand] = useState<string | null>(null);

  const processVoiceCommand = (text: string) => {
    const lower = text.toLowerCase().trim();

    // 1. Clear Command
    if (lower === 'clear' || lower === 'reset' || lower === 'clear search') {
      onChange('');
      setDetectedCommand('Cleared input');
      setTimeout(() => setDetectedCommand(null), 2000);
      return;
    }

    // 2. Navigation Commands
    if (lower.includes('open dashboard') || lower.includes('go to dashboard')) {
      setDetectedCommand('Navigating to Dashboard');
      setTimeout(() => {
        setDetectedCommand(null);
        navigate('/dashboard');
      }, 1000);
      return;
    }
    if (lower.includes('open chat') || lower.includes('go to chat')) {
      setDetectedCommand('Navigating to AI Chat');
      setTimeout(() => {
        setDetectedCommand(null);
        navigate('/chat');
      }, 1000);
      return;
    }
    if (lower.includes('open vault') || lower.includes('go to vault')) {
      setDetectedCommand('Navigating to Vault');
      setTimeout(() => {
        setDetectedCommand(null);
        navigate('/vault');
      }, 1000);
      return;
    }
    if (lower.includes('open files') || lower.includes('go to files')) {
      setDetectedCommand('Navigating to File Manager');
      setTimeout(() => {
        setDetectedCommand(null);
        navigate('/files');
      }, 1000);
      return;
    }
    if (lower.includes('open study') || lower.includes('go to study')) {
      setDetectedCommand('Navigating to Study Hub');
      setTimeout(() => {
        setDetectedCommand(null);
        navigate('/study');
      }, 1000);
      return;
    }
    if (lower.includes('open analytics') || lower.includes('go to analytics')) {
      setDetectedCommand('Navigating to Analytics');
      setTimeout(() => {
        setDetectedCommand(null);
        navigate('/analytics');
      }, 1000);
      return;
    }
    if (lower.includes('open admin') || lower.includes('go to admin')) {
      setDetectedCommand('Navigating to Admin Panel');
      setTimeout(() => {
        setDetectedCommand(null);
        navigate('/admin');
      }, 1000);
      return;
    }

    // 3. Search Prefix Command (e.g., "search PDF architecture" -> "PDF architecture")
    let searchQuery = text;
    if (lower.startsWith('search for ')) {
      searchQuery = text.substring(11);
    } else if (lower.startsWith('search ')) {
      searchQuery = text.substring(7);
    } else if (lower.startsWith('find ')) {
      searchQuery = text.substring(5);
    }

    onChange(searchQuery);
    if (onSearch && searchQuery.trim()) {
      onSearch(searchQuery);
    }
  };

  const {
    isListening,
    transcript,
    error,
    isSupported,
    toggleListening,
    stopListening
  } = useVoiceSearch({
    onResult: (text) => {
      processVoiceCommand(text);
    }
  });

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && onSearch) {
      onSearch(value);
    }
  };

  return (
    <div className={`relative flex flex-col gap-1 w-full ${className}`}>
      <div className="relative flex items-center w-full">
        <Search className="w-4 h-4 text-purple-400 absolute left-3.5 z-10 pointer-events-none" />

        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={isListening ? 'Listening for voice command...' : placeholder}
          className={`w-full pl-10 pr-20 py-2.5 rounded-2xl text-xs glass-input transition-all ${
            isListening ? 'border-purple-400 ring-2 ring-purple-500/40 bg-purple-950/30' : ''
          }`}
        />

        <div className="absolute right-2 flex items-center gap-1">
          {value && (
            <button
              type="button"
              onClick={() => onChange('')}
              className="p-1 text-gray-400 hover:text-white rounded-lg transition-colors"
              title="Clear search"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}

          {isSupported && (
            <button
              type="button"
              onClick={toggleListening}
              className={`p-2 rounded-xl text-xs font-medium flex items-center justify-center transition-all ${
                isListening
                  ? 'bg-red-600 text-white animate-pulse shadow-glow-purple ring-2 ring-red-400'
                  : 'bg-purple-600/20 text-purple-300 hover:bg-purple-600 hover:text-white border border-purple-500/30'
              }`}
              title={isListening ? 'Stop listening' : 'Speak voice command or search term'}
            >
              <Mic className={`w-4 h-4 ${isListening ? 'animate-bounce text-white' : ''}`} />
            </button>
          )}
        </div>
      </div>

      {/* Voice Command Detected Badge */}
      {detectedCommand && (
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-purple-900/90 border border-purple-400/50 text-[10px] text-purple-100 font-bold shadow-glow-purple animate-pulse">
          <Command className="w-3 h-3 text-purple-300" />
          <span>{detectedCommand}</span>
        </div>
      )}

      {/* Voice Listening Bar */}
      {isListening && !detectedCommand && (
        <div className="flex items-center justify-between px-3 py-1 rounded-xl bg-purple-950/80 border border-purple-500/30 text-[10px] text-purple-200">
          <span className="flex items-center gap-1.5 animate-pulse">
            <Sparkles className="w-3 h-3 text-purple-400" />
            Listening... Say "search [term]" or "open dashboard" / "clear"
          </span>
          <button onClick={stopListening} className="text-purple-300 hover:text-white font-bold">
            Done
          </button>
        </div>
      )}

      {error && (
        <div className="text-[10px] text-red-400 px-3 py-0.5 font-medium">
          ⚠️ {error}
        </div>
      )}
    </div>
  );
};
