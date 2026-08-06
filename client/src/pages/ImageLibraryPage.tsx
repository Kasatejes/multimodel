import React, { useState, useEffect } from 'react';
import { api } from '../lib/axios';
import { useWorkspace } from '../context/WorkspaceContext';
import {
  ImageIcon,
  Search,
  Download,
  Trash2,
  Star,
  Sparkles,
  Copy,
  Check,
  Loader2,
  Calendar,
  Wand2
} from 'lucide-react';

export const ImageLibraryPage: React.FC = () => {
  const { activeWorkspace } = useWorkspace();
  const [images, setImages] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<any | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const fetchImages = async () => {
    setLoading(true);
    try {
      const wsId = activeWorkspace?.id;
      const res = await api.get(`/images?search=${encodeURIComponent(searchQuery)}${wsId ? `&workspace_id=${wsId}` : ''}`);
      setImages(res.data.images || []);
    } catch (e) {
      console.error('Error fetching image library:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchImages();
  }, [activeWorkspace, searchQuery]);

  const toggleFavorite = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await api.patch(`/images/${id}/favorite`);
      setImages(prev => prev.map(img => img.id === id ? { ...img, is_favorite: !img.is_favorite } : img));
    } catch (e) {}
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm('Delete this generated image from library?')) return;
    try {
      await api.delete(`/images/${id}`);
      setImages(prev => prev.filter(img => img.id !== id));
      if (selectedImage?.id === id) setSelectedImage(null);
    } catch (e) {}
  };

  const downloadImage = (img: any, e: React.MouseEvent) => {
    e.stopPropagation();
    const link = document.createElement('a');
    link.href = img.image_url;
    link.download = `nexus_ai_image_${img.id}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const copyPrompt = (promptText: string, id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(promptText);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="glass-panel border border-purple-500/20 rounded-3xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-600 to-pink-600 flex items-center justify-center shadow-glow-purple">
            <ImageIcon className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-white flex items-center gap-2">
              AI Image Library ({images.length})
            </h1>
            <p className="text-xs text-gray-400 mt-0.5">
              Every generated AI image saved automatically with prompts and metadata.
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
            placeholder="Search images by prompt..."
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl text-xs glass-input"
          />
        </div>
      </div>

      {/* Main Grid View */}
      {loading ? (
        <div className="py-20 flex justify-center text-purple-400">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      ) : images.length === 0 ? (
        <div className="glass-panel rounded-3xl p-12 text-center space-y-3 border border-purple-500/20">
          <ImageIcon className="w-12 h-12 text-purple-400 mx-auto opacity-40" />
          <h3 className="text-sm font-extrabold text-white">No Generated Images Found</h3>
          <p className="text-xs text-gray-400 max-w-sm mx-auto">
            Use the AI Image Generator in chat or workspace to generate custom images.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {images.map((img) => (
            <div
              key={img.id}
              onClick={() => setSelectedImage(img)}
              className="glass-panel border border-purple-500/20 rounded-3xl overflow-hidden group cursor-pointer hover:border-purple-400/50 transition-all flex flex-col justify-between"
            >
              <div className="relative aspect-video bg-dark-950 overflow-hidden">
                <img
                  src={img.image_url}
                  alt={img.prompt}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <button
                  onClick={(e) => toggleFavorite(img.id, e)}
                  className={`absolute top-2 right-2 p-1.5 rounded-xl backdrop-blur-md border transition-all ${
                    img.is_favorite
                      ? 'bg-amber-500/80 text-white border-amber-300'
                      : 'bg-dark-900/60 text-gray-300 hover:text-white border-purple-500/20'
                  }`}
                >
                  <Star className={`w-3.5 h-3.5 ${img.is_favorite ? 'fill-white' : ''}`} />
                </button>
              </div>

              <div className="p-3.5 space-y-2">
                <p className="text-xs text-gray-200 font-medium line-clamp-2">{img.prompt}</p>

                <div className="flex items-center justify-between text-[10px] text-gray-400 pt-2 border-t border-purple-500/20">
                  <span className="flex items-center gap-1 font-mono">
                    <Calendar className="w-3 h-3 text-purple-400" />
                    {new Date(img.created_at).toLocaleDateString()}
                  </span>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={(e) => copyPrompt(img.prompt, img.id, e)}
                      className="p-1 text-gray-400 hover:text-purple-300"
                      title="Copy Prompt"
                    >
                      {copiedId === img.id ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                    <button
                      onClick={(e) => downloadImage(img, e)}
                      className="p-1 text-gray-400 hover:text-purple-300"
                      title="Download Image"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={(e) => handleDelete(img.id, e)}
                      className="p-1 text-gray-400 hover:text-red-400"
                      title="Delete Image"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Image Preview Modal */}
      {selectedImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-2xl glass-panel rounded-3xl border border-purple-500/30 p-6 space-y-4 relative">
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white"
            >
              ✕
            </button>

            <img
              src={selectedImage.image_url}
              alt={selectedImage.prompt}
              className="w-full max-h-[450px] object-contain rounded-2xl border border-purple-500/30"
            />

            <div className="space-y-2">
              <p className="text-xs font-bold text-purple-300">PROMPT:</p>
              <p className="text-xs text-white bg-dark-900 p-3 rounded-2xl border border-purple-500/20">{selectedImage.prompt}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
