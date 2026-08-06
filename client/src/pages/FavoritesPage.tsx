import React, { useState, useEffect } from 'react';
import { api } from '../lib/axios';
import { Star, FileText, MessageSquare, BookOpen } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const FavoritesPage: React.FC = () => {
  const navigate = useNavigate();
  const [favorites, setFavorites] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFavorites = async () => {
      try {
        setLoading(true);
        const res = await api.get('/favorites');
        setFavorites(res.data.favorites || []);
      } catch (e) {
        console.error('Failed to load favorites:', e);
      } finally {
        setLoading(false);
      }
    };
    fetchFavorites();
  }, []);

  return (
    <div className="space-y-6 pb-8 animate-fadeIn">
      <div>
        <h1 className="text-2xl font-extrabold text-white flex items-center gap-2">
          <Star className="w-6 h-6 text-amber-400 fill-amber-400" /> Favorite Collections
        </h1>
        <p className="text-xs text-gray-400">Quick access to pinned files, AI chats, and study assets.</p>
      </div>

      {loading ? (
        <div className="py-10 text-center text-xs text-purple-300">Loading favorites...</div>
      ) : favorites.length === 0 ? (
        <div className="text-center py-16 glass-panel border border-purple-500/20 rounded-3xl space-y-2">
          <Star className="w-8 h-8 text-amber-400/50 mx-auto" />
          <h3 className="text-xs font-bold text-white">No favorites bookmarked yet</h3>
          <p className="text-[10px] text-gray-400">Star files or chats to display them here.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {favorites.map((fav) => (
            <div
              key={fav.id}
              onClick={() => {
                if (fav.item_type === 'file') navigate('/files');
                else if (fav.item_type === 'chat') navigate(`/chat?id=${fav.item_id}`);
                else navigate('/study');
              }}
              className="p-5 rounded-3xl glass-panel border border-purple-500/20 glass-panel-hover cursor-pointer space-y-2 flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-400/30 flex items-center justify-center">
                  <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white truncate max-w-[180px]">{fav.title}</h4>
                  <span className="text-[9px] uppercase text-purple-300 font-bold">{fav.item_type}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
