import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { AuthForm } from '../components/AuthForm';
import { ErrorAlert } from '../components/ErrorAlert';
import { Navbar } from '../components/Navbar';
import { Compass } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (data: any) => {
    setError(null);
    setIsLoading(true);
    try {
      await signIn(data.email, data.password);
      navigate('/dashboard');
    } catch (err: any) {
      console.error('[LoginPage] Sign in error:', err);
      setError(err.message || 'Failed to sign in. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <Navbar />
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="bg-slate-900/80 border border-slate-800/80 p-8 rounded-3xl shadow-2xl max-w-md w-full backdrop-blur-md">
          <div className="text-center mb-8">
            <div className="p-3 bg-blue-600/10 text-blue-500 rounded-2xl w-fit mx-auto mb-3 border border-blue-500/20">
              <Compass className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold text-slate-100">Welcome Back</h2>
            <p className="text-xs text-slate-400 mt-1">
              Sign in to resume your mock interview practice session
            </p>
          </div>

          {error && <ErrorAlert message={error} onDismiss={() => setError(null)} />}

          <AuthForm type="login" onSubmit={handleLogin} isLoading={isLoading} />

          <div className="mt-6 text-center text-xs text-slate-400">
            Don't have an account?{' '}
            <Link to="/register" className="text-blue-400 font-semibold hover:underline">
              Create student profile
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
