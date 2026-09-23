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
    <div className="min-h-screen bg-[#090d16] flex items-center justify-center p-6">
      <div className="max-w-md w-full glass-panel p-8 rounded-2xl border border-slate-800 shadow-2xl">
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-600 to-teal-400 flex items-center justify-center mx-auto mb-3 shadow-lg shadow-teal-500/25">
            <GraduationCap className="w-6 h-6 text-slate-950 font-bold" />
          </div>
          <h2 className="text-xl font-bold font-display text-white">Welcome back to FinStudent AI</h2>
          <p className="text-xs text-slate-400 mt-1">Sign in to track, predict, and optimize your student budget</p>
        </div>

        {/* Demo Fast-Track Card */}
        <div className="mb-6 p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-center">
          <p className="text-xs text-indigo-300 font-semibold mb-2">University Review Fast-Track</p>
          <button
            type="button"
            onClick={handleDemo}
            disabled={isDemoLoading}
            className="w-full py-2.5 px-4 text-xs font-bold rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white shadow-md transition flex items-center justify-center space-x-2 disabled:opacity-50"
          >
            <Database className="w-3.5 h-3.5" />
            <span>{isDemoLoading ? 'Setting up Demo...' : 'Load 1-Click Demo Data (Alex)'}</span>
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
              placeholder="alex@university.edu"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 transition"
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
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 transition"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2.5 text-xs font-bold rounded-xl bg-brand-500 hover:bg-brand-400 text-slate-950 shadow-lg shadow-brand-500/20 transition disabled:opacity-50 flex items-center justify-center space-x-2 mt-2"
          >
            <span>{isLoading ? 'Signing In...' : 'Sign In'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <p className="text-center text-xs text-slate-400 mt-6">
          Don't have an account?{' '}
          <Link to="/register" className="text-brand-400 hover:underline font-medium">
            Register here
          </Link>
        </p>
      </div>
    </div>
  );
};
