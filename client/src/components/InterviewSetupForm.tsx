import React, { useState } from 'react';
import { RoleSelector } from './RoleSelector';
import { TopicSelector } from './TopicSelector';
import { DifficultySelector } from './DifficultySelector';
import { QuestionCountSelector } from './QuestionCountSelector';
import { PlayCircle, Loader2, Sparkles } from 'lucide-react';

interface InterviewSetupFormProps {
  onSubmit: (data: {
    target_role: 'Frontend Developer' | 'Backend Developer' | 'Full-Stack Developer';
    interview_type: 'Technical' | 'HR' | 'Mixed';
    topic: string;
    difficulty: 'Easy' | 'Medium' | 'Hard';
    total_questions: 3 | 5 | 10;
  }) => Promise<void>;
  isLoading: boolean;
  initialRole?: string;
  initialDifficulty?: string;
}

export const InterviewSetupForm: React.FC<InterviewSetupFormProps> = ({
  onSubmit,
  isLoading,
  initialRole = 'Frontend Developer',
  initialDifficulty = 'Easy',
}) => {
  const [targetRole, setTargetRole] = useState<'Frontend Developer' | 'Backend Developer' | 'Full-Stack Developer'>(
    (initialRole as any) || 'Frontend Developer'
  );
  const [interviewType, setInterviewType] = useState<'Technical' | 'HR' | 'Mixed'>('Technical');
  const [topic, setTopic] = useState<string>('React');
  const [difficulty, setDifficulty] = useState<'Easy' | 'Medium' | 'Hard'>((initialDifficulty as any) || 'Easy');
  const [totalQuestions, setTotalQuestions] = useState<3 | 5 | 10>(3);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      target_role: targetRole,
      interview_type: interviewType,
      topic,
      difficulty,
      total_questions: totalQuestions,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Role Selection */}
      <RoleSelector
        value={targetRole}
        onChange={(r) => {
          setTargetRole(r);
          if (r === 'Backend Developer') setTopic('Node.js');
          else if (r === 'Frontend Developer') setTopic('React');
          else setTopic('APIs');
        }}
      />

      {/* Interview Type */}
      <div className="space-y-2">
        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
          Interview Type
        </label>
        <div className="grid grid-cols-3 gap-3">
          {(['Technical', 'HR', 'Mixed'] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setInterviewType(t)}
              className={`py-2.5 px-4 rounded-xl text-xs font-semibold border transition-all ${
                interviewType === t
                  ? 'bg-blue-600 border-blue-500 text-white shadow-md'
                  : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700'
              }`}
            >
              {t} Interview
            </button>
          ))}
        </div>
      </div>

      {/* Topic Selection */}
      <TopicSelector targetRole={targetRole} value={topic} onChange={setTopic} />

      {/* Difficulty Selection */}
      <DifficultySelector value={difficulty} onChange={setDifficulty} />

      {/* Question Count Selection */}
      <QuestionCountSelector value={totalQuestions} onChange={setTotalQuestions} />

      {/* Submit Button */}
      <div className="pt-4">
        <button
          type="submit"
          disabled={isLoading || !topic}
          className="w-full py-4 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold text-base rounded-2xl shadow-xl shadow-blue-600/25 flex items-center justify-center space-x-3 transition-all disabled:opacity-50"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Initializing Interview with Gemini AI...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5 text-amber-300" />
              <span>Start Mock Interview</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
};
