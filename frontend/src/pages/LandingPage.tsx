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
  Database,
  Search,
  ArrowUpRight,
  Calendar,
  Layers
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

  const pipelineStages = [
    {
      num: '01',
      title: 'Recording',
      desc: 'Quick manual logging or instant CSV bank statement import with format validation.',
      badge: 'Capture',
    },
    {
      num: '02',
      title: 'Understanding',
      desc: 'Real-time NLP categorizer (heuristics + TF-IDF) with calibrated 70–98% confidence.',
      badge: 'NLP AI',
    },
    {
      num: '03',
      title: 'Detecting',
      desc: 'Robust Z-score via MAD & Isolation Forest detects abnormal canteen or party splurges.',
      badge: 'MAD + IF',
    },
    {
      num: '04',
      title: 'Predicting',
      desc: 'Weighted moving average forecasting & velocity projection before month-end breaches.',
      badge: 'Time-Series',
    },
    {
      num: '05',
      title: 'Advising',
      desc: 'Plain-English personalized insights and grounded Q&A derived from database facts.',
      badge: 'Explainable',
    },
  ];

  return (
    <div className="min-h-screen bg-[#0c0e12] text-slate-100 flex flex-col selection:bg-[#10b981] selection:text-[#042f1a]">
      {/* Top Navigation */}
      <header className="h-20 border-b border-white/[0.08] bg-[#0c0e12]/90 backdrop-blur-md sticky top-0 z-30 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto h-full flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-[#10b981] flex items-center justify-center text-[#042f1a] font-bold shadow-sm">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <span className="font-display font-bold text-base sm:text-lg text-white tracking-tight flex items-center gap-1.5">
                FinStudent <span className="text-[#10b981] text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#10b981]/15 border border-[#10b981]/30">AI</span>
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-2 sm:space-x-4">
            <button
              onClick={handleDemoClick}
              disabled={isSeeding}
              className="flex items-center space-x-1.5 px-3 sm:px-4 py-2 text-xs font-semibold rounded-full bg-white/[0.06] hover:bg-white/[0.12] text-slate-200 border border-white/[0.1] transition active:scale-95 disabled:opacity-50"
            >
              <Database className="w-3.5 h-3.5 text-[#38bdf8]" />
              <span className="hidden xs:inline">{isSeeding ? 'Seeding...' : 'Try Demo'}</span>
              <span className="xs:hidden">Demo</span>
            </button>
            <Link
              to="/login"
              className="px-3 sm:px-4 py-2 text-xs font-medium text-slate-300 hover:text-white transition"
            >
              Sign In
            </Link>
            <Link
              to="/register"
              className="px-3.5 sm:px-5 py-2 text-xs font-bold rounded-full bg-[#10b981] hover:bg-[#34d399] text-[#042f1a] transition active:scale-95 shadow-sm"
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-8 pt-12 sm:pt-20 pb-16 w-full">
        <div className="max-w-3xl mx-auto text-center">
          {/* Status Pill */}
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-[#10b981]/10 border border-[#10b981]/25 text-[#34d399] text-xs font-medium mb-6">
            <span className="w-2 h-2 rounded-full bg-[#10b981] animate-pulse" />
            <span>University Innovative Design Project • 100% Self-Contained Local AI</span>
          </div>

          <h1 className="font-display text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-[1.12]">
            Student finances without the guesswork.
          </h1>

          <p className="mt-5 text-base sm:text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
            FinStudent AI goes beyond static expense tracking. It learns from your transaction descriptions, 
            detects unusual food or party splurges, forecasts next month's burn rate, and delivers 
            clear, supportive personalized insights.
          </p>

          {/* CTAs */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3 w-full max-w-md mx-auto">
            <button
              onClick={handleDemoClick}
              disabled={isSeeding}
              className="w-full sm:w-auto px-7 py-3 rounded-full bg-[#10b981] hover:bg-[#34d399] text-[#042f1a] font-bold text-sm shadow-md flex items-center justify-center space-x-2 transition active:scale-95"
            >
              <Zap className="w-4 h-4 fill-current" />
              <span>{isSeeding ? 'Populating Demo...' : 'Try Live Demo (1-Click)'}</span>
            </button>
            <a
              href="#pipeline"
              className="w-full sm:w-auto px-6 py-3 rounded-full bg-white/[0.06] hover:bg-white/[0.1] text-slate-200 border border-white/[0.1] font-semibold text-sm flex items-center justify-center space-x-2 transition"
            >
              <span>Explore Architecture</span>
              <ArrowRight className="w-4 h-4 text-slate-400" />
            </a>
          </div>
        </div>

        {/* Live Interactive UI Teaser Card */}
        <div className="mt-12 sm:mt-16 max-w-4xl mx-auto fin-card p-4 sm:p-7 border border-white/[0.09] shadow-2xl relative overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-white/[0.08]">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-white/[0.06] flex items-center justify-center text-[#10b981] font-bold text-sm">
                A
              </div>
              <div>
                <p className="text-sm font-semibold text-white">Alex • 3rd Year Computer Engineering</p>
                <p className="text-xs text-slate-400">Hosteller • Monthly Allowance: ₹24,000</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs px-2.5 py-1 rounded-full bg-[#10b981]/15 text-[#34d399] font-medium border border-[#10b981]/30">
                September 2026 Live Pulse
              </span>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-5">
            <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.05]">
              <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Current Balance</p>
              <p className="text-xl font-bold text-white mt-1 font-mono-numbers">₹18,420</p>
            </div>
            <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.05]">
              <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Month Expenses</p>
              <p className="text-xl font-bold text-slate-200 mt-1 font-mono-numbers">₹15,580</p>
            </div>
            <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.05]">
              <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Month Savings</p>
              <p className="text-xl font-bold text-[#10b981] mt-1 font-mono-numbers">+₹8,420</p>
            </div>
            <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.05]">
              <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Budget Pace</p>
              <p className="text-xl font-bold text-amber-400 mt-1 font-mono-numbers">71% Used</p>
            </div>
          </div>

          {/* Interactive ML Sample Strip */}
          <div className="mt-2 p-3 sm:p-4 rounded-xl bg-[#0c0e12]/80 border border-white/[0.07] flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-xs">
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-[#10b981]" />
              <span className="text-slate-300 font-mono">"Uber ride to university labs"</span>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-slate-400">AI Category:</span>
              <span className="px-2 py-0.5 rounded-full bg-[#38bdf8]/15 text-[#38bdf8] font-semibold border border-[#38bdf8]/30">
                Transportation
              </span>
              <span className="text-slate-500 font-mono">94% Confidence</span>
              <span className="text-emerald-400 font-semibold ml-2">Normal Spend (₹180)</span>
            </div>
          </div>
        </div>
      </section>

      {/* The 5-Stage Core Pipeline */}
      <section id="pipeline" className="max-w-7xl mx-auto px-4 sm:px-8 py-16 w-full border-t border-white/[0.06]">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <p className="text-xs font-semibold text-[#10b981] uppercase tracking-widest mb-2">
            System Architecture
          </p>
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-white tracking-tight">
            The 5-Stage Financial Pipeline
          </h2>
          <p className="text-sm text-slate-400 mt-2">
            Moving beyond manual data entry into autonomous detection, predictive modeling, and explainable insights.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {pipelineStages.map((stage) => (
            <div
              key={stage.num}
              className="fin-card p-5 border border-white/[0.08] flex flex-col justify-between hover:border-[#10b981]/40 transition"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="font-mono text-xs font-bold text-slate-500">{stage.num}</span>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-white/[0.06] text-slate-300 border border-white/[0.08]">
                    {stage.badge}
                  </span>
                </div>
                <h3 className="text-base font-semibold text-white mb-2 font-display">{stage.title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">{stage.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Bento Grid Features */}
      <section className="max-w-7xl mx-auto px-4 sm:px-8 py-16 w-full border-t border-white/[0.06]">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Engineered Specifically for University Students
          </h2>
          <p className="text-sm text-slate-400 mt-2">
            Zero fabricated numbers. Real statistical logic built for mess fees, shared rides, book expenses, and digital subscriptions.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Card 1: NLP Categorizer */}
          <div className="fin-card p-6 border border-white/[0.08]">
            <div className="w-10 h-10 rounded-xl bg-[#10b981]/15 text-[#34d399] flex items-center justify-center mb-4">
              <Sparkles className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white mb-2">Automated Categorization</h3>
            <p className="text-xs text-slate-400 leading-relaxed mb-4">
              Deterministic campus regex heuristics combined with TF-IDF Logistic Regression. Achieves 84.6% accuracy on campus transaction benchmarks.
            </p>
            <div className="p-2.5 rounded-lg bg-white/[0.02] border border-white/[0.06] text-[11px] font-mono text-slate-300">
              "Mess fees for semester" → <span className="text-[#10b981] font-semibold">Food (96%)</span>
            </div>
          </div>

          {/* Card 2: Anomaly Detection */}
          <div className="fin-card p-6 border border-white/[0.08]">
            <div className="w-10 h-10 rounded-xl bg-amber-500/15 text-amber-400 flex items-center justify-center mb-4">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white mb-2">Robust Anomaly Detection</h3>
            <p className="text-xs text-slate-400 leading-relaxed mb-4">
              Replaces arbitrary thresholds with category-specific Median Absolute Deviation (MAD) and Isolation Forest models to flag true outliers.
            </p>
            <div className="p-2.5 rounded-lg bg-white/[0.02] border border-white/[0.06] text-[11px] font-mono text-slate-300">
              ₹1,800 dinner → <span className="text-amber-400 font-semibold">+1004% vs ₹163 avg</span>
            </div>
          </div>

          {/* Card 3: Velocity Budget Projections */}
          <div className="fin-card p-6 border border-white/[0.08]">
            <div className="w-10 h-10 rounded-xl bg-[#38bdf8]/15 text-[#38bdf8] flex items-center justify-center mb-4">
              <TrendingUp className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white mb-2">Velocity-Based Forecast</h3>
            <p className="text-xs text-slate-400 leading-relaxed mb-4">
              Weighted Moving Average + Linear Trend project next month's spending, while daily spending velocity alerts you before category budgets breach.
            </p>
            <div className="p-2.5 rounded-lg bg-white/[0.02] border border-white/[0.06] text-[11px] font-mono text-slate-300">
              Food Pace: <span className="text-rose-400 font-semibold">Projected ₹5,300 &gt; ₹5,000</span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-white/[0.08] bg-[#090b0e] py-8 px-4 sm:px-8 text-center">
        <div className="max-w-3xl mx-auto space-y-3">
          <p className="text-xs text-slate-400 leading-relaxed">
            <strong className="text-slate-300">Disclaimer:</strong> FinStudent AI provides educational and
            informational financial insights from entered transaction data. It does not provide regulated financial or investment advice.
          </p>
          <p className="text-[11px] text-slate-500 font-mono">
            University Innovative Design Project • Working Demonstration MVP • Firebase Hosted
          </p>
        </div>
      </footer>
    </div>
  );
};
