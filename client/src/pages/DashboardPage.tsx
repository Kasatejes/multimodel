import React, { useState, useEffect } from 'react';
import { useWorkspace } from '../context/WorkspaceContext';
import { useAuth } from '../context/AuthContext';
import { api } from '../lib/axios';
import { useNavigate } from 'react-router-dom';
import { FileUploadModal } from '../components/FileUploadModal';
import {
  FileText,
  MessageSquareText,
  Sparkles,
  BookOpen,
  HelpCircle,
  Clock,
  Layers,
  UploadCloud,
  ArrowRight,
  TrendingUp,
  Brain,
  HardDrive
} from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const { activeWorkspace } = useWorkspace();
  const navigate = useNavigate();

  const [showUploadModal, setShowUploadModal] = useState(false);
  const [stats, setStats] = useState({
    total_files: 0,
    total_chats: 0,
    total_notes: 0,
    storage_mb: '0'
  });
  const [recentFiles, setRecentFiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const wsId = activeWorkspace?.id;
      const [analyticsRes, filesRes] = await Promise.all([
        api.get(`/analytics${wsId ? `?workspace_id=${wsId}` : ''}`),
        api.get(`/files${wsId ? `?workspace_id=${wsId}` : ''}`)
      ]);

      setStats(analyticsRes.data.summary || { total_files: 0, total_chats: 0, total_notes: 0, storage_mb: '0' });
      setRecentFiles((filesRes.data.files || []).slice(0, 4));
    } catch (e) {
      console.error('Failed to load dashboard data:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [activeWorkspace]);

  return (
    <div className="space-y-6 animate-fadeIn pb-8">
      {/* Welcome Banner */}
      <div className="relative p-6 lg:p-8 rounded-3xl glass-panel border border-purple-500/30 overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-72 h-72 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-purple-400 uppercase tracking-widest">
              <Layers className="w-4 h-4" /> Active Workspace: {activeWorkspace?.name || 'General Workspace'}
            </div>
            <h1 className="text-2xl lg:text-3xl font-extrabold text-white">
              Welcome back, <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-300 via-white to-purple-400">{user?.full_name}</span>!
            </h1>
            <p className="text-xs text-gray-300 max-w-xl">
              Upload multimodal documents, PDFs, images, or audio to chat with Google Gemini AI, generate notes, flashcards, quizzes, and timeline milestones.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowUploadModal(true)}
              className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs shadow-glow-purple transition-all transform hover:scale-[1.02]"
            >
              <UploadCloud className="w-4 h-4" />
              <span>Upload Multimodal File</span>
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl glass-panel border border-purple-500/20 glass-panel-hover flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-600/20 border border-purple-400/30 flex items-center justify-center shrink-0">
            <FileText className="w-6 h-6 text-purple-300" />
          </div>
          <div>
            <p className="text-[10px] uppercase font-bold text-purple-400 tracking-wider">Uploaded Files</p>
            <h3 className="text-xl font-extrabold text-white">{stats.total_files}</h3>
          </div>
        </div>

        <div className="p-5 rounded-2xl glass-panel border border-purple-500/20 glass-panel-hover flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-600/20 border border-indigo-400/30 flex items-center justify-center shrink-0">
            <MessageSquareText className="w-6 h-6 text-indigo-300" />
          </div>
          <div>
            <p className="text-[10px] uppercase font-bold text-indigo-400 tracking-wider">AI Chats</p>
            <h3 className="text-xl font-extrabold text-white">{stats.total_chats}</h3>
          </div>
        </div>

        <div className="p-5 rounded-2xl glass-panel border border-purple-500/20 glass-panel-hover flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-pink-600/20 border border-pink-400/30 flex items-center justify-center shrink-0">
            <Brain className="w-6 h-6 text-pink-300" />
          </div>
          <div>
            <p className="text-[10px] uppercase font-bold text-pink-400 tracking-wider">Study Assets</p>
            <h3 className="text-xl font-extrabold text-white">{stats.total_notes}</h3>
          </div>
        </div>

        <div className="p-5 rounded-2xl glass-panel border border-purple-500/20 glass-panel-hover flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-cyan-600/20 border border-cyan-400/30 flex items-center justify-center shrink-0">
            <HardDrive className="w-6 h-6 text-cyan-300" />
          </div>
          <div>
            <p className="text-[10px] uppercase font-bold text-cyan-400 tracking-wider">Storage Used</p>
            <h3 className="text-xl font-extrabold text-white">{stats.storage_mb} MB</h3>
          </div>
        </div>
      </div>

      {/* AI Intelligence Tool Launchers */}
      <div>
        <h3 className="text-sm font-extrabold text-white mb-3 uppercase tracking-wider text-purple-300 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-purple-400" /> Nexus Multimodal AI Suite
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div
            onClick={() => navigate('/chat')}
            className="p-5 rounded-2xl glass-panel border border-purple-500/30 glass-panel-hover cursor-pointer group space-y-3"
          >
            <div className="w-10 h-10 rounded-xl bg-purple-600/30 border border-purple-400/40 flex items-center justify-center group-hover:scale-110 transition-transform">
              <MessageSquareText className="w-5 h-5 text-purple-300" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white group-hover:text-purple-300 flex items-center justify-between">
                Multimodal Chat <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
              </h4>
              <p className="text-[11px] text-gray-400">Ask questions with attached PDF, image, or audio files.</p>
            </div>
          </div>

          <div
            onClick={() => navigate('/study?tab=notes')}
            className="p-5 rounded-2xl glass-panel border border-purple-500/30 glass-panel-hover cursor-pointer group space-y-3"
          >
            <div className="w-10 h-10 rounded-xl bg-pink-600/30 border border-pink-400/40 flex items-center justify-center group-hover:scale-110 transition-transform">
              <BookOpen className="w-5 h-5 text-pink-300" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white group-hover:text-pink-300 flex items-center justify-between">
                Notes & Flashcards <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
              </h4>
              <p className="text-[11px] text-gray-400">Auto-generate structured study notes and cards.</p>
            </div>
          </div>

          <div
            onClick={() => navigate('/study?tab=quizzes')}
            className="p-5 rounded-2xl glass-panel border border-purple-500/30 glass-panel-hover cursor-pointer group space-y-3"
          >
            <div className="w-10 h-10 rounded-xl bg-indigo-600/30 border border-indigo-400/40 flex items-center justify-center group-hover:scale-110 transition-transform">
              <HelpCircle className="w-5 h-5 text-indigo-300" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white group-hover:text-indigo-300 flex items-center justify-between">
                Interactive Quiz <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
              </h4>
              <p className="text-[11px] text-gray-400">Test your knowledge with AI-generated MCQs.</p>
            </div>
          </div>

          <div
            onClick={() => navigate('/study?tab=timeline')}
            className="p-5 rounded-2xl glass-panel border border-purple-500/30 glass-panel-hover cursor-pointer group space-y-3"
          >
            <div className="w-10 h-10 rounded-xl bg-cyan-600/30 border border-cyan-400/40 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Clock className="w-5 h-5 text-cyan-300" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white group-hover:text-cyan-300 flex items-center justify-between">
                Action Timeline <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
              </h4>
              <p className="text-[11px] text-gray-400">Extract milestones and task deadlines from docs.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Files Grid */}
      <div className="p-6 rounded-3xl glass-panel border border-purple-500/20 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <FileText className="w-4 h-4 text-purple-400" /> Recent Files in {activeWorkspace?.name || 'Workspace'}
          </h3>
          <button
            onClick={() => navigate('/files')}
            className="text-xs text-purple-400 hover:text-purple-300 font-medium flex items-center gap-1"
          >
            View All Files <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {recentFiles.length === 0 ? (
          <div className="text-center py-10 border border-dashed border-purple-500/20 rounded-2xl">
            <UploadCloud className="w-8 h-8 text-purple-400/60 mx-auto mb-2" />
            <p className="text-xs text-gray-300 font-medium">No files uploaded in this workspace yet.</p>
            <button
              onClick={() => setShowUploadModal(true)}
              className="mt-3 px-4 py-2 rounded-xl bg-purple-600/40 text-purple-200 hover:bg-purple-600 text-xs font-semibold"
            >
              Upload Your First File
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {recentFiles.map((file) => (
              <div
                key={file.id}
                onClick={() => navigate('/files')}
                className="p-4 rounded-2xl glass-panel border border-purple-500/20 glass-panel-hover cursor-pointer space-y-2 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[9px] uppercase px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 font-bold">
                      {file.file_type}
                    </span>
                    <span className="text-[10px] text-gray-400">
                      {(file.size_bytes / (1024 * 1024)).toFixed(1)} MB
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-white truncate mb-1">{file.name}</h4>
                  <p className="text-[10px] text-gray-400 line-clamp-2">{file.ai_summary || 'No summary generated yet.'}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showUploadModal && (
        <FileUploadModal
          onClose={() => setShowUploadModal(false)}
          onSuccess={fetchDashboardData}
        />
      )}
    </div>
  );
};
