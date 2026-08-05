import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { InterviewQuestionCard } from '../components/InterviewQuestionCard';
import { AnswerTextarea } from '../components/AnswerTextarea';
import { EvaluationResultCard } from '../components/EvaluationResultCard';
import { ProcessingStatusBadge } from '../components/ProcessingStatusBadge';
import { LoadingState } from '../components/LoadingState';
import { ErrorAlert } from '../components/ErrorAlert';
import { useAuth } from '../hooks/useAuth';
import { useRealtimeSession } from '../hooks/useRealtimeSession';
import { api } from '../lib/api';
import { InterviewSession, InterviewQuestion, InterviewAnswer, SessionStatus } from '../types';
import { ArrowLeft, CheckCircle2 } from 'lucide-react';

export const LiveInterviewPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [session, setSession] = useState<InterviewSession | null>(null);
  const [questions, setQuestions] = useState<InterviewQuestion[]>([]);
  const [answers, setAnswers] = useState<InterviewAnswer[]>([]);
  const [loading, setLoading] = useState(true);
  const [submittingAnswer, setSubmittingAnswer] = useState(false);
  const [loadingNext, setLoadingNext] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Supabase Realtime status listener
  const { processingStatus, setProcessingStatus } = useRealtimeSession(id, user?.id);

  const loadInterviewData = async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const data = await api.getInterviewById(id);
      setSession(data.session);
      setQuestions(data.questions || []);
      setAnswers(data.answers || []);
      if (data.session?.processing_status) {
        setProcessingStatus(data.session.processing_status as SessionStatus);
      }
    } catch (err: any) {
      console.error('[LiveInterviewPage] Load error:', err);
      setError(err.message || 'Failed to load interview session details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInterviewData();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <LoadingState message="Loading your mock interview session..." />
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
        <Navbar />
        <div className="flex-1 max-w-4xl mx-auto w-full p-8 text-center">
          <ErrorAlert message="Interview session not found." />
          <button
            onClick={() => navigate('/dashboard')}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-xl"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // Active question is the last question in questions array
  const currentQuestion = questions.length > 0 ? questions[questions.length - 1] : null;

  // Active answer for current question if evaluated
  const currentAnswer = currentQuestion
    ? answers.find((a) => a.question_id === currentQuestion.id)
    : null;

  const hasNextQuestion = questions.length < session.total_questions;

  const handleSubmitAnswer = async (studentAnswerText: string) => {
    if (!id || !currentQuestion) return;
    setSubmittingAnswer(true);
    setError(null);
    try {
      const res = await api.submitAnswer(id, studentAnswerText);
      setAnswers((prev) => [...prev, res.evaluation]);
    } catch (err: any) {
      console.error('[LiveInterviewPage] Submit answer error:', err);
      setError(err.message || 'Failed to submit answer for evaluation.');
    } finally {
      setSubmittingAnswer(false);
    }
  };

  const handleNextQuestion = async () => {
    if (!id) return;
    setLoadingNext(true);
    setError(null);
    try {
      const nextQ = await api.generateNextQuestion(id);
      setQuestions((prev) => [...prev, nextQ]);
    } catch (err: any) {
      console.error('[LiveInterviewPage] Next question error:', err);
      setError(err.message || 'Failed to generate next question.');
    } finally {
      setLoadingNext(false);
    }
  };

  const handleCompleteInterview = async () => {
    if (!id) return;
    setLoadingNext(true);
    setError(null);
    try {
      await api.completeInterview(id);
      navigate(`/interview/${id}/result`);
    } catch (err: any) {
      console.error('[LiveInterviewPage] Complete error:', err);
      setError(err.message || 'Failed to complete interview session.');
    } finally {
      setLoadingNext(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-4xl mx-auto w-full p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Top bar with Navigation & Realtime Status */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center space-x-2 text-xs font-semibold text-slate-400 hover:text-slate-200 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Dashboard</span>
          </button>

          <ProcessingStatusBadge status={processingStatus} />
        </div>

        {error && <ErrorAlert message={error} onDismiss={() => setError(null)} />}

        {/* Current Question */}
        {currentQuestion && (
          <InterviewQuestionCard
            question={currentQuestion}
            currentNumber={currentQuestion.question_order}
            totalQuestions={session.total_questions}
          />
        )}

        {/* Evaluation OR Answer Input */}
        {currentAnswer ? (
          <EvaluationResultCard
            evaluation={currentAnswer}
            onNextQuestion={handleNextQuestion}
            onCompleteInterview={handleCompleteInterview}
            hasNextQuestion={hasNextQuestion}
            isLoadingNext={loadingNext}
          />
        ) : (
          <AnswerTextarea
            onSubmit={handleSubmitAnswer}
            isSubmitting={submittingAnswer}
            disabled={processingStatus === 'evaluating_answer' || processingStatus === 'generating_feedback'}
          />
        )}
      </main>
    </div>
  );
};
