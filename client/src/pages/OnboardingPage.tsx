import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { ProfileForm } from '../components/ProfileForm';
import { ErrorAlert } from '../components/ErrorAlert';
import { Navbar } from '../components/Navbar';
import { api } from '../lib/api';
import { Sparkles } from 'lucide-react';

export const OnboardingPage: React.FC = () => {
  const { profile, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleProfileSubmit = async (formData: any) => {
    setError(null);
    setIsLoading(true);
    try {
      await api.updateProfile(formData);
      await refreshProfile();
      navigate('/dashboard');
    } catch (err: any) {
      console.error('[OnboardingPage] Save profile error:', err);
      setError(err.message || 'Failed to save student profile setup.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <Navbar />
      <div className="flex-1 max-w-4xl mx-auto w-full p-4 sm:p-6 lg:p-8">
        <div className="bg-slate-900/80 border border-slate-800/80 p-8 rounded-3xl shadow-2xl backdrop-blur-md">
          <div className="mb-8">
            <div className="inline-flex items-center space-x-2 px-3 py-1 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-full text-xs font-semibold mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Step 1 of 1: Student Profile Onboarding</span>
            </div>
            <h1 className="text-3xl font-extrabold text-slate-100 tracking-tight">
              Customize Your Interview Experience
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Tell CareerPilot AI about your target roles, experience level, and technologies so questions are tailored specifically for you.
            </p>
          </div>

          {error && <ErrorAlert message={error} onDismiss={() => setError(null)} />}

          <ProfileForm initialData={profile} onSubmit={handleProfileSubmit} isLoading={isLoading} />
        </div>
      </div>
    </div>
  );
};
