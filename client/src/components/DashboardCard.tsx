import React from 'react';

interface DashboardCardProps {
  title: string;
  value: string | number;
  subtext?: string;
  icon: React.ReactNode;
  trend?: string;
}

export const DashboardCard: React.FC<DashboardCardProps> = ({
  title,
  value,
  subtext,
  icon,
  trend,
}) => {
  return (
    <div className="bg-slate-900/60 border border-slate-800/80 p-5 rounded-2xl shadow-xl hover:border-slate-700/80 transition-all">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          {title}
        </span>
        <div className="p-2.5 bg-slate-800/80 text-blue-400 rounded-xl border border-slate-700/50">
          {icon}
        </div>
      </div>

      <div className="mt-4 flex items-baseline justify-between">
        <div className="text-3xl font-extrabold text-slate-100 tracking-tight">{value}</div>
        {trend && (
          <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
            {trend}
          </span>
        )}
      </div>

      {subtext && <p className="text-xs text-slate-400 mt-1">{subtext}</p>}
    </div>
  );
};
