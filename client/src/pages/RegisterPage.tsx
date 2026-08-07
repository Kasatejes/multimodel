import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { AuthForm } from '../components/AuthForm';
import { ErrorAlert } from '../components/ErrorAlert';
import { Navbar } from '../components/Navbar';
import { Compass } from 'lucide-react';

export const RegisterPage: React.FC = () => {
  const { signUp } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleRegister = async (data: any) => {
    setError(null);
    setIsLoading(true);
    try {
      await signUp(data.email, data.password, data.full_name);
      navigate('/onboarding');
    } catch (err: any) {
      console.error('[RegisterPage] Registration error:', err);
      const msg = typeof err === 'string' ? err : err?.message || err?.error || 'Registration failed. Please try again.';
      setError(typeof msg === 'string' ? msg : JSON.stringify(msg));
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
            <h2 className="text-2xl font-bold text-slate-100">Create Student Account</h2>
            <p className="text-xs text-slate-400 mt-1">
              Join CareerPilot AI and master technical job interviews
            </p>
          </div>

          {error && <ErrorAlert message={error} onDismiss={() => setError(null)} />}

          <AuthForm type="register" onSubmit={handleRegister} isLoading={isLoading} />

          <div className="mt-6 text-center text-xs text-slate-400">
            Already registered?{' '}
            <Link to="/login" className="text-blue-400 font-semibold hover:underline">
              Sign in here
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
