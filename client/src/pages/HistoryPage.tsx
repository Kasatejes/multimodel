import React, { useEffect, useState } from 'react';
import { Navbar } from '../components/Navbar';
import { Sidebar } from '../components/Sidebar';
import { InterviewHistoryTable } from '../components/InterviewHistoryTable';
import { LoadingState } from '../components/LoadingState';
import { ErrorAlert } from '../components/ErrorAlert';
import { EmptyState } from '../components/EmptyState';
import { api } from '../lib/api';
import { InterviewSession } from '../types';
import { History, PlayCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const HistoryPage: React.FC = () => {
  const navigate = useNavigate();
  const [sessions, setSessions] = useState<InterviewSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadHistory = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.listInterviews();
      setSessions(data || []);
    } catch (err: any) {
      console.error('[HistoryPage] Load error:', err);
      setError(err.message || 'Failed to fetch interview history.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHistory();
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <Navbar />

      <div className="flex flex-1">
        <Sidebar />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-6">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-100 tracking-tight flex items-center space-x-3">
              <History className="w-7 h-7 text-blue-400" />
              <span>Interview History & Performance Archives</span>
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Review all your previous mock interview sessions, questions asked, AI scores, and detailed feedback.
            </p>
          </div>

          {error && <ErrorAlert message={error} onDismiss={() => setError(null)} />}

          {loading ? (
            <LoadingState message="Loading interview history..." />
          ) : sessions.length > 0 ? (
            <InterviewHistoryTable sessions={sessions} />
          ) : (
            <EmptyState
              icon={<History className="w-8 h-8 text-blue-400" />}
              title="No Interview History Found"
              description="You haven't conducted any mock interviews yet. Start your first session to build your history."
              actionLabel="Start Mock Interview"
              onAction={() => navigate('/interview/new')}
            />
          )}
        </main>
      </div>
    </div>
  );
};
