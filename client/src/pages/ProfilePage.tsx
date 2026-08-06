import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Shield, Save, CheckCircle2 } from 'lucide-react';

export const ProfilePage: React.FC = () => {
  const { user, updateProfile } = useAuth();

  const [fullName, setFullName] = useState(user?.full_name || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [avatarUrl, setAvatarUrl] = useState(user?.avatar_url || '');
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccess(false);
    try {
      await updateProfile({ full_name: fullName, bio, avatar_url: avatarUrl });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (e) {
      console.error('Failed to update profile:', e);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-8 animate-fadeIn">
      <div>
        <h1 className="text-2xl font-extrabold text-white flex items-center gap-2">
          <User className="w-6 h-6 text-purple-400" /> User Profile Settings
        </h1>
        <p className="text-xs text-gray-400">Manage account information, bio, and avatar.</p>
      </div>

      <div className="p-6 rounded-3xl glass-panel border border-purple-500/30 space-y-6">
        <div className="flex items-center gap-4 border-b border-purple-500/20 pb-6">
          <img
            src={avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${fullName}`}
            alt={fullName}
            className="w-16 h-16 rounded-2xl border-2 border-purple-500/40 object-cover shadow-glow-purple"
          />
          <div>
            <h3 className="text-base font-extrabold text-white">{user?.full_name}</h3>
            <p className="text-xs text-gray-400">{user?.email}</p>
            <span className="text-[9px] uppercase px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 font-bold mt-1 inline-block">
              {user?.role || 'User'}
            </span>
          </div>
        </div>

        {success && (
          <div className="p-3 rounded-xl bg-green-950/60 border border-green-500/40 text-green-300 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" /> Profile updated successfully!
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1">Full Name</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl glass-input text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1">Bio / Role Description</label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={3}
              placeholder="Full stack developer, AI researcher, or student..."
              className="w-full px-3 py-2.5 rounded-xl glass-input text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1">Avatar Image URL</label>
            <input
              type="text"
              value={avatarUrl}
              onChange={(e) => setAvatarUrl(e.target.value)}
              placeholder="https://..."
              className="w-full px-3 py-2.5 rounded-xl glass-input text-xs"
            />
          </div>

          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs shadow-glow-purple transition-all"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving...' : 'Save Profile Changes'}</span>
          </button>
        </form>
      </div>
    </div>
  );
};
