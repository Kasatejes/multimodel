import React from 'react';
import { Loader2, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import { SessionStatus } from '../types';

interface ProcessingStatusBadgeProps {
  status: SessionStatus;
}

export const ProcessingStatusBadge: React.FC<ProcessingStatusBadgeProps> = ({ status }) => {
  const statusConfig: Record<
    SessionStatus,
    { label: string; bg: string; text: string; icon: React.ReactNode }
  > = {
    waiting: {
      label: 'Waiting for answer',
      bg: 'bg-slate-800/80 border-slate-700',
      text: 'text-slate-300',
      icon: <Clock className="w-3.5 h-3.5" />,
    },
    generating_question: {
      label: 'Generating Question...',
      bg: 'bg-blue-950/60 border-blue-800/80',
      text: 'text-blue-300',
      icon: <Loader2 className="w-3.5 h-3.5 animate-spin" />,
    },
    question_ready: {
      label: 'Question Ready',
      bg: 'bg-indigo-950/60 border-indigo-800/80',
      text: 'text-indigo-300',
      icon: <CheckCircle2 className="w-3.5 h-3.5" />,
    },
    evaluating_answer: {
      label: 'Evaluating Answer...',
      bg: 'bg-amber-950/60 border-amber-800/80',
      text: 'text-amber-300',
      icon: <Loader2 className="w-3.5 h-3.5 animate-spin" />,
    },
    generating_feedback: {
      label: 'Generating Feedback...',
      bg: 'bg-purple-950/60 border-purple-800/80',
      text: 'text-purple-300',
      icon: <Loader2 className="w-3.5 h-3.5 animate-spin" />,
    },
    saving_result: {
      label: 'Saving Progress...',
      bg: 'bg-teal-950/60 border-teal-800/80',
      text: 'text-teal-300',
      icon: <Loader2 className="w-3.5 h-3.5 animate-spin" />,
    },
    completed: {
      label: 'Interview Completed',
      bg: 'bg-emerald-950/60 border-emerald-800/80',
      text: 'text-emerald-300',
      icon: <CheckCircle2 className="w-3.5 h-3.5" />,
    },
    failed: {
      label: 'Processing Failed',
      bg: 'bg-red-950/60 border-red-800/80',
      text: 'text-red-300',
      icon: <AlertCircle className="w-3.5 h-3.5" />,
    },
  };

  const config = statusConfig[status] || statusConfig.waiting;

  return (
    <div
      className={`inline-flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-semibold border ${config.bg} ${config.text} shadow-sm backdrop-blur-sm transition-all`}
    >
      {config.icon}
      <span>{config.label}</span>
    </div>
  );
};
