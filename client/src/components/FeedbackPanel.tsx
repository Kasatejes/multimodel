import React, { useState } from 'react';
import { CheckCircle, XCircle, AlertTriangle, Sparkles, MessageSquare, Lightbulb } from 'lucide-react';
import { InterviewAnswer } from '../types';

interface FeedbackPanelProps {
  evaluation: InterviewAnswer;
}

export const FeedbackPanel: React.FC<FeedbackPanelProps> = ({ evaluation }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'technical' | 'communication' | 'improved'>('overview');

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden shadow-xl mt-6">
      {/* Tabs */}
      <div className="flex border-b border-slate-800 bg-slate-950/60 overflow-x-auto">
        <button
          onClick={() => setActiveTab('overview')}
          className={`flex items-center space-x-2 px-5 py-3 text-xs font-semibold border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'overview'
              ? 'border-blue-500 text-blue-400 bg-blue-500/10'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>Evaluation Summary</span>
        </button>

        <button
          onClick={() => setActiveTab('technical')}
          className={`flex items-center space-x-2 px-5 py-3 text-xs font-semibold border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'technical'
              ? 'border-blue-500 text-blue-400 bg-blue-500/10'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span>Technical Feedback</span>
        </button>

        <button
          onClick={() => setActiveTab('communication')}
          className={`flex items-center space-x-2 px-5 py-3 text-xs font-semibold border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'communication'
              ? 'border-blue-500 text-blue-400 bg-blue-500/10'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <MessageSquare className="w-4 h-4 text-indigo-400" />
          <span>Communication</span>
        </button>

        <button
          onClick={() => setActiveTab('improved')}
          className={`flex items-center space-x-2 px-5 py-3 text-xs font-semibold border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'improved'
              ? 'border-blue-500 text-blue-400 bg-blue-500/10'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Lightbulb className="w-4 h-4 text-amber-400" />
          <span>Improved Model Answer</span>
        </button>
      </div>

      {/* Content */}
      <div className="p-6">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Points grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Correct Points */}
              <div className="bg-emerald-950/30 border border-emerald-800/40 rounded-xl p-4">
                <div className="flex items-center space-x-2 text-emerald-400 font-semibold text-xs mb-2">
                  <CheckCircle className="w-4 h-4" />
                  <span>Correct Points</span>
                </div>
                {evaluation.correct_points && evaluation.correct_points.length > 0 ? (
                  <ul className="space-y-1.5 text-xs text-slate-300">
                    {evaluation.correct_points.map((pt, i) => (
                      <li key={i} className="flex items-start space-x-1.5">
                        <span className="text-emerald-500 font-bold">•</span>
                        <span>{pt}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-xs text-slate-500 italic">None identified</p>
                )}
              </div>

              {/* Missing Points */}
              <div className="bg-amber-950/30 border border-amber-800/40 rounded-xl p-4">
                <div className="flex items-center space-x-2 text-amber-400 font-semibold text-xs mb-2">
                  <AlertTriangle className="w-4 h-4" />
                  <span>Missing Key Points</span>
                </div>
                {evaluation.missing_points && evaluation.missing_points.length > 0 ? (
                  <ul className="space-y-1.5 text-xs text-slate-300">
                    {evaluation.missing_points.map((pt, i) => (
                      <li key={i} className="flex items-start space-x-1.5">
                        <span className="text-amber-500 font-bold">•</span>
                        <span>{pt}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-xs text-slate-500 italic">No missing points</p>
                )}
              </div>

              {/* Incorrect Points */}
              <div className="bg-red-950/30 border border-red-800/40 rounded-xl p-4">
                <div className="flex items-center space-x-2 text-red-400 font-semibold text-xs mb-2">
                  <XCircle className="w-4 h-4" />
                  <span>Incorrect / Misleading</span>
                </div>
                {evaluation.incorrect_points && evaluation.incorrect_points.length > 0 ? (
                  <ul className="space-y-1.5 text-xs text-slate-300">
                    {evaluation.incorrect_points.map((pt, i) => (
                      <li key={i} className="flex items-start space-x-1.5">
                        <span className="text-red-500 font-bold">•</span>
                        <span>{pt}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-xs text-slate-500 italic">No incorrect points</p>
                )}
              </div>
            </div>

            {evaluation.recommended_topic && (
              <div className="p-4 bg-blue-950/30 border border-blue-800/40 rounded-xl flex items-center justify-between">
                <span className="text-xs text-slate-400">Recommended Topic to Revise:</span>
                <span className="text-xs font-semibold text-blue-300 px-3 py-1 bg-blue-900/50 rounded-lg">
                  {evaluation.recommended_topic}
                </span>
              </div>
            )}
          </div>
        )}

        {activeTab === 'technical' && (
          <div className="text-sm text-slate-200 leading-relaxed whitespace-pre-line">
            {evaluation.technical_feedback || 'No detailed technical feedback recorded.'}
          </div>
        )}

        {activeTab === 'communication' && (
          <div className="text-sm text-slate-200 leading-relaxed whitespace-pre-line">
            {evaluation.communication_feedback || 'No detailed communication feedback recorded.'}
          </div>
        )}

        {activeTab === 'improved' && (
          <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl text-sm text-blue-200 font-mono leading-relaxed overflow-x-auto whitespace-pre-line">
            {evaluation.improved_answer || 'No model answer generated.'}
          </div>
        )}
      </div>
    </div>
  );
};
