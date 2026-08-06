import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Mail, Lock, User, ArrowRight, ShieldCheck, FileCheck, Brain, CheckCircle2, ArrowLeft, KeyRound, Loader2 } from 'lucide-react';

export const AuthPage: React.FC = () => {
  const { login, register, loginWithOAuth, requestPasswordReset, confirmPasswordReset } = useAuth();
  const navigate = useNavigate();

  const [mode, setMode] = useState<'signin' | 'register' | 'forgot'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [resetStep, setResetStep] = useState<1 | 2>(1);

  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState<'google' | 'github' | null>(null);
  const [error, setError] = useState('');
  const [infoMsg, setInfoMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setInfoMsg('');

    if (mode === 'signin' && (!email || !password)) {
      setError('Please fill in email and password');
      return;
    }

    if (mode === 'register' && (!email || !password || !fullName)) {
      setError('Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      if (mode === 'register') {
        await register(email, password, fullName);
        navigate('/dashboard');
      } else if (mode === 'signin') {
        await login(email, password);
        navigate('/dashboard');
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Authentication failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    const emailParam = params.get('email');
    const nameParam = params.get('name');

    if (token && emailParam) {
      const user = {
        id: `user_${Date.now()}`,
        email: emailParam,
        full_name: nameParam || emailParam.split('@')[0],
        avatar_url: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(nameParam || emailParam)}`
      };
      localStorage.setItem('nexus_token', token);
      localStorage.setItem('nexus_user', JSON.stringify(user));
      window.location.href = '/dashboard';
    }
  }, []);

  const handleOAuthLogin = async (provider: 'google' | 'github') => {
    setError('');
    setOauthLoading(provider);
    const backendUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
    // Redirect to backend OAuth route
    window.location.href = `${backendUrl}/auth/${provider}`;
  };

  const handlePasswordResetRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError('Please enter your registered email address');
      return;
    }
    setError('');
    setInfoMsg('');
    setLoading(true);
    try {
      const res = await requestPasswordReset(email);
      setInfoMsg(res.message || 'Password recovery instructions sent!');
      if (res.reset_token) setResetToken(res.reset_token);
      setResetStep(2);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to request password reset');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordResetConfirm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 6) {
      setError('Please enter a new password of at least 6 characters');
      return;
    }
    setError('');
    setInfoMsg('');
    setLoading(true);
    try {
      const res = await confirmPasswordReset(email, resetToken, newPassword);
      setInfoMsg(res.message || 'Password reset successfully!');
      setTimeout(() => {
        setMode('signin');
        setResetStep(1);
        setInfoMsg('Password updated! You can now log in.');
      }, 1500);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4 bg-dark-950 overflow-hidden">
      {/* Background Neon Elements */}
      <div className="purple-glow-bg" />
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-purple-600/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-indigo-600/20 rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 glass-panel rounded-3xl border border-purple-500/30 shadow-2xl overflow-hidden z-10">
        {/* Left Hero Section */}
        <div className="p-8 lg:p-12 bg-gradient-to-b from-purple-900/40 via-dark-900/60 to-dark-950 flex flex-col justify-between border-r border-purple-500/20">
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-500 flex items-center justify-center shadow-glow-purple">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <span className="font-extrabold text-2xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-purple-300">
                Nexus AI
              </span>
            </div>

            <h2 className="text-2xl lg:text-3xl font-extrabold text-white leading-tight mb-4">
              Multimodal Intelligence Workspace
            </h2>
            <p className="text-xs text-gray-300 leading-relaxed mb-6">
              Upload PDFs, images, audio, video, code, and documents. Chat with an AI that sees, reads, and hears all your data.
            </p>
          </div>

          {/* Feature Badges */}
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 rounded-2xl bg-dark-900/60 border border-purple-500/20">
              <Brain className="w-5 h-5 text-purple-400 shrink-0" />
              <div>
                <h4 className="text-xs font-semibold text-white">Google Gemini Multimodal AI</h4>
                <p className="text-[10px] text-gray-400">Contextual answers across all file formats</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-2xl bg-dark-900/60 border border-purple-500/20">
              <FileCheck className="w-5 h-5 text-pink-400 shrink-0" />
              <div>
                <h4 className="text-xs font-semibold text-white">Study Tools & Action Items</h4>
                <p className="text-[10px] text-gray-400">Notes, Flashcards, Quizzes & Timelines</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-2xl bg-dark-900/60 border border-purple-500/20">
              <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
              <div>
                <h4 className="text-xs font-semibold text-white">Supabase Cloud Vault</h4>
                <p className="text-[10px] text-gray-400">Encrypted metadata & permanent chat log</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Form Section */}
        <div className="p-8 lg:p-12 flex flex-col justify-center bg-dark-950/80">
          {mode !== 'forgot' && (
            <div className="flex items-center justify-between mb-6 p-1 rounded-2xl bg-dark-900 border border-purple-500/20">
              <button
                onClick={() => {
                  setMode('signin');
                  setError('');
                  setInfoMsg('');
                }}
                className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
                  mode === 'signin' ? 'bg-purple-600 text-white shadow-glow-purple' : 'text-gray-400 hover:text-white'
                }`}
              >
                Sign In
              </button>
              <button
                onClick={() => {
                  setMode('register');
                  setError('');
                  setInfoMsg('');
                }}
                className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
                  mode === 'register' ? 'bg-purple-600 text-white shadow-glow-purple' : 'text-gray-400 hover:text-white'
                }`}
              >
                Create Account
              </button>
            </div>
          )}

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-red-950/60 border border-red-500/40 text-red-300 text-xs">
              {error}
            </div>
          )}

          {infoMsg && (
            <div className="mb-4 p-3 rounded-xl bg-green-950/60 border border-green-500/40 text-green-300 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-green-400" />
              <span>{infoMsg}</span>
            </div>
          )}

          {/* FORGOT PASSWORD MODE */}
          {mode === 'forgot' ? (
            <div className="space-y-4">
              <button
                onClick={() => {
                  setMode('signin');
                  setResetStep(1);
                  setError('');
                  setInfoMsg('');
                }}
                className="inline-flex items-center gap-1.5 text-xs text-purple-400 hover:text-purple-300 mb-2 font-medium"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Back to Sign In
              </button>

              <div>
                <h3 className="text-lg font-extrabold text-white flex items-center gap-2">
                  <KeyRound className="w-5 h-5 text-purple-400" />
                  Password Recovery
                </h3>
                <p className="text-xs text-gray-400 mt-1">
                  {resetStep === 1
                    ? 'Enter your registered email address to receive password reset instructions.'
                    : 'Set a new secure password for your account.'}
                </p>
              </div>

              {resetStep === 1 ? (
                <form onSubmit={handlePasswordResetRequest} className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-300 mb-1">Registered Email</label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-purple-400 absolute left-3 top-3" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="jane@example.com"
                        required
                        className="w-full pl-9 pr-3 py-2.5 rounded-xl glass-input text-xs"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs shadow-glow-purple flex items-center justify-center gap-2 transition-all"
                  >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Send Recovery Instructions'}
                  </button>
                </form>
              ) : (
                <form onSubmit={handlePasswordResetConfirm} className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-300 mb-1">New Password</label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-purple-400 absolute left-3 top-3" />
                      <input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Minimum 6 characters"
                        required
                        className="w-full pl-9 pr-3 py-2.5 rounded-xl glass-input text-xs"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs shadow-glow-purple flex items-center justify-center gap-2 transition-all"
                  >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Reset & Save Password'}
                  </button>
                </form>
              )}
            </div>
          ) : (
            /* SIGN IN & REGISTER FORM */
            <div className="space-y-4">

              <form onSubmit={handleSubmit} className="space-y-4">
                {mode === 'register' && (
                  <div>
                    <label className="block text-xs font-medium text-gray-300 mb-1">Full Name</label>
                    <div className="relative">
                      <User className="w-4 h-4 text-purple-400 absolute left-3 top-3" />
                      <input
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="Jane Doe"
                        required={mode === 'register'}
                        className="w-full pl-9 pr-3 py-2.5 rounded-xl glass-input text-xs"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-1">Email Address</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-purple-400 absolute left-3 top-3" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="jane@example.com"
                      required
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl glass-input text-xs"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-medium text-gray-300">Password</label>
                    {mode === 'signin' && (
                      <button
                        type="button"
                        onClick={() => {
                          setMode('forgot');
                          setError('');
                          setInfoMsg('');
                        }}
                        className="text-[11px] text-purple-400 hover:text-purple-300 font-medium"
                      >
                        Forgot password?
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-purple-400 absolute left-3 top-3" />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl glass-input text-xs"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full mt-2 py-3 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs shadow-glow-purple transition-all flex items-center justify-center gap-2 transform active:scale-95"
                >
                  <span>{loading ? 'Authenticating...' : mode === 'register' ? 'Register & Launch Workspace' : 'Sign In to Workspace'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            </div>
          )}

          <p className="mt-6 text-[10px] text-center text-gray-400">
            By signing in, you agree to Nexus AI Security & Privacy Policies.
          </p>
        </div>
      </div>
    </div>
  );
};
