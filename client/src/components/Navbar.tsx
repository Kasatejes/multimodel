import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useWorkspace } from '../context/WorkspaceContext';
import {
  Sparkles,
  Layers,
  ChevronDown,
  Plus,
  User,
  LogOut,
  Settings,
  ShieldCheck
} from 'lucide-react';
import { GlobalSearchModal } from './GlobalSearchModal';
import { CreateWorkspaceModal } from './CreateWorkspaceModal';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const { activeWorkspace, workspaces, setActiveWorkspace } = useWorkspace();

  const [showSearch, setShowSearch] = useState(false);
  const [showCreateWs, setShowCreateWs] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showWsDropdown, setShowWsDropdown] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-30 w-full glass-panel border-b border-purple-500/20 px-4 lg:px-6 py-3 flex items-center justify-between">
        {/* Left: Brand + Active Workspace Selector */}
        <div className="flex items-center gap-4">
          <a href="/dashboard" className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-500 flex items-center justify-center shadow-glow-purple">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="font-extrabold text-xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-purple-200 to-purple-400">
              Nexus AI
            </span>
          </a>

          <div className="hidden sm:block h-5 w-[1px] bg-purple-500/30" />

          {/* Workspace Selector Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowWsDropdown(!showWsDropdown)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-dark-900/80 border border-purple-500/30 hover:border-purple-400/50 text-xs font-medium transition-all text-purple-200"
            >
              <Layers className="w-3.5 h-3.5 text-purple-400" />
              <span className="max-w-[140px] truncate">{activeWorkspace?.name || 'Select Workspace'}</span>
              <ChevronDown className="w-3 h-3 text-purple-400" />
            </button>

            {showWsDropdown && (
              <div className="absolute left-0 mt-2 w-56 glass-panel rounded-2xl shadow-2xl p-2 z-50 border border-purple-500/30">
                <div className="text-[10px] uppercase font-bold text-purple-400 px-2 py-1 tracking-wider">
                  Workspaces
                </div>
                {workspaces.map((ws) => (
                  <button
                    key={ws.id}
                    onClick={() => {
                      setActiveWorkspace(ws);
                      setShowWsDropdown(false);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs font-medium flex items-center justify-between transition-colors ${
                      activeWorkspace?.id === ws.id
                        ? 'bg-purple-600/30 text-white font-semibold'
                        : 'text-gray-300 hover:bg-purple-900/40'
                    }`}
                  >
                    <span className="truncate">{ws.name}</span>
                    {ws.is_default && <span className="text-[9px] px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300">Default</span>}
                  </button>
                ))}
                <div className="border-t border-purple-500/20 my-1" />
                <button
                  onClick={() => {
                    setShowWsDropdown(false);
                    setShowCreateWs(true);
                  }}
                  className="w-full text-left px-3 py-2 rounded-xl text-xs font-medium text-purple-300 hover:bg-purple-800/40 flex items-center gap-2"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Create Workspace</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right User Actions */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <button
              onClick={() => setShowUserDropdown(!showUserDropdown)}
              className="flex items-center gap-2 p-1.5 rounded-xl glass-panel hover:border-purple-400/50 transition-all"
            >
              <img
                src={user?.avatar_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${user?.full_name || 'User'}`}
                alt={user?.full_name}
                className="w-7 h-7 rounded-lg object-cover border border-purple-500/40"
              />
              <span className="hidden md:block text-xs font-medium text-gray-200 truncate max-w-[100px]">
                {user?.full_name}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
            </button>

            {showUserDropdown && (
              <div className="absolute right-0 mt-2 w-56 glass-panel rounded-2xl shadow-2xl p-2 z-50 border border-purple-500/30">
                <div className="px-3 py-2 border-b border-purple-500/20 mb-1">
                  <p className="text-xs font-semibold text-white">{user?.full_name}</p>
                  <p className="text-[10px] text-gray-400 truncate">{user?.email}</p>
                </div>
                <a
                  href="/profile"
                  className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-gray-300 hover:bg-purple-900/40 transition-colors"
                >
                  <User className="w-3.5 h-3.5 text-purple-400" />
                  <span>Profile Manager</span>
                </a>
                <a
                  href="/settings"
                  className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-gray-300 hover:bg-purple-900/40 transition-colors"
                >
                  <Settings className="w-3.5 h-3.5 text-purple-400" />
                  <span>Settings & Security</span>
                </a>
                <div className="border-t border-purple-500/20 my-1" />
                <button
                  onClick={() => {
                    setShowUserDropdown(false);
                    logout();
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-red-400 hover:bg-red-950/40 transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Modals */}
      {showSearch && <GlobalSearchModal onClose={() => setShowSearch(false)} />}
      {showCreateWs && <CreateWorkspaceModal onClose={() => setShowCreateWs(false)} />}
    </>
  );
};
