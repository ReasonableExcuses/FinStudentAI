import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { GraduationCap, ArrowRight, AlertTriangle, Database } from 'lucide-react';
import { authApi } from '../services/api';
import { useAuth } from '../context/AuthContext';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isDemoLoading, setIsDemoLoading] = useState(false);

  const { login, seedDemo } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      const res = await authApi.login({ email: email.trim(), password });
      login(res.data.access_token, res.data.user);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Invalid email or password.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemo = async () => {
    setIsDemoLoading(true);
    setError(null);
    try {
      await seedDemo();
      navigate('/dashboard');
    } catch (err) {
      setError('Failed to seed demo account.');
    } finally {
      setIsDemoLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0c0e12] flex items-center justify-center p-4 sm:p-6 selection:bg-[#10b981] selection:text-[#042f1a]">
      <div className="max-w-md w-full fin-card p-6 sm:p-8 border border-white/[0.08] shadow-2xl">
        <div className="text-center mb-6">
          <div className="w-11 h-11 rounded-2xl bg-[#10b981] flex items-center justify-center mx-auto mb-3 text-[#042f1a] font-bold shadow-sm">
            <GraduationCap className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold font-display text-white tracking-tight">Welcome back</h2>
          <p className="text-xs text-slate-400 mt-1">Sign in to your FinStudent AI dashboard</p>
        </div>

        {/* Demo Fast-Track Card */}
        <div className="mb-6 p-4 rounded-xl bg-white/[0.03] border border-white/[0.08] text-center">
          <p className="text-xs text-slate-300 font-semibold mb-2">University Review Fast-Track</p>
          <button
            type="button"
            onClick={handleDemo}
            disabled={isDemoLoading}
            className="w-full py-2.5 px-4 text-xs font-bold rounded-full bg-white/[0.08] hover:bg-white/[0.14] text-white transition flex items-center justify-center space-x-2 disabled:opacity-50 active:scale-95"
          >
            <Database className="w-3.5 h-3.5 text-[#38bdf8]" />
            <span>{isDemoLoading ? 'Setting up Demo...' : '1-Click Demo Login (Alex)'}</span>
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Student Email</label>
            <input
              type="email"
              required
              placeholder="alex@finstudent.ai"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#0c0e12] border border-white/[0.08] text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#10b981] transition"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Password</label>
            <input
              type="password"
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#0c0e12] border border-white/[0.08] text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#10b981] transition"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2.5 text-xs font-bold rounded-full bg-[#10b981] hover:bg-[#34d399] text-[#042f1a] transition active:scale-95 disabled:opacity-50 flex items-center justify-center space-x-2 mt-2 shadow-sm"
          >
            <span>{isLoading ? 'Signing In...' : 'Sign In'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <p className="text-center text-xs text-slate-400 mt-6">
          Don't have an account?{' '}
          <Link to="/register" className="text-[#10b981] hover:underline font-medium">
            Register here
          </Link>
        </p>
      </div>
    </div>
  );
};
