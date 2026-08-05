import React from 'react';
import { ScoreDisplay } from './ScoreDisplay';
import { FeedbackPanel } from './FeedbackPanel';
import { InterviewAnswer } from '../types';
import { ArrowRight, CheckCircle2 } from 'lucide-react';

interface EvaluationResultCardProps {
  evaluation: InterviewAnswer;
  onNextQuestion?: () => void;
  onCompleteInterview?: () => void;
  hasNextQuestion: boolean;
  isLoadingNext?: boolean;
}

export const EvaluationResultCard: React.FC<EvaluationResultCardProps> = ({
  evaluation,
  onNextQuestion,
  onCompleteInterview,
  hasNextQuestion,
  isLoadingNext = false,
}) => {
  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="bg-slate-900/90 border border-slate-800 p-6 rounded-2xl shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center space-x-6">
          <ScoreDisplay score={evaluation.score} maxScore={10} size="md" label="Question Score" />
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-lg font-bold text-slate-100">
                Evaluation: <span className="text-blue-400">{evaluation.result || 'Reviewed'}</span>
              </h3>
            </div>
            <p className="text-xs text-slate-400 mt-1 max-w-md">
              Gemini AI analyzed your response against industry standard interview benchmarks.
            </p>
          </div>
        </div>

        <div>
          {hasNextQuestion && onNextQuestion ? (
            <button
              onClick={onNextQuestion}
              disabled={isLoadingNext}
              className="flex items-center space-x-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm rounded-xl transition-all shadow-lg shadow-blue-600/25"
            >
              <span>{isLoadingNext ? 'Generating Question...' : 'Continue to Next Question'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : onCompleteInterview ? (
            <button
              onClick={onCompleteInterview}
              disabled={isLoadingNext}
              className="flex items-center space-x-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm rounded-xl transition-all shadow-lg shadow-emerald-600/25"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Finish & View Final Report</span>
            </button>
          ) : null}
        </div>
      </div>

      <FeedbackPanel evaluation={evaluation} />
    </div>
  );
};
