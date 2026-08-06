import React, { useState } from 'react';
import { useWorkspace } from '../context/WorkspaceContext';
import { X, Layers, Plus, Loader2 } from 'lucide-react';

interface CreateWorkspaceModalProps {
  onClose: () => void;
}

const colorOptions = ['#8B5CF6', '#EC4899', '#3B82F6', '#10B981', '#F59E0B', '#6366F1'];
const iconOptions = ['Layers', 'Folder', 'BrainCircuit', 'Sparkles', 'Boxes', 'Terminal'];

export const CreateWorkspaceModal: React.FC<CreateWorkspaceModalProps> = ({ onClose }) => {
  const { createWorkspace } = useWorkspace();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState(colorOptions[0]);
  const [icon, setIcon] = useState(iconOptions[0]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Workspace name is required');
      return;
    }

    setLoading(true);
    setError('');
    try {
      await createWorkspace(name, description, icon, color);
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to create workspace');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
      <div className="w-full max-w-md glass-panel rounded-2xl border border-purple-500/40 p-6 shadow-2xl relative">
        <button onClick={onClose} className="absolute top-4 right-4 p-1.5 text-gray-400 hover:text-white">
          <X className="w-5 h-5" />
        </button>

        <h3 className="text-lg font-extrabold text-white mb-1 flex items-center gap-2">
          <Layers className="w-5 h-5 text-purple-400" />
          Create New Workspace
        </h3>
        <p className="text-xs text-gray-400 mb-4">Separate projects, documents, and AI chat sessions.</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <div className="p-2.5 rounded-xl bg-red-950/60 border border-red-500/40 text-red-300 text-xs">{error}</div>}

          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1">Workspace Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. AI Research Papers, Q3 Financial Analysis"
              className="w-full px-3 py-2 rounded-xl glass-input text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1">Description (Optional)</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description of the workspace goal..."
              rows={2}
              className="w-full px-3 py-2 rounded-xl glass-input text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1.5">Accent Color</label>
            <div className="flex gap-2">
              {colorOptions.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`w-7 h-7 rounded-full border-2 transition-all ${
                    color === c ? 'border-white scale-110 shadow-glow-purple' : 'border-transparent opacity-70'
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          <div className="pt-2 flex justify-end gap-3">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-xl text-xs text-gray-400 hover:text-white">
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold text-xs shadow-glow-purple"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
              Create Workspace
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
