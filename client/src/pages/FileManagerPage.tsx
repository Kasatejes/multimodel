import React, { useState, useEffect } from 'react';
import { useWorkspace } from '../context/WorkspaceContext';
import { api } from '../lib/axios';
import { FileUploadModal } from '../components/FileUploadModal';
import {
  FolderGit2,
  UploadCloud,
  FileText,
  Image as ImageIcon,
  Music,
  Video,
  Search,
  Star,
  Trash2,
  Eye,
  Sparkles,
  Loader2,
  X,
  Layers
} from 'lucide-react';

export const FileManagerPage: React.FC = () => {
  const { activeWorkspace } = useWorkspace();

  const [files, setFiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedFileForSummary, setSelectedFileForSummary] = useState<any | null>(null);
  const [summarizingId, setSummarizingId] = useState<string | null>(null);

  const fetchFiles = async () => {
    try {
      setLoading(true);
      const wsId = activeWorkspace?.id;
      const res = await api.get(`/files${wsId ? `?workspace_id=${wsId}` : ''}`);
      setFiles(res.data.files || []);
    } catch (e) {
      console.error('Failed to fetch files:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFiles();
  }, [activeWorkspace]);

  const handleToggleFavorite = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const res = await api.patch(`/files/${id}/favorite`);
      setFiles((prev) => prev.map((f) => (f.id === id ? { ...f, is_favorite: res.data.is_favorite } : f)));
    } catch (e) {}
  };

  const handleDeleteFile = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this file?')) return;
    try {
      await api.delete(`/files/${id}`);
      setFiles((prev) => prev.filter((f) => f.id !== id));
    } catch (e) {}
  };

  const handleGenerateSummary = async (file: any, e: React.MouseEvent) => {
    e.stopPropagation();
    setSummarizingId(file.id);
    try {
      const res = await api.post('/ai/summarize', { file_id: file.id });
      const updatedSummary = res.data.summary;
      setFiles((prev) => prev.map((f) => (f.id === file.id ? { ...f, ai_summary: updatedSummary } : f)));
      setSelectedFileForSummary({ ...file, ai_summary: updatedSummary });
    } catch (e) {
      console.error('Summarize error:', e);
    } finally {
      setSummarizingId(null);
    }
  };

  const filteredFiles = files.filter((f) => {
    const matchesType = filterType === 'all' || f.file_type === filterType;
    const matchesQuery = f.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesQuery;
  });

  const getFileIcon = (type: string) => {
    if (type === 'image') return <ImageIcon className="w-5 h-5 text-pink-400" />;
    if (type === 'audio') return <Music className="w-5 h-5 text-amber-400" />;
    if (type === 'video') return <Video className="w-5 h-5 text-cyan-400" />;
    return <FileText className="w-5 h-5 text-purple-400" />;
  };

  return (
    <div className="space-y-6 pb-8 animate-fadeIn">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white flex items-center gap-2">
            <FolderGit2 className="w-6 h-6 text-purple-400" /> Workspace File Manager
          </h1>
          <p className="text-xs text-gray-400">
            Files in <span className="text-purple-300 font-semibold">{activeWorkspace?.name || 'General Workspace'}</span>
          </p>
        </div>

        <button
          onClick={() => setShowUploadModal(true)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs shadow-glow-purple transition-all"
        >
          <UploadCloud className="w-4 h-4" />
          <span>Upload Multimodal File</span>
        </button>
      </div>

      {/* Filter Tabs & Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-1 overflow-x-auto pb-1 max-w-full">
          {['all', 'pdf', 'docx', 'image', 'audio', 'video', 'txt', 'csv'].map((t) => (
            <button
              key={t}
              onClick={() => setFilterType(t)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all ${
                filterType === t
                  ? 'bg-purple-600 text-white shadow-glow-purple'
                  : 'bg-dark-900/60 text-gray-400 hover:text-white border border-purple-500/20'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-64">
          <Search className="w-4 h-4 text-purple-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search files..."
            className="w-full pl-9 pr-3 py-1.5 rounded-xl glass-input text-xs"
          />
        </div>
      </div>

      {/* File Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-purple-400 animate-spin" />
        </div>
      ) : filteredFiles.length === 0 ? (
        <div className="text-center py-16 glass-panel border border-purple-500/20 rounded-3xl space-y-3">
          <FolderGit2 className="w-10 h-10 text-purple-400/50 mx-auto" />
          <h3 className="text-sm font-bold text-white">No files found</h3>
          <p className="text-xs text-gray-400 max-w-sm mx-auto">
            Upload PDFs, docx files, audio, images, or spreadsheets to begin multimodal AI analysis.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredFiles.map((file) => (
            <div
              key={file.id}
              className="p-5 rounded-3xl glass-panel border border-purple-500/20 glass-panel-hover flex flex-col justify-between space-y-4 relative group"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-9 h-9 rounded-xl bg-purple-600/20 border border-purple-400/30 flex items-center justify-center">
                      {getFileIcon(file.file_type)}
                    </div>
                    <div>
                      <span className="text-[9px] uppercase px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 font-bold">
                        {file.file_type}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button onClick={(e) => handleToggleFavorite(file.id, e)} className="p-1 hover:text-amber-300">
                      <Star className={`w-4 h-4 ${file.is_favorite ? 'text-amber-400 fill-amber-400' : 'text-gray-500'}`} />
                    </button>
                    <button onClick={(e) => handleDeleteFile(file.id, e)} className="p-1 hover:text-red-400">
                      <Trash2 className="w-4 h-4 text-gray-500" />
                    </button>
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-bold text-white truncate" title={file.name}>
                    {file.name}
                  </h4>
                  <p className="text-[10px] text-gray-400 mt-0.5">
                    {(file.size_bytes / (1024 * 1024)).toFixed(2)} MB • {new Date(file.created_at).toLocaleDateString()}
                  </p>
                </div>

                <p className="text-[11px] text-gray-300 line-clamp-3 bg-dark-950/60 p-2.5 rounded-xl border border-purple-500/10">
                  {file.ai_summary || 'Click AI Summarize to extract core document takeaways.'}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 border-t border-purple-500/20 flex items-center justify-between gap-2">
                <button
                  onClick={(e) => handleGenerateSummary(file, e)}
                  disabled={summarizingId === file.id}
                  className="flex-1 py-1.5 px-2 rounded-xl bg-purple-600/30 hover:bg-purple-600 text-purple-200 hover:text-white font-semibold text-[11px] flex items-center justify-center gap-1.5 transition-all"
                >
                  {summarizingId === file.id ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Sparkles className="w-3.5 h-3.5 text-purple-300" />
                  )}
                  <span>AI Summarize</span>
                </button>

                {file.public_url && (
                  <a
                    href={file.public_url}
                    target="_blank"
                    rel="noreferrer"
                    className="p-1.5 rounded-xl bg-dark-900 border border-purple-500/30 text-gray-300 hover:text-white"
                    title="View Original File"
                  >
                    <Eye className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Summary Modal */}
      {selectedFileForSummary && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
          <div className="w-full max-w-2xl glass-panel rounded-3xl border border-purple-500/40 p-6 shadow-2xl relative max-h-[85vh] overflow-y-auto">
            <button
              onClick={() => setSelectedFileForSummary(null)}
              className="absolute top-4 right-4 p-1.5 text-gray-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-5 h-5 text-purple-400" />
              <h3 className="text-lg font-extrabold text-white">AI Executive Summary</h3>
            </div>

            <h4 className="text-xs font-bold text-purple-300 mb-4">{selectedFileForSummary.name}</h4>

            <div className="prose prose-invert prose-xs whitespace-pre-wrap text-gray-200 leading-relaxed font-sans bg-dark-950 p-4 rounded-2xl border border-purple-500/20">
              {selectedFileForSummary.ai_summary}
            </div>
          </div>
        </div>
      )}

      {showUploadModal && <FileUploadModal onClose={() => setShowUploadModal(false)} onSuccess={fetchFiles} />}
    </div>
  );
};
