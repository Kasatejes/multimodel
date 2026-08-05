import React from 'react';

interface TopicSelectorProps {
  targetRole: string;
  value: string;
  onChange: (topic: string) => void;
}

export const TopicSelector: React.FC<TopicSelectorProps> = ({
  targetRole,
  value,
  onChange,
}) => {
  const topicsMap: Record<string, string[]> = {
    'Frontend Developer': [
      'HTML',
      'CSS',
      'JavaScript',
      'TypeScript',
      'React',
      'API integration',
      'Browser concepts',
      'Web performance',
      'Accessibility',
    ],
    'Backend Developer': [
      'Node.js',
      'Express.js',
      'REST APIs',
      'Authentication',
      'Authorization',
      'SQL',
      'PostgreSQL',
      'Database design',
      'Security',
      'Error handling',
    ],
    'Full-Stack Developer': [
      'React',
      'Node.js',
      'Express.js',
      'APIs',
      'Supabase',
      'Authentication',
      'Authorization',
      'Database relationships',
      'Deployment',
      'Git',
    ],
  };

  const topics = topicsMap[targetRole] || topicsMap['Full-Stack Developer'];

  return (
    <div className="space-y-2">
      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
        Interview Topic
      </label>
      <div className="flex flex-wrap gap-2">
        {topics.map((t) => {
          const isSelected = value === t;
          return (
            <button
              key={t}
              type="button"
              onClick={() => onChange(t)}
              className={`px-3.5 py-2 rounded-xl text-xs font-medium transition-all ${
                isSelected
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20 font-semibold'
                  : 'bg-slate-900 border border-slate-800 text-slate-300 hover:border-slate-700 hover:text-white'
              }`}
            >
              {t}
            </button>
          );
        })}
      </div>
    </div>
  );
};
