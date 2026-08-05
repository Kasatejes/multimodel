import React, { useState } from 'react';
import { Navbar } from '../components/Navbar';
import { Sidebar } from '../components/Sidebar';
import { ProfileForm } from '../components/ProfileForm';
import { ErrorAlert } from '../components/ErrorAlert';
import { useAuth } from '../hooks/useAuth';
import { api } from '../lib/api';
import { User, CheckCircle2 } from 'lucide-react';

export const ProfilePage: React.FC = () => {
  const { profile, refreshProfile } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleProfileSubmit = async (formData: any) => {
    setIsLoading(true);
    setError(null);
    setSuccessMsg(null);
    try {
      await api.updateProfile(formData);
      await refreshProfile();
      setSuccessMsg('Profile settings updated successfully!');
    } catch (err: any) {
      console.error('[ProfilePage] Save profile error:', err);
      setError(err.message || 'Failed to update profile settings.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <Navbar />

      <div className="flex flex-1">
        <Sidebar />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto w-full space-y-6">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-100 tracking-tight flex items-center space-x-3">
              <User className="w-7 h-7 text-blue-400" />
              <span>Profile & Target Preferences</span>
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Manage your career objectives, experience level, known technical skills, and weak topics.
            </p>
          </div>

          {error && <ErrorAlert message={error} onDismiss={() => setError(null)} />}

          {successMsg && (
            <div className="p-4 bg-emerald-950/60 border border-emerald-800/80 text-emerald-300 rounded-xl flex items-center space-x-2 text-sm font-semibold shadow-lg">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              <span>{successMsg}</span>
            </div>
          )}

          <div className="bg-slate-900/80 border border-slate-800 p-6 sm:p-8 rounded-3xl shadow-2xl backdrop-blur-md">
            <ProfileForm initialData={profile} onSubmit={handleProfileSubmit} isLoading={isLoading} />
          </div>
        </main>
      </div>
    </div>
  );
};
