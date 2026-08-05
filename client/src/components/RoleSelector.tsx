import React from 'react';
import { Layout, Server, Layers } from 'lucide-react';

interface RoleSelectorProps {
  value: string;
  onChange: (role: 'Frontend Developer' | 'Backend Developer' | 'Full-Stack Developer') => void;
}

export const RoleSelector: React.FC<RoleSelectorProps> = ({ value, onChange }) => {
  const roles = [
    {
      id: 'Frontend Developer',
      title: 'Frontend Developer',
      desc: 'UI/UX, React, JavaScript, CSS, HTML, Web Performance',
      icon: Layout,
    },
    {
      id: 'Backend Developer',
      title: 'Backend Developer',
      desc: 'Node.js, Express, REST APIs, Databases, Auth, SQL',
      icon: Server,
    },
    {
      id: 'Full-Stack Developer',
      title: 'Full-Stack Developer',
      desc: 'End-to-end applications, React, Node, Supabase, DB design',
      icon: Layers,
    },
  ] as const;

  return (
    <div className="space-y-2">
      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
        Target Role
      </label>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {roles.map((r) => {
          const Icon = r.icon;
          const isSelected = value === r.id;
          return (
            <button
              key={r.id}
              type="button"
              onClick={() => onChange(r.id)}
              className={`p-4 rounded-xl border text-left transition-all flex flex-col justify-between ${
                isSelected
                  ? 'bg-blue-950/40 border-blue-500 text-slate-100 shadow-lg shadow-blue-500/10 ring-1 ring-blue-500'
                  : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
              }`}
            >
              <div className="flex items-center space-x-3 mb-2">
                <div className={`p-2 rounded-lg ${isSelected ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400'}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <h4 className="font-semibold text-sm text-slate-100">{r.title}</h4>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">{r.desc}</p>
            </button>
          );
        })}
      </div>
    </div>
  );
};
