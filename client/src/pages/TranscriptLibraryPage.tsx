import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../lib/axios';
import { useWorkspace } from '../context/WorkspaceContext';
import {
  FileAudio,
  Search,
  Copy,
  Check,
  Download,
  Trash2,
  MessageSquareText,
  Sparkles,
  Loader2,
  Calendar,
  Music
} from 'lucide-react';

export const TranscriptLibraryPage: React.FC = () => {
  const navigate = useNavigate();
  const { activeWorkspace } = useWorkspace();

  const [transcripts, setTranscripts] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const fetchTranscripts = async () => {
    setLoading(true);
    try {
      const wsId = activeWorkspace?.id;
      const res = await api.get(`/transcripts?search=${encodeURIComponent(searchQuery)}${wsId ? `&workspace_id=${wsId}` : ''}`);
      setTranscripts(res.data.transcripts || []);
    } catch (e) {
      console.error('Error loading transcripts:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTranscripts();
  }, [activeWorkspace, searchQuery]);

  const copyTranscript = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  const downloadTranscript = (item: any) => {
    const textBlob = new Blob([`Audio File: ${item.filename}\nSummary: ${item.ai_summary}\n\nFull Transcript:\n${item.transcript}`], { type: 'text/plain' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(textBlob);
    link.download = `${item.filename}_transcript.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this transcript?')) return;
    try {
      await api.delete(`/transcripts/${id}`);
      setTranscripts(prev => prev.filter(t => t.id !== id));
    } catch (e) {}
  };

  const handleContinueChat = (item: any) => {
    navigate(`/chat?prompt=${encodeURIComponent(`Analyze audio transcript for ${item.filename}: ${item.transcript.substring(0, 300)}...`)}`);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="glass-panel border border-purple-500/20 rounded-3xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center shadow-glow-purple">
            <FileAudio className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-white flex items-center gap-2">
              Audio Transcript Library ({transcripts.length})
            </h1>
            <p className="text-xs text-gray-400 mt-0.5">
              OpenAI Whisper audio dictations and transcripts permanently saved.
            </p>
          </div>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-purple-400 absolute left-3.5 top-3 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search audio transcripts..."
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl text-xs glass-input"
          />
        </div>
      </div>

      {/* Main List View */}
      {loading ? (
        <div className="py-20 flex justify-center text-purple-400">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      ) : transcripts.length === 0 ? (
        <div className="glass-panel rounded-3xl p-12 text-center space-y-3 border border-purple-500/20">
          <FileAudio className="w-12 h-12 text-purple-400 mx-auto opacity-40" />
          <h3 className="text-sm font-extrabold text-white">No Audio Transcripts Found</h3>
          <p className="text-xs text-gray-400 max-w-sm mx-auto">
            Use the voice recorder in AI Chat to automatically transcribe and store audio.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {transcripts.map((t) => (
            <div
              key={t.id}
              className="glass-panel border border-purple-500/20 rounded-3xl p-5 space-y-3 hover:border-purple-400/40 transition-all"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-purple-900/40 border border-purple-400/30 flex items-center justify-center">
                    <Music className="w-4 h-4 text-purple-300" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-sm text-white">{t.filename}</h4>
                    <span className="text-[10px] text-gray-400 font-mono">
                      {new Date(t.created_at).toLocaleString()}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleContinueChat(t)}
                    className="px-3 py-1.5 rounded-xl bg-purple-600/30 hover:bg-purple-600 text-purple-200 hover:text-white border border-purple-500/30 text-xs font-semibold flex items-center gap-1.5 transition-all"
                  >
                    <MessageSquareText className="w-3.5 h-3.5" />
                    <span>Continue Chat</span>
                  </button>

                  <button
                    onClick={() => copyTranscript(t.transcript, t.id)}
                    className="p-2 rounded-xl glass-input text-gray-400 hover:text-white"
                    title="Copy Transcript"
                  >
                    {copiedId === t.id ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>

                  <button
                    onClick={() => downloadTranscript(t)}
                    className="p-2 rounded-xl glass-input text-gray-400 hover:text-white"
                    title="Download Transcript"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => handleDelete(t.id)}
                    className="p-2 rounded-xl glass-input text-gray-400 hover:text-red-400"
                    title="Delete Transcript"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Transcript Text Box */}
              <div className="p-3.5 rounded-2xl bg-dark-900/60 border border-purple-500/10 text-xs text-gray-200 leading-relaxed font-sans whitespace-pre-wrap">
                {t.transcript}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
