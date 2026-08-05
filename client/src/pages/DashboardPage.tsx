import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { Sidebar } from '../components/Sidebar';
import { DashboardCard } from '../components/DashboardCard';
import { InterviewHistoryTable } from '../components/InterviewHistoryTable';
import { LoadingState } from '../components/LoadingState';
import { ErrorAlert } from '../components/ErrorAlert';
import { EmptyState } from '../components/EmptyState';
import { useAuth } from '../hooks/useAuth';
import { api } from '../lib/api';
import {
  PlayCircle,
  BookOpen,
  Award,
  CheckCircle2,
  AlertTriangle,
  History,
  Sparkles,
  ArrowRight,
} from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const { profile } = useAuth();
  const navigate = useNavigate();

  const [dashboardData, setDashboardData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadDashboard = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getDashboard();
      setDashboardData(data);
    } catch (err: any) {
      console.error('[DashboardPage] Load error:', err);
      setError(err.message || 'Failed to load dashboard statistics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
        <Navbar />
        <div className="flex flex-1">
          <Sidebar />
          <main className="flex-1 p-8 flex items-center justify-center">
            <LoadingState message="Loading your interview dashboard..." />
          </main>
        </div>
      </div>
    );
  }

  const metrics = dashboardData?.metrics || {
    totalInterviews: 0,
    completedInterviews: 0,
    averageScore: 0,
    weakTopics: [],
  };
  const recentSessions = dashboardData?.recentSessions || [];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <Navbar />

      <div className="flex flex-1">
        <Sidebar />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-8">
          {error && <ErrorAlert message={error} onDismiss={() => setError(null)} />}

          {/* Banner */}
          <div className="bg-gradient-to-r from-blue-900/60 via-slate-900 to-indigo-950/60 border border-blue-800/40 p-6 sm:p-8 rounded-3xl shadow-2xl relative overflow-hidden flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center space-x-2 px-3 py-1 bg-blue-500/10 text-blue-400 rounded-full text-xs font-semibold border border-blue-500/20">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Interview Preparation Dashboard</span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-100 tracking-tight">
                Welcome back, {profile?.full_name || 'Student'}!
              </h1>
              <p className="text-sm text-slate-300 font-normal">
                Target Role: <strong className="text-blue-400">{profile?.target_role || 'Developer'}</strong> • Difficulty: <strong className="text-amber-400">{profile?.preferred_difficulty || 'Easy'}</strong>
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                to="/interview/new"
                className="px-5 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-sm rounded-xl transition-all shadow-lg shadow-blue-600/25 flex items-center space-x-2"
              >
                <PlayCircle className="w-4 h-4" />
                <span>Start Mock Interview</span>
              </Link>
              <Link
                to="/study-plan"
                className="px-5 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-sm rounded-xl transition-colors flex items-center space-x-2 border border-slate-700"
              >
                <BookOpen className="w-4 h-4 text-amber-400" />
                <span>AI Study Plan</span>
              </Link>
            </div>
          </div>

          {/* Metrics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <DashboardCard
              title="Total Sessions"
              value={metrics.totalInterviews}
              subtext="Interviews initiated"
              icon={<History className="w-5 h-5" />}
            />
            <DashboardCard
              title="Completed"
              value={metrics.completedInterviews}
              subtext="Fully evaluated interviews"
              icon={<CheckCircle2 className="w-5 h-5 text-emerald-400" />}
            />
            <DashboardCard
              title="Average Score"
              value={`${metrics.averageScore} / 100`}
              subtext="Overall performance"
              icon={<Award className="w-5 h-5 text-amber-400" />}
            />
            <DashboardCard
              title="Topics Needing Revision"
              value={metrics.weakTopics.length}
              subtext="Identified weak areas"
              icon={<AlertTriangle className="w-5 h-5 text-red-400" />}
            />
          </div>

          {/* Recent Interview History */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-100 tracking-tight flex items-center space-x-2">
                <History className="w-5 h-5 text-blue-400" />
                <span>Recent Mock Interviews</span>
              </h2>
              {recentSessions.length > 0 && (
                <Link to="/history" className="text-xs font-semibold text-blue-400 hover:underline flex items-center space-x-1">
                  <span>View All History</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              )}
            </div>

            {recentSessions.length > 0 ? (
              <InterviewHistoryTable sessions={recentSessions} />
            ) : (
              <EmptyState
                icon={<PlayCircle className="w-8 h-8 text-blue-400" />}
                title="No Mock Interviews Yet"
                description="Start your first AI-guided mock interview to test your technical skills, receive instant feedback, and track performance."
                actionLabel="Start Interview Setup"
                onAction={() => navigate('/interview/new')}
              />
            )}
          </div>
        </main>
      </div>
    </div>
  );
};
