import React, { useEffect, useState } from 'react';
import { Navbar } from '../components/Navbar';
import { Sidebar } from '../components/Sidebar';
import { StudyPlanCard } from '../components/StudyPlanCard';
import { LoadingState } from '../components/LoadingState';
import { ErrorAlert } from '../components/ErrorAlert';
import { EmptyState } from '../components/EmptyState';
import { api } from '../lib/api';
import { StudyPlan } from '../types';
import { BookOpen, Sparkles, Plus, Calendar } from 'lucide-react';

export const StudyPlanPage: React.FC = () => {
  const [plans, setPlans] = useState<StudyPlan[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<StudyPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadPlans = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.listStudyPlans();
      setPlans(data || []);
      if (data && data.length > 0) {
        setSelectedPlan(data[0]);
      }
    } catch (err: any) {
      console.error('[StudyPlanPage] Load error:', err);
      setError(err.message || 'Failed to fetch study plans.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPlans();
  }, []);

  const handleGenerateNewPlan = async () => {
    setGenerating(true);
    setError(null);
    try {
      const newPlan = await api.createStudyPlan();
      setPlans((prev) => [newPlan, ...prev]);
      setSelectedPlan(newPlan);
    } catch (err: any) {
      console.error('[StudyPlanPage] Generate plan error:', err);
      setError(err.message || 'Failed to generate 7-day AI study plan.');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <Navbar />

      <div className="flex flex-1">
        <Sidebar />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center space-x-2 px-3 py-1 bg-amber-500/10 text-amber-400 rounded-full text-xs font-semibold mb-1 border border-amber-500/20">
                <Sparkles className="w-3.5 h-3.5" />
                <span>AI Preparation Roadmap</span>
              </div>
              <h1 className="text-3xl font-extrabold text-slate-100 tracking-tight flex items-center space-x-3">
                <BookOpen className="w-7 h-7 text-amber-400" />
                <span>Seven-Day AI Study Plan</span>
              </h1>
              <p className="text-sm text-slate-400 mt-1">
                Customized step-by-step 7-day schedule to strengthen weak technical areas.
              </p>
            </div>

            <button
              onClick={handleGenerateNewPlan}
              disabled={generating}
              className="px-5 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs rounded-xl transition-all shadow-lg shadow-blue-600/25 flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              <Plus className="w-4 h-4" />
              <span>{generating ? 'Building Plan...' : 'Generate New 7-Day Plan'}</span>
            </button>
          </div>

          {error && <ErrorAlert message={error} onDismiss={() => setError(null)} />}

          {loading ? (
            <LoadingState message="Loading AI Study Plans..." />
          ) : plans.length === 0 ? (
            <EmptyState
              icon={<BookOpen className="w-8 h-8 text-amber-400" />}
              title="No Study Plan Generated Yet"
              description="Click the button above to create your first customized 7-day AI study plan based on your profile and weak technical areas."
              actionLabel="Generate 7-Day AI Study Plan"
              onAction={handleGenerateNewPlan}
            />
          ) : (
            <div className="space-y-6">
              {/* Plan selector tabs if multiple plans */}
              {plans.length > 1 && (
                <div className="flex space-x-2 overflow-x-auto pb-2 border-b border-slate-800">
                  {plans.map((p) => {
                    const dateStr = new Date(p.created_at).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                    });
                    const isSelected = selectedPlan?.id === p.id;
                    return (
                      <button
                        key={p.id}
                        onClick={() => setSelectedPlan(p)}
                        className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-medium transition-all ${
                          isSelected
                            ? 'bg-blue-600 text-white font-bold shadow-md'
                            : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        <Calendar className="w-3.5 h-3.5" />
                        <span>{p.plan_title} ({dateStr})</span>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Active Plan Days */}
              {selectedPlan && (
                <div className="space-y-4">
                  <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-2xl flex items-center justify-between">
                    <h3 className="font-bold text-slate-100 text-lg">{selectedPlan.plan_title}</h3>
                    <span className="text-xs text-slate-400">7 Days Structured Curriculum</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {selectedPlan.plan_content?.days?.map((dayItem) => (
                      <StudyPlanCard key={dayItem.day} day={dayItem} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};
