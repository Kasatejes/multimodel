import React from 'react';
import { HelpCircle, Code, Award } from 'lucide-react';
import { InterviewQuestion } from '../types';

interface InterviewQuestionCardProps {
  question: InterviewQuestion;
  currentNumber: number;
  totalQuestions: number;
}

export const InterviewQuestionCard: React.FC<InterviewQuestionCardProps> = ({
  question,
  currentNumber,
  totalQuestions,
}) => {
  return (
    <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-blue-950/40 border border-slate-800 p-6 rounded-2xl shadow-2xl relative overflow-hidden">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <span className="px-3 py-1 bg-blue-500/10 text-blue-400 font-semibold text-xs rounded-full border border-blue-500/20">
            Question {currentNumber} of {totalQuestions}
          </span>
          <span className="px-3 py-1 bg-slate-800 text-slate-300 font-medium text-xs rounded-full">
            {question.topic}
          </span>
        </div>
        <span className="px-3 py-1 bg-slate-800 text-amber-400 font-semibold text-xs rounded-full border border-amber-500/20">
          {question.difficulty}
        </span>
      </div>

      <div className="flex items-start space-x-3 my-2">
        <HelpCircle className="w-6 h-6 text-blue-400 mt-1 flex-shrink-0" />
        <h2 className="text-xl font-bold text-slate-100 leading-snug tracking-tight">
          {question.question}
        </h2>
      </div>

      {question.skill_tested && (
        <div className="mt-4 pt-4 border-t border-slate-800/80 flex items-center space-x-2 text-xs text-slate-400">
          <Award className="w-4 h-4 text-indigo-400" />
          <span>Skill Evaluated: <strong className="text-slate-200">{question.skill_tested}</strong></span>
        </div>
      )}
    </div>
  );
};
