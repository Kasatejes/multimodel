import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  MessageSquareText,
  BookOpen,
  ImageIcon,
  FileAudio,
  BarChart3,
  User,
  Settings,
  Sparkles,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/chat', label: 'AI Chat Workspace', icon: MessageSquareText },
  { path: '/study', label: 'Study & AI Hub', icon: BookOpen },
  { path: '/images', label: 'AI Image Library', icon: ImageIcon },
  { path: '/transcripts', label: 'Transcript Library', icon: FileAudio },
  { path: '/analytics', label: 'Analytics', icon: BarChart3 },
  { path: '/profile', label: 'Profile', icon: User },
  { path: '/settings', label: 'Settings', icon: Settings }
];

import { NexusLogo } from './NexusLogo';

export const Sidebar: React.FC = () => {
  const [isCollapsed, setIsCollapsed] = useState<boolean>(() => {
    return localStorage.getItem('nexus_sidebar_collapsed') === 'true';
  });

  useEffect(() => {
    localStorage.setItem('nexus_sidebar_collapsed', isCollapsed ? 'true' : 'false');
  }, [isCollapsed]);

  return (
    <aside
      className={`glass-panel border-r border-purple-500/20 flex flex-col justify-between p-3 min-h-[calc(100vh-61px)] transition-all duration-300 relative ${
        isCollapsed ? 'w-16' : 'w-64'
      }`}
    >
      {/* Collapse / Expand Toggle */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3.5 top-6 z-20 w-7 h-7 rounded-full bg-dark-900 border border-purple-500/40 text-purple-300 hover:text-white flex items-center justify-center shadow-lg transition-transform hover:scale-110"
        title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
      >
        {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
      </button>

      <div className="space-y-6">
        {!isCollapsed && (
          <div className="px-3 pt-2">
            <p className="text-[10px] uppercase font-extrabold tracking-widest text-purple-400">
              Workspace Navigation
            </p>
          </div>
        )}

        <nav className="space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-2xl font-medium text-xs transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-purple-600/40 to-indigo-600/30 text-white border border-purple-500/40 shadow-glow-purple'
                      : 'text-gray-400 hover:text-white hover:bg-purple-900/30'
                  } ${isCollapsed ? 'justify-center px-0' : ''}`
                }
                title={isCollapsed ? item.label : undefined}
              >
                <Icon className="w-4 h-4 text-purple-400 shrink-0" />
                {!isCollapsed && <span className="truncate">{item.label}</span>}
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* ChatGPT-Style Pro Card */}
      {!isCollapsed && (
        <div className="p-3.5 rounded-2xl bg-gradient-to-b from-purple-900/40 to-dark-950 border border-purple-500/30 text-center relative overflow-hidden">
          <div className="flex justify-center mb-2">
            <NexusLogo size={32} showText={false} />
          </div>
          <h4 className="text-xs font-bold text-white mb-1">Nexus AI Multimodal</h4>
          <p className="text-[10px] text-gray-400 mb-2">GPT Image, Whisper & Gemini Active</p>
          <div className="w-full bg-dark-900 rounded-full h-1.5 overflow-hidden border border-purple-500/20">
            <div className="bg-gradient-to-r from-purple-500 to-indigo-400 h-full w-[85%]" />
          </div>
        </div>
      )}
    </aside>
  );
};
