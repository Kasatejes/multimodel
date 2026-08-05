import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  PlayCircle,
  History,
  BookOpen,
  User,
  Sparkles,
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'New Interview', path: '/interview/new', icon: PlayCircle },
    { label: 'Interview History', path: '/history', icon: History },
    { label: 'AI Study Plan', path: '/study-plan', icon: BookOpen },
    { label: 'Profile Settings', path: '/profile', icon: User },
  ];

  return (
    <aside className="w-64 bg-slate-900/60 border-r border-slate-800/80 p-4 flex flex-col justify-between hidden md:flex min-h-[calc(100vh-4rem)]">
      <div className="space-y-1">
        <div className="px-3 py-2 text-xs font-semibold uppercase text-slate-500 tracking-wider">
          Navigation
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-blue-600/15 text-blue-400 border border-blue-500/30 shadow-inner'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`
              }
            >
              <Icon className="w-4 h-4" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </div>

      <div className="p-4 bg-gradient-to-br from-blue-950/40 to-indigo-950/40 border border-blue-800/30 rounded-2xl">
        <div className="flex items-center space-x-2 text-blue-400 font-semibold text-xs mb-1">
          <Sparkles className="w-4 h-4 text-blue-400" />
          <span>Gemini AI Coach</span>
        </div>
        <p className="text-xs text-slate-400 leading-relaxed">
          Get real-time feedback and tailored preparation plans.
        </p>
      </div>
    </aside>
  );
};
