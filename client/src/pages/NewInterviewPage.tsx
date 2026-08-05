import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { Sidebar } from '../components/Sidebar';
import { InterviewSetupForm } from '../components/InterviewSetupForm';
import { ErrorAlert } from '../components/ErrorAlert';
import { useAuth } from '../hooks/useAuth';
import { api } from '../lib/api';
import { PlayCircle, Sparkles } from 'lucide-react';

export const NewInterviewPage: React.FC = () => {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleStartInterview = async (setupData: any) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await api.startInterview(setupData);
      if (res?.session?.id) {
        navigate(`/interview/${res.session.id}`);
      } else {
        throw new Error('Invalid session response from server.');
      }
    } catch (err: any) {
      console.error('[NewInterviewPage] Start interview error:', err);
      setError(err.message || 'Failed to initialize mock interview session.');
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
            <div className="inline-flex items-center space-x-2 px-3 py-1 bg-blue-500/10 text-blue-400 rounded-full text-xs font-semibold mb-2 border border-blue-500/20">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Interactive Mock Interview Setup</span>
            </div>
            <h1 className="text-3xl font-extrabold text-slate-100 tracking-tight">
              Start New Mock Interview
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Select your parameters below. Gemini AI will generate structured interview questions tailored to your chosen role and difficulty.
            </p>
          </div>

          {error && <ErrorAlert message={error} onDismiss={() => setError(null)} />}

          <div className="bg-slate-900/80 border border-slate-800 p-6 sm:p-8 rounded-3xl shadow-2xl backdrop-blur-md">
            <InterviewSetupForm
              onSubmit={handleStartInterview}
              isLoading={isLoading}
              initialRole={profile?.target_role}
              initialDifficulty={profile?.preferred_difficulty}
            />
          </div>
        </main>
      </div>
    </div>
  );
};
