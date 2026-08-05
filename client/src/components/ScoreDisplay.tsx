import React from 'react';

interface ScoreDisplayProps {
  score: number;
  maxScore?: number;
  label?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const ScoreDisplay: React.FC<ScoreDisplayProps> = ({
  score,
  maxScore = 10,
  label = 'Score',
  size = 'md',
}) => {
  const percentage = Math.min(100, Math.max(0, (score / maxScore) * 100));

  let colorClass = 'text-red-400 stroke-red-500';
  let bgGradient = 'from-red-500/20 to-red-600/10';

  if (percentage >= 80) {
    colorClass = 'text-emerald-400 stroke-emerald-500';
    bgGradient = 'from-emerald-500/20 to-emerald-600/10';
  } else if (percentage >= 60) {
    colorClass = 'text-amber-400 stroke-amber-500';
    bgGradient = 'from-amber-500/20 to-amber-600/10';
  }

  const dimensions = size === 'sm' ? 'w-16 h-16 text-lg' : size === 'lg' ? 'w-32 h-32 text-3xl' : 'w-24 h-24 text-2xl';

  return (
    <div className="flex flex-col items-center justify-center">
      <div
        className={`relative ${dimensions} rounded-full flex items-center justify-center bg-gradient-to-br ${bgGradient} border border-slate-800 shadow-inner`}
      >
        <span className={`font-black ${colorClass} tracking-tight`}>{score}</span>
        <span className="text-[10px] text-slate-500 absolute bottom-2">/ {maxScore}</span>
      </div>
      {label && <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider mt-2">{label}</span>}
    </div>
  );
};
