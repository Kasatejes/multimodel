import React, { useState, useEffect } from 'react';
import { api } from '../lib/axios';
import { VoiceSearchBar } from '../components/VoiceSearchBar';
import {
  Vault,
  Plus,
  FileText,
  Trash2,
  RotateCcw,
  History,
  ShieldAlert,
  Sparkles,
  Search,
  Tag,
  CheckCircle2,
  Clock,
  Archive,
  Edit3,
  X,
  Loader2,
  Layers
} from 'lucide-react';

export const DocumentVaultPage: React.FC = () => {
  const [documents, setDocuments] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'active' | 'trash' | 'audit'>('active');

  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);

  // New Document Modal State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Version History Modal State
  const [selectedDocForVersion, setSelectedDocForVersion] = useState<any | null>(null);
  const [versions, setVersions] = useState<any[]>([]);

  const fetchDocuments = async () => {
    setLoading(true);
    try {
      const includeDeleted = activeTab === 'trash' ? 'true' : 'false';
      const [docRes, logRes] = await Promise.all([
        api.get(`/documents?include_deleted=${includeDeleted}&search=${encodeURIComponent(searchQuery)}`),
        api.get('/audit-logs')
      ]);
      setDocuments(docRes.data.documents || []);
      setAuditLogs(logRes.data.audit_logs || []);
    } catch (e) {
      console.error('Failed to load document vault:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, [activeTab, searchQuery]);

  const handleCreateDocument = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    setSubmitting(true);
    try {
      const tags = tagsInput.split(',').map((t) => t.trim()).filter(Boolean);
      await api.post('/documents', { title, content, tags });
      setTitle('');
      setContent('');
      setTagsInput('');
      setShowCreateModal(false);
      fetchDocuments();
    } catch (e) {
      console.error('Error creating permanent document:', e);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSoftDelete = async (id: string) => {
    try {
      await api.patch(`/documents/${id}/soft-delete`);
      fetchDocuments();
    } catch (e) {}
  };

  const handleRecover = async (id: string) => {
    try {
      await api.patch(`/documents/${id}/recover`);
      fetchDocuments();
    } catch (e) {}
  };

  const handleHardDelete = async (id: string) => {
    if (!window.confirm('Permanently delete this document from PostgreSQL vault? This action cannot be undone.')) return;
    try {
      await api.delete(`/documents/${id}`);
      fetchDocuments();
    } catch (e) {}
  };

  const viewVersions = async (doc: any) => {
    setSelectedDocForVersion(doc);
    try {
      const res = await api.get(`/documents/${doc.id}/versions`);
      setVersions(res.data.versions || []);
    } catch (e) {}
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-panel border border-purple-500/20 rounded-3xl p-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center shadow-glow-purple">
            <Vault className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-white flex items-center gap-2">
              Permanent Document Vault & Recovery
            </h1>
            <p className="text-xs text-gray-400 mt-0.5">
              Extracted text, AI summaries, and version history remain permanently stored in PostgreSQL.
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs shadow-glow-purple flex items-center justify-center gap-2 transition-all shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>New Permanent Text Record</span>
        </button>
      </div>

      {/* Tabs & Search */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 p-1 rounded-2xl bg-dark-950/80 border border-purple-500/20 w-full md:w-auto">
          <button
            onClick={() => setActiveTab('active')}
            className={`flex-1 md:flex-initial px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 ${
              activeTab === 'active' ? 'bg-purple-600 text-white shadow-glow-purple' : 'text-gray-400 hover:text-white'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Active Vault ({activeTab === 'active' ? documents.length : '...'})</span>
          </button>
          <button
            onClick={() => setActiveTab('trash')}
            className={`flex-1 md:flex-initial px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 ${
              activeTab === 'trash' ? 'bg-purple-600 text-white shadow-glow-purple' : 'text-gray-400 hover:text-white'
            }`}
          >
            <Archive className="w-3.5 h-3.5" />
            <span>Trash Bin ({activeTab === 'trash' ? documents.length : '...'})</span>
          </button>
          <button
            onClick={() => setActiveTab('audit')}
            className={`flex-1 md:flex-initial px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 ${
              activeTab === 'audit' ? 'bg-purple-600 text-white shadow-glow-purple' : 'text-gray-400 hover:text-white'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Audit Trail ({auditLogs.length})</span>
          </button>
        </div>

        {/* Voice Enabled Search Bar */}
        {activeTab !== 'audit' && (
          <div className="w-full md:w-80">
            <VoiceSearchBar
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search vault documents by title or text..."
            />
          </div>
        )}
      </div>

      {/* Main Grid Content */}
      {activeTab === 'audit' ? (
        <div className="glass-panel border border-purple-500/20 rounded-3xl p-6">
          <h3 className="text-sm font-extrabold text-white mb-4 flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-purple-400" />
            Security & Audit Activity Logs
          </h3>
          <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
            {auditLogs.length === 0 ? (
              <p className="text-xs text-gray-400 py-4 text-center">No audit activity logged yet.</p>
            ) : (
              auditLogs.map((log) => (
                <div
                  key={log.id}
                  className="p-3 rounded-2xl bg-dark-900/60 border border-purple-500/20 flex items-center justify-between text-xs"
                >
                  <div className="space-y-0.5">
                    <span className="font-bold text-purple-300 uppercase tracking-wider text-[10px]">
                      {log.action}
                    </span>
                    <p className="text-gray-300 text-xs">{JSON.stringify(log.details)}</p>
                  </div>
                  <span className="text-[10px] text-gray-400 font-mono">
                    {new Date(log.created_at).toLocaleString()}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {loading ? (
            <div className="col-span-full py-12 flex justify-center text-purple-400">
              <Loader2 className="w-6 h-6 animate-spin" />
            </div>
          ) : documents.length === 0 ? (
            <div className="col-span-full glass-panel rounded-3xl p-12 text-center space-y-3 border border-purple-500/20">
              <Vault className="w-10 h-10 text-purple-400 mx-auto opacity-50" />
              <h3 className="text-sm font-extrabold text-white">
                {activeTab === 'trash' ? 'Trash Bin is Empty' : 'No Processed Documents Found'}
              </h3>
              <p className="text-xs text-gray-400 max-w-sm mx-auto">
                {activeTab === 'trash'
                  ? 'Soft-deleted documents will appear here for recovery.'
                  : 'Create a permanent text record to store content, AI summaries, and version snapshots.'}
              </p>
            </div>
          ) : (
            documents.map((doc) => (
              <div
                key={doc.id}
                className="glass-panel border border-purple-500/20 rounded-3xl p-5 flex flex-col justify-between space-y-4 hover:border-purple-400/40 transition-all group"
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 overflow-hidden">
                      <FileText className="w-4 h-4 text-purple-400 shrink-0" />
                      <h4 className="font-extrabold text-sm text-white truncate">{doc.title}</h4>
                    </div>
                    <span className="text-[9px] font-extrabold px-2 py-0.5 rounded-full bg-purple-900/60 border border-purple-400/40 text-purple-200 shrink-0">
                      v{doc.version || 1}
                    </span>
                  </div>

                  <p className="text-xs text-gray-300 line-clamp-3 bg-dark-900/60 p-2.5 rounded-2xl border border-purple-500/10">
                    {doc.ai_summary || doc.content}
                  </p>

                  <div className="flex flex-wrap gap-1 pt-1">
                    {(doc.tags || []).map((t: string, idx: number) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-dark-900 border border-purple-500/20 text-[9px] text-purple-300"
                      >
                        <Tag className="w-2.5 h-2.5" />
                        {t}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-purple-500/20 text-xs">
                  <button
                    onClick={() => viewVersions(doc)}
                    className="text-[10px] text-purple-400 hover:text-purple-300 flex items-center gap-1 font-semibold"
                  >
                    <History className="w-3 h-3" />
                    <span>Version History</span>
                  </button>

                  <div className="flex items-center gap-1">
                    {activeTab === 'trash' ? (
                      <>
                        <button
                          onClick={() => handleRecover(doc.id)}
                          className="p-1.5 rounded-lg bg-green-950/60 text-green-300 hover:bg-green-900 border border-green-500/30 text-[10px] flex items-center gap-1 font-bold"
                          title="Recover document"
                        >
                          <RotateCcw className="w-3 h-3" /> Recover
                        </button>
                        <button
                          onClick={() => handleHardDelete(doc.id)}
                          className="p-1.5 rounded-lg bg-red-950/60 text-red-300 hover:bg-red-900 border border-red-500/30 text-[10px]"
                          title="Permanently hard delete"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => handleSoftDelete(doc.id)}
                        className="p-1.5 rounded-lg bg-red-950/40 text-gray-400 hover:text-red-300 border border-purple-500/20 text-[10px]"
                        title="Move to Trash Bin"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Create Permanent Document Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
          <div className="w-full max-w-lg glass-panel rounded-3xl border border-purple-500/30 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                <Vault className="w-5 h-5 text-purple-400" />
                New Permanent Text Record
              </h3>
              <button onClick={() => setShowCreateModal(false)} className="text-gray-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateDocument} className="space-y-3">
              <div>
                <label className="text-[10px] font-bold uppercase text-purple-300">Record Title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Q3 Multimodal Architecture Spec"
                  className="w-full px-3.5 py-2.5 rounded-xl glass-input text-xs mt-1"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase text-purple-300">Document Text Content</label>
                <textarea
                  required
                  rows={5}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Paste or type full text content to store permanently in PostgreSQL vault..."
                  className="w-full px-3.5 py-2.5 rounded-xl glass-input text-xs mt-1 resize-none"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase text-purple-300">Tags (comma separated)</label>
                <input
                  type="text"
                  value={tagsInput}
                  onChange={(e) => setTagsInput(e.target.value)}
                  placeholder="ai, architecture, requirements"
                  className="w-full px-3.5 py-2.5 rounded-xl glass-input text-xs mt-1"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl text-xs text-gray-300 hover:bg-dark-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-glow-purple flex items-center gap-2"
                >
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save Record Permanently'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Version History Modal */}
      {selectedDocForVersion && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
          <div className="w-full max-w-md glass-panel rounded-3xl border border-purple-500/30 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                <History className="w-5 h-5 text-purple-400" />
                Version History ({versions.length})
              </h3>
              <button onClick={() => setSelectedDocForVersion(null)} className="text-gray-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
              {versions.map((ver) => (
                <div key={ver.id} className="p-3 rounded-2xl bg-dark-900/60 border border-purple-500/20 text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-purple-300">Version {ver.version}</span>
                    <span className="text-[9px] text-gray-400">{new Date(ver.created_at).toLocaleString()}</span>
                  </div>
                  <p className="text-gray-300 text-xs line-clamp-2">{ver.ai_summary || ver.content}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
