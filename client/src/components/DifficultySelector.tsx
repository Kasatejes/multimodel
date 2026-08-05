import React from 'react';
import { Gauge } from 'lucide-react';

interface DifficultySelectorProps {
  value: 'Easy' | 'Medium' | 'Hard';
  onChange: (diff: 'Easy' | 'Medium' | 'Hard') => void;
}

export const DifficultySelector: React.FC<DifficultySelectorProps> = ({ value, onChange }) => {
  const options: Array<{ id: 'Easy' | 'Medium' | 'Hard'; label: string; desc: string; color: string }> = [
    { id: 'Easy', label: 'Easy', desc: 'Fundamental concepts & syntax', color: 'text-emerald-400 border-emerald-500/30' },
    { id: 'Medium', label: 'Medium', desc: 'Practical problem solving & patterns', color: 'text-amber-400 border-amber-500/30' },
    { id: 'Hard', label: 'Hard', desc: 'Advanced architecture & edge cases', color: 'text-red-400 border-red-500/30' },
  ];

  return (
    <div className="space-y-2">
      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
        Difficulty Level
      </label>
      <div className="grid grid-cols-3 gap-3">
        {options.map((opt) => {
          const isSelected = value === opt.id;
          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => onChange(opt.id)}
              className={`p-3 rounded-xl border text-center transition-all ${
                isSelected
                  ? `bg-slate-800 ${opt.color} text-slate-100 shadow-md font-semibold ring-1 ring-blue-500`
                  : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700'
              }`}
            >
              <div className="text-sm font-semibold">{opt.label}</div>
              <div className="text-[10px] text-slate-400 mt-0.5 leading-tight">{opt.desc}</div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
