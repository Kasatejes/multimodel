import React, { useState, useEffect } from 'react';
import { api } from '../lib/axios';
import { Search, X, FileText, MessageSquare, BookOpen, ChevronRight, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface GlobalSearchModalProps {
  onClose: () => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({ onClose }) => {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<{ files: any[]; chats: any[]; notes: any[] }>({
    files: [],
    chats: [],
    notes: []
  });

  useEffect(() => {
    if (!query.trim()) {
      setResults({ files: [], chats: [], notes: [] });
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await api.get(`/search?q=${encodeURIComponent(query)}`);
        setResults(res.data.results || { files: [], chats: [], notes: [] });
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4 bg-black/75 backdrop-blur-md">
      <div className="w-full max-w-2xl glass-panel rounded-2xl border border-purple-500/40 shadow-2xl overflow-hidden">
        {/* Search Header Input */}
        <div className="flex items-center px-4 py-3 border-b border-purple-500/20 bg-dark-900/60">
          <Search className="w-5 h-5 text-purple-400 mr-3" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search files, chats, notes, and study sets..."
            autoFocus
            className="w-full bg-transparent border-none text-white text-sm focus:outline-none placeholder-gray-500"
          />
          {loading ? (
            <Loader2 className="w-4 h-4 text-purple-400 animate-spin mr-2" />
          ) : (
            <button onClick={onClose} className="p-1 text-gray-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Results list */}
        <div className="p-4 max-h-96 overflow-y-auto space-y-4">
          {!query.trim() && (
            <div className="text-center py-8 text-xs text-gray-500">
              Type anything to search across your multimodal workspace documents and AI chats.
            </div>
          )}

          {/* Files section */}
          {results.files.length > 0 && (
            <div>
              <p className="text-[10px] uppercase font-bold text-purple-400 tracking-wider mb-2 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5" /> Files ({results.files.length})
              </p>
              <div className="space-y-1.5">
                {results.files.map((file) => (
                  <div
                    key={file.id}
                    onClick={() => {
                      onClose();
                      navigate('/files');
                    }}
                    className="p-2.5 rounded-xl bg-dark-900/40 hover:bg-purple-900/30 border border-purple-500/10 cursor-pointer flex items-center justify-between group transition-all"
                  >
                    <div>
                      <h4 className="text-xs font-semibold text-gray-200 group-hover:text-purple-300">{file.name}</h4>
                      <p className="text-[10px] text-gray-400 truncate max-w-md">{file.ai_summary || file.file_type}</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-500 group-hover:text-purple-300" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Chats section */}
          {results.chats.length > 0 && (
            <div>
              <p className="text-[10px] uppercase font-bold text-purple-400 tracking-wider mb-2 flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5" /> AI Chats ({results.chats.length})
              </p>
              <div className="space-y-1.5">
                {results.chats.map((chat) => (
                  <div
                    key={chat.id}
                    onClick={() => {
                      onClose();
                      navigate(`/chat?id=${chat.id}`);
                    }}
                    className="p-2.5 rounded-xl bg-dark-900/40 hover:bg-purple-900/30 border border-purple-500/10 cursor-pointer flex items-center justify-between group transition-all"
                  >
                    <h4 className="text-xs font-semibold text-gray-200 group-hover:text-purple-300">{chat.title}</h4>
                    <ChevronRight className="w-4 h-4 text-gray-500 group-hover:text-purple-300" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Notes section */}
          {results.notes.length > 0 && (
            <div>
              <p className="text-[10px] uppercase font-bold text-purple-400 tracking-wider mb-2 flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5" /> Notes ({results.notes.length})
              </p>
              <div className="space-y-1.5">
                {results.notes.map((note) => (
                  <div
                    key={note.id}
                    onClick={() => {
                      onClose();
                      navigate('/study');
                    }}
                    className="p-2.5 rounded-xl bg-dark-900/40 hover:bg-purple-900/30 border border-purple-500/10 cursor-pointer flex items-center justify-between group transition-all"
                  >
                    <h4 className="text-xs font-semibold text-gray-200 group-hover:text-purple-300">{note.title}</h4>
                    <ChevronRight className="w-4 h-4 text-gray-500 group-hover:text-purple-300" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {query.trim() && !loading && results.files.length === 0 && results.chats.length === 0 && results.notes.length === 0 && (
            <div className="text-center py-6 text-xs text-gray-400">
              No matching files or chats found for "{query}".
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
