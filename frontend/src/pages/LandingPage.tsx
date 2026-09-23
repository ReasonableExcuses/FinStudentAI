import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  GraduationCap,
  Sparkles,
  TrendingUp,
  AlertTriangle,
  Repeat,
  PieChart,
  ArrowRight,
  ShieldCheck,
  Zap,
  CheckCircle2,
  Database
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const LandingPage: React.FC = () => {
  const { seedDemo } = useAuth();
  const navigate = useNavigate();
  const [isSeeding, setIsSeeding] = useState(false);

  const handleDemoClick = async () => {
    setIsSeeding(true);
    await seedDemo();
    setIsSeeding(false);
    navigate('/dashboard');
  };

  const features = [
    {
      icon: Sparkles,
      title: 'Smart Categorization',
      description: 'Automatically classify transactions from natural descriptions using TF-IDF and keyword heuristics.',
      tag: 'NLP Model',
      color: 'teal',
    },
    {
      icon: PieChart,
      title: 'Spending Intelligence',
      description: 'Understand where your money goes across food, rent, mess, transit, and textbooks with rich interactive charts.',
      tag: 'Analytics',
      color: 'indigo',
    },
    {
      icon: TrendingUp,
      title: 'Predictive Insights',
      description: 'Estimate future month expenditure and category ranges from your historical spending trajectory.',
      tag: 'Time-Series ML',
      color: 'emerald',
    },
    {
      icon: AlertTriangle,
      title: 'Budget Awareness',
      description: 'Project whether your current spending velocity will breach entered budgets before month-end.',
      tag: 'Budget Projection',
      color: 'amber',
    },
    {
      icon: Repeat,
      title: 'Recurring Subscriptions',
      description: 'Auto-detect repeated Netflix, Spotify, gym, and rent expenses with merchant normalization.',
      tag: 'Clustering',
      color: 'rose',
    },
    {
      icon: ShieldCheck,
      title: 'Anomaly Detection',
      description: 'Highlight statistical spending outliers using category-specific robust Z-scores and Isolation Forest.',
      tag: 'Outlier Detection',
      color: 'teal',
    },
  ];

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 flex flex-col selection:bg-brand-500 selection:text-slate-950">
      {/* Top Navbar */}
      <nav className="h-20 border-b border-slate-800/80 px-6 max-w-7xl w-full mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-brand-600 to-teal-400 flex items-center justify-center shadow-lg shadow-teal-500/25">
            <GraduationCap className="w-6 h-6 text-slate-950 font-bold" />
          </div>
          <div>
            <span className="font-display font-bold text-lg text-white tracking-wide">
              FinStudent <span className="text-brand-400 text-xs px-2 py-0.5 rounded bg-brand-500/10 border border-brand-500/20">AI</span>
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={handleDemoClick}
            disabled={isSeeding}
            className="flex items-center space-x-2 px-4 py-2 text-xs font-semibold rounded-xl bg-indigo-500/15 hover:bg-indigo-500/25 text-indigo-300 border border-indigo-500/30 transition shadow-sm"
          >
            <Database className="w-3.5 h-3.5" />
            <span>{isSeeding ? 'Seeding Profile...' : 'Try Demo'}</span>
          </button>
          <Link
            to="/login"
            className="px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white transition"
          >
            Sign In
          </Link>
          <Link
            to="/register"
            className="px-4 py-2 text-xs font-bold rounded-xl bg-brand-500 hover:bg-brand-400 text-slate-950 shadow-md shadow-brand-500/20 transition"
          >
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="flex-1 max-w-5xl mx-auto px-6 pt-20 pb-16 text-center flex flex-col items-center justify-center">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-300 text-xs font-medium mb-6">
          <Sparkles className="w-3.5 h-3.5" />
          <span>University Innovative Design Project • Machine Learning & Analytics</span>
        </div>

        <h1 className="font-display text-4xl sm:text-6xl font-extrabold tracking-tight text-white max-w-4xl leading-tight">
          Understand where your money goes. <br />
          <span className="bg-gradient-to-r from-brand-400 via-teal-300 to-indigo-400 bg-clip-text text-transparent">
            Predict where it will go next.
          </span>
        </h1>

        <p className="mt-6 text-base sm:text-lg text-slate-400 max-w-2xl leading-relaxed">
          An AI-powered personal finance tracker designed specifically for university students.
          Combines conventional expense tracking with lightweight NLP, statistical anomaly detection,
          and time-series forecasting.
        </p>

        {/* CTA Buttons */}
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 w-full max-w-md">
          <button
            onClick={handleDemoClick}
            disabled={isSeeding}
            className="w-full sm:w-auto px-7 py-3 rounded-xl bg-brand-500 hover:bg-brand-400 text-slate-950 font-bold text-sm shadow-xl shadow-brand-500/25 flex items-center justify-center space-x-2 transition"
          >
            <Zap className="w-4 h-4 fill-current" />
            <span>{isSeeding ? 'Setting Up Demo...' : 'Try Demo Mode'}</span>
          </button>
          <Link
            to="/register"
            className="w-full sm:w-auto px-7 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 font-semibold text-sm flex items-center justify-center space-x-2 transition"
          >
            <span>Create Account</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Pipeline Diagram Bar */}
        <div className="mt-14 w-full p-4 rounded-2xl bg-slate-900/60 border border-slate-800 max-w-3xl">
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest mb-3">
            Core Intelligence Pipeline
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2 text-xs font-mono text-slate-300">
            <span className="px-3 py-1 rounded-lg bg-slate-800 border border-slate-700 text-slate-300">Recording</span>
            <span className="text-brand-400">→</span>
            <span className="px-3 py-1 rounded-lg bg-slate-800 border border-slate-700 text-teal-300">Understanding</span>
            <span className="text-brand-400">→</span>
            <span className="px-3 py-1 rounded-lg bg-slate-800 border border-slate-700 text-amber-300">Detecting</span>
            <span className="text-brand-400">→</span>
            <span className="px-3 py-1 rounded-lg bg-slate-800 border border-slate-700 text-indigo-300">Predicting</span>
            <span className="text-brand-400">→</span>
            <span className="px-3 py-1 rounded-lg bg-brand-500/20 border border-brand-500/40 text-brand-300 font-bold">Personalized Insights</span>
          </div>
        </div>
      </section>

      {/* Feature Cards Grid */}
      <section className="max-w-7xl mx-auto px-6 py-16 w-full">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold font-display text-white">
            Beyond Standard CRUD Expense Trackers
          </h2>
          <p className="text-sm text-slate-400 mt-2">
            Every feature connects historical student behavior to predictive, actionable intelligence.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f, i) => {
            const Icon = f.icon;
            return (
              <div
                key={i}
                className="glass-panel p-6 rounded-2xl border border-slate-800 hover:border-slate-700 transition duration-200 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 rounded-xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center text-brand-400">
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700 uppercase tracking-wider">
                      {f.tag}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-white mb-2 font-display">{f.title}</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">{f.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Educational Disclaimer Footer */}
      <footer className="mt-auto border-t border-slate-800/80 bg-slate-950/80 py-8 px-6 text-center">
        <div className="max-w-3xl mx-auto space-y-3">
          <p className="text-xs text-slate-400 leading-relaxed">
            <strong className="text-slate-300">Disclaimer:</strong> FinStudent AI provides educational and
            informational insights from user-entered financial data. It does not provide professional financial,
            tax, or investment advice.
          </p>
          <p className="text-[11px] text-slate-500">
            University Innovative Design Project • Final Demonstration MVP
          </p>
        </div>
      </footer>
    </div>
  );
};
