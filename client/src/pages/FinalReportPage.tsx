import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { ScoreDisplay } from '../components/ScoreDisplay';
import { LoadingState } from '../components/LoadingState';
import { ErrorAlert } from '../components/ErrorAlert';
import { api } from '../lib/api';
import { InterviewSession, InterviewQuestion, InterviewAnswer } from '../types';
import {
  Award,
  CheckCircle,
  AlertTriangle,
  BookOpen,
  Sparkles,
  ArrowRight,
  RotateCcw,
  MessageSquare,
} from 'lucide-react';

export const FinalReportPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [session, setSession] = useState<InterviewSession | null>(null);
  const [questions, setQuestions] = useState<InterviewQuestion[]>([]);
  const [answers, setAnswers] = useState<InterviewAnswer[]>([]);
  const [loading, setLoading] = useState(true);
  const [generatingStudyPlan, setGeneratingStudyPlan] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadReportData = async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const data = await api.getInterviewById(id);
      setSession(data.session);
      setQuestions(data.questions || []);
      setAnswers(data.answers || []);
    } catch (err: any) {
      console.error('[FinalReportPage] Load error:', err);
      setError(err.message || 'Failed to load interview report.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReportData();
  }, [id]);

  const handleGenerateStudyPlan = async () => {
    if (!id) return;
    setGeneratingStudyPlan(true);
    setError(null);
    try {
      const plan = await api.createStudyPlan(id);
      navigate(`/study-plan`);
    } catch (err: any) {
      console.error('[FinalReportPage] Generate study plan error:', err);
      setError(err.message || 'Failed to generate study plan.');
    } finally {
      setGeneratingStudyPlan(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <LoadingState message="Generating comprehensive interview performance report..." />
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
        <Navbar />
        <div className="flex-1 max-w-4xl mx-auto w-full p-8 text-center">
          <ErrorAlert message="Interview report not found." />
          <button onClick={() => navigate('/dashboard')} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-xl">
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const overallScore = session.overall_score || 0;
  const strongAreas = session.strong_areas || [];
  const weakAreas = session.weak_areas || [];
  const topicsToRevise = session.topics_to_revise || [];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-4xl mx-auto w-full p-4 sm:p-6 lg:p-8 space-y-8">
        {error && <ErrorAlert message={error} onDismiss={() => setError(null)} />}

        {/* Top Header Card */}
        <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-blue-950/60 border border-slate-800 p-8 rounded-3xl shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-left">
            <div className="inline-flex items-center space-x-2 px-3 py-1 bg-emerald-500/10 text-emerald-400 rounded-full text-xs font-semibold border border-emerald-500/20">
              <CheckCircle className="w-3.5 h-3.5" />
              <span>Interview Completed</span>
            </div>
            <h1 className="text-3xl font-extrabold text-slate-100 tracking-tight">
              Final Interview Performance Report
            </h1>
            <p className="text-sm text-slate-300">
              Role: <strong className="text-blue-400">{session.target_role}</strong> • Topic: <strong className="text-indigo-400">{session.topic}</strong> • Difficulty: <strong className="text-amber-400">{session.difficulty}</strong>
            </p>
          </div>

          <ScoreDisplay score={overallScore} maxScore={100} size="lg" label="Overall Score" />
        </div>

        {/* Final Encouraging Message */}
        {session.final_message && (
          <div className="p-6 bg-gradient-to-r from-blue-950/40 via-indigo-950/40 to-slate-900 border border-blue-800/40 rounded-2xl">
            <div className="flex items-center space-x-2 text-blue-400 font-bold text-xs uppercase tracking-wider mb-2">
              <Sparkles className="w-4 h-4" />
              <span>AI Coach Evaluation Summary</span>
            </div>
            <p className="text-base text-slate-200 leading-relaxed font-medium italic">
              "{session.final_message}"
            </p>
          </div>
        )}

        {/* Strong vs Weak Areas */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Strong Areas */}
          <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-2xl shadow-xl">
            <div className="flex items-center space-x-2 text-emerald-400 font-bold text-sm mb-4">
              <CheckCircle className="w-5 h-5" />
              <span>Demonstrated Strengths</span>
            </div>
            {strongAreas.length > 0 ? (
              <ul className="space-y-2 text-sm text-slate-300">
                {strongAreas.map((area, i) => (
                  <li key={i} className="flex items-start space-x-2">
                    <span className="text-emerald-400 font-bold">•</span>
                    <span>{area}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-slate-500 italic">No specific strengths recorded</p>
            )}
          </div>

          {/* Weak Areas */}
          <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-2xl shadow-xl">
            <div className="flex items-center space-x-2 text-amber-400 font-bold text-sm mb-4">
              <AlertTriangle className="w-5 h-5" />
              <span>Areas Needing Growth</span>
            </div>
            {weakAreas.length > 0 ? (
              <ul className="space-y-2 text-sm text-slate-300">
                {weakAreas.map((area, i) => (
                  <li key={i} className="flex items-start space-x-2">
                    <span className="text-amber-400 font-bold">•</span>
                    <span>{area}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-slate-500 italic">No critical weak areas identified</p>
            )}
          </div>
        </div>

        {/* Summaries */}
        <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-2xl space-y-6">
          {session.technical_summary && (
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-blue-400 mb-2 flex items-center space-x-2">
                <MessageSquare className="w-4 h-4" />
                <span>Technical Knowledge Assessment</span>
              </h3>
              <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-line">
                {session.technical_summary}
              </p>
            </div>
          )}

          {session.communication_summary && (
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-indigo-400 mb-2 flex items-center space-x-2">
                <MessageSquare className="w-4 h-4" />
                <span>Communication & Structural Clarity</span>
              </h3>
              <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-line">
                {session.communication_summary}
              </p>
            </div>
          )}
        </div>

        {/* Revision Topics & Next Steps */}
        <div className="p-6 bg-slate-900/80 border border-slate-800 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-2">
            <h4 className="font-bold text-slate-100 text-sm">Recommended Revision Topics</h4>
            <div className="flex flex-wrap gap-2">
              {topicsToRevise.map((t, i) => (
                <span key={i} className="px-3 py-1 bg-blue-950 border border-blue-800 text-blue-300 text-xs font-medium rounded-lg">
                  {t}
                </span>
              ))}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <button
              onClick={handleGenerateStudyPlan}
              disabled={generatingStudyPlan}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-sm rounded-xl transition-all shadow-lg shadow-blue-600/25 flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              <BookOpen className="w-4 h-4 text-amber-300" />
              <span>{generatingStudyPlan ? 'Building AI Study Plan...' : 'Generate 7-Day AI Study Plan'}</span>
            </button>

            <Link
              to="/interview/new"
              className="px-5 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-sm rounded-xl transition-colors flex items-center justify-center space-x-2"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Practice Again</span>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
};
