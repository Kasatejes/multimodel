import React from 'react';
import { Link, useNavigate } from 'react-router-dom'; // Fix import
import { useAuth } from '../hooks/useAuth';
import { Compass, LogOut, User as UserIcon, BookOpen, History, LayoutDashboard, PlayCircle } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-40 bg-slate-950/80 backdrop-blur-md border-b border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center space-x-3 group">
          <div className="p-2 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-xl shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-transform">
            <Compass className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-lg text-slate-100 tracking-tight">
            CareerPilot <span className="text-blue-500">AI</span>
          </span>
        </Link>

        {user ? (
          <div className="flex items-center space-x-4">
            <Link
              to="/interview/new"
              className="hidden sm:flex items-center space-x-2 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs rounded-lg transition-all shadow-md shadow-blue-600/20"
            >
              <PlayCircle className="w-4 h-4" />
              <span>Start Interview</span>
            </Link>

            <div className="flex items-center space-x-3 border-l border-slate-800 pl-4">
              <Link
                to="/profile"
                className="flex items-center space-x-2.5 text-slate-300 hover:text-white transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-blue-400 font-semibold text-xs shadow-inner">
                  {profile?.full_name ? profile.full_name.charAt(0).toUpperCase() : <UserIcon className="w-4 h-4" />}
                </div>
                <span className="hidden md:inline text-xs font-medium text-slate-300">
                  {profile?.full_name || user.email?.split('@')[0]}
                </span>
              </Link>

              <button
                onClick={handleSignOut}
                title="Sign Out"
                className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-950/30 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : (
          <div className="flex items-center space-x-3">
            <Link
              to="/login"
              className="text-xs font-medium text-slate-300 hover:text-white px-3 py-1.5 transition-colors"
            >
              Sign In
            </Link>
            <Link
              to="/register"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-xl transition-all shadow-lg shadow-blue-600/20"
            >
              Get Started
            </Link>
          </div>
        )}
      </div>
    </header>
  );
};
