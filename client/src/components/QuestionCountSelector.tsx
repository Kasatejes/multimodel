import React from 'react';

interface QuestionCountSelectorProps {
  value: number;
  onChange: (count: 3 | 5 | 10) => void;
}

export const QuestionCountSelector: React.FC<QuestionCountSelectorProps> = ({ value, onChange }) => {
  const counts: Array<{ count: 3 | 5 | 10; label: string; desc: string }> = [
    { count: 3, label: '3 Questions', desc: 'Quick 10-min session' },
    { count: 5, label: '5 Questions', desc: 'Standard 20-min session' },
    { count: 10, label: '10 Questions', desc: 'In-depth mock interview' },
  ];

  return (
    <div className="space-y-2">
      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
        Number of Questions
      </label>
      <div className="grid grid-cols-3 gap-3">
        {counts.map((c) => {
          const isSelected = value === c.count;
          return (
            <button
              key={c.count}
              type="button"
              onClick={() => onChange(c.count)}
              className={`p-3 rounded-xl border text-center transition-all ${
                isSelected
                  ? 'bg-blue-600 text-white border-blue-500 shadow-md font-semibold'
                  : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
              }`}
            >
              <div className="text-sm font-semibold">{c.label}</div>
              <div className="text-[10px] opacity-80 mt-0.5">{c.desc}</div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
