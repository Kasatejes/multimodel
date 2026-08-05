import React, { useState } from 'react';
import { Send, Loader2 } from 'lucide-react';

interface AnswerTextareaProps {
  onSubmit: (answer: string) => Promise<void>;
  isSubmitting: boolean;
  disabled?: boolean;
}

export const AnswerTextarea: React.FC<AnswerTextareaProps> = ({
  onSubmit,
  isSubmitting,
  disabled = false,
}) => {
  const [answer, setAnswer] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!answer.trim() || isSubmitting || disabled) return;
    await onSubmit(answer.trim());
  };

  return (
    <form onSubmit={handleSubmit} className="mt-6 space-y-4">
      <div className="relative">
        <label htmlFor="student-answer-input" className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
          Your Answer
        </label>
        <textarea
          id="student-answer-input"
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          disabled={isSubmitting || disabled}
          placeholder="Type your detailed interview answer here... (Explain your reasoning, technical concepts, and practical examples)"
          rows={6}
          className="w-full bg-slate-900/90 border border-slate-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-2xl p-4 text-sm text-slate-100 placeholder-slate-500 resize-none transition-all shadow-inner disabled:opacity-50"
        />
        <div className="flex justify-between items-center text-xs text-slate-500 mt-1 px-1">
          <span>Be clear, concise, and technical.</span>
          <span>{answer.length} / 5000 characters</span>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={!answer.trim() || isSubmitting || disabled}
          className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold text-sm rounded-xl transition-all shadow-lg shadow-blue-600/25 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Evaluating Answer...</span>
            </>
          ) : (
            <>
              <Send className="w-4 h-4" />
              <span>Submit Answer for AI Evaluation</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
};
