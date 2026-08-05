import React from 'react';
import { Link } from 'react-router-dom';
import {
  Compass,
  Sparkles,
  Bot,
  BarChart3,
  BookOpen,
  ArrowRight,
  CheckCircle,
  Zap,
  ShieldCheck,
} from 'lucide-react';
import { Navbar } from '../components/Navbar';

export const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-blue-600 selection:text-white">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-20 pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center flex-1 flex flex-col justify-center items-center">
        {/* Glow backdrop */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-600/20 blur-[120px] rounded-full pointer-events-none" />

        <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold mb-6 shadow-sm">
          <Sparkles className="w-4 h-4 text-blue-400" />
          <span>Powered by Gemini 2.5 API & Real-Time Supabase</span>
        </div>

        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight max-w-4xl text-slate-100 leading-[1.1]">
          Ace Your Technical Interviews with <span className="bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent">Real-Time AI Coaching</span>
        </h1>

        <p className="mt-6 text-lg sm:text-xl text-slate-400 max-w-2xl font-normal leading-relaxed">
          CareerPilot AI generates role-specific interview questions, evaluates your answers instantaneously, identifies weak areas, and builds custom 7-day study plans for software engineers.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          <Link
            to="/register"
            className="px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-base rounded-2xl transition-all shadow-xl shadow-blue-600/25 flex items-center justify-center space-x-2"
          >
            <span>Start Free Mock Interview</span>
            <ArrowRight className="w-5 h-5" />
          </Link>
          <Link
            to="/login"
            className="px-8 py-4 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 font-semibold text-base rounded-2xl transition-colors flex items-center justify-center"
          >
            Student Sign In
          </Link>
        </div>

        {/* Feature Highlights Grid */}
        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-6 text-left w-full">
          <div className="p-6 bg-slate-900/60 border border-slate-800/80 rounded-2xl shadow-xl backdrop-blur-sm hover:border-slate-700/80 transition-all">
            <div className="p-3 bg-blue-500/10 text-blue-400 rounded-xl w-fit mb-4">
              <Bot className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-100">Adaptive AI Interrogator</h3>
            <p className="text-sm text-slate-400 mt-2 leading-relaxed">
              Questions adapt based on your target role (Frontend, Backend, Full-Stack), topic, difficulty, and experience level.
            </p>
          </div>

          <div className="p-6 bg-slate-900/60 border border-slate-800/80 rounded-2xl shadow-xl backdrop-blur-sm hover:border-slate-700/80 transition-all">
            <div className="p-3 bg-purple-500/10 text-purple-400 rounded-xl w-fit mb-4">
              <BarChart3 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-100">Detailed Answer Evaluation</h3>
            <p className="text-sm text-slate-400 mt-2 leading-relaxed">
              Receive granular feedback on technical correctness, clarity, completeness, missing points, and an improved interview-ready answer.
            </p>
          </div>

          <div className="p-6 bg-slate-900/60 border border-slate-800/80 rounded-2xl shadow-xl backdrop-blur-sm hover:border-slate-700/80 transition-all">
            <div className="p-3 bg-amber-500/10 text-amber-400 rounded-xl w-fit mb-4">
              <BookOpen className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-100">Personalized 7-Day Study Plan</h3>
            <p className="text-sm text-slate-400 mt-2 leading-relaxed">
              Transform your interview weaknesses into strengths with structured daily learning tasks and practical exercises.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 py-8 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <Compass className="w-4 h-4 text-blue-500" />
            <span className="font-bold text-slate-300">CareerPilot AI</span>
            <span>— Real-Time AI Interview Preparation Coach</span>
          </div>
          <p>© 2026 CareerPilot AI. Powered by Gemini API & Supabase.</p>
        </div>
      </footer>
    </div>
  );
};
