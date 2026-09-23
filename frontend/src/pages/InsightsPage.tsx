import React, { useState, useEffect } from 'react';
import { Sparkles, Eye, TrendingUp, AlertTriangle, Repeat, PiggyBank, ArrowRight, ShieldCheck } from 'lucide-react';
import { insightsApi, transactionsApi } from '../services/api';
import { Insight, Transaction } from '../types';
import { TransactionDetailDrawer } from '../components/TransactionDetailDrawer';

export const InsightsPage: React.FC = () => {
  const [insights, setInsights] = useState<Insight[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);
  const [drilldownCategory, setDrilldownCategory] = useState<string | null>(null);
  const [categoryTxs, setCategoryTxs] = useState<Transaction[]>([]);

  const fetchInsights = async () => {
    setIsLoading(true);
    try {
      const res = await insightsApi.getAll();
      setInsights(res.data);
    } catch (err) {
      console.error('Failed to load insights', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInsights();
  }, []);

  const handleViewSupportingTxs = async (category?: string) => {
    const target = category || 'Food';
    setDrilldownCategory(target);
    try {
      const res = await transactionsApi.getAll({ category: target, month: '2026-09' });
      setCategoryTxs(res.data);
    } catch (err) {
      console.error('Failed to load category transactions', err);
    }
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'warning':
        return 'bg-amber-500/15 text-amber-300 border-amber-500/30';
      case 'positive':
        return 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30';
      case 'attention':
        return 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30';
      default:
        return 'bg-brand-500/15 text-brand-300 border-brand-500/30';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'anomaly':
        return AlertTriangle;
      case 'recurring':
        return Repeat;
      case 'saving':
        return PiggyBank;
      case 'budget_risk':
        return TrendingUp;
      default:
        return Sparkles;
    }
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12 max-w-5xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold font-display text-white">Personalized Financial Insights</h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Grounded observations generated from mathematical facts. Every statement links to supporting transactional evidence.
        </p>
      </div>

      {/* Insights Grid */}
      <div className="space-y-4">
        {insights.map((ins) => {
          const Icon = getTypeIcon(ins.type);
          return (
            <div
              key={ins.id}
              className="glass-panel p-6 rounded-2xl border border-slate-800 hover:border-slate-700 transition duration-200"
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div className="flex items-start space-x-3.5">
                  <div className="w-10 h-10 rounded-xl bg-brand-500/10 border border-brand-500/20 text-brand-400 flex items-center justify-center shrink-0 mt-0.5">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <h3 className="text-base font-bold text-white font-display">{ins.title}</h3>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase tracking-wider ${getSeverityBadge(
                          ins.severity
                        )}`}
                      >
                        {ins.type}
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed max-w-3xl">{ins.description}</p>
                  </div>
                </div>

                {/* Supporting Transactions Button */}
                <button
                  onClick={() => handleViewSupportingTxs(ins.category || 'Food')}
                  className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition shrink-0 self-start sm:self-auto"
                >
                  <Eye className="w-3.5 h-3.5 text-brand-400" />
                  <span>View Supporting Transactions</span>
                </button>
              </div>

              {/* Supporting Numerical Facts Table */}
              {ins.supporting_data && typeof ins.supporting_data === 'object' && (
                <div className="mt-4 pt-3 border-t border-slate-800/80 flex flex-wrap items-center gap-3 text-[11px] text-slate-400 font-mono">
                  <span className="text-slate-500 uppercase tracking-wider font-sans font-bold text-[10px]">
                    Underlying Metrics:
                  </span>
                  {Object.entries(ins.supporting_data).map(([key, val]) => (
                    <span key={key} className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800">
                      <span className="text-slate-400">{key.replace(/_/g, ' ')}:</span>{' '}
                      <strong className="text-white">
                        {typeof val === 'number'
                          ? key.includes('amount') || key.includes('total') || key.includes('difference') || key.includes('budget') || key.includes('spend')
                            ? `₹${val.toLocaleString()}`
                            : val.toString()
                          : String(val)}
                      </strong>
                    </span>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Drill-down Supporting Transactions Modal */}
      {drilldownCategory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#0f172a] border border-slate-700/80 rounded-2xl max-w-2xl w-full p-6 shadow-2xl relative max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <div>
                <span className="text-[10px] uppercase font-bold text-brand-400">Ground-Truth Evidence</span>
                <h3 className="text-base font-bold text-white font-display">
                  {drilldownCategory} Transactions ({categoryTxs.length})
                </h3>
              </div>
              <button
                onClick={() => setDrilldownCategory(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
              >
                ✕
              </button>
            </div>

            <div className="overflow-y-auto flex-1 divide-y divide-slate-800/60 pr-1">
              {categoryTxs.length > 0 ? (
                categoryTxs.map((tx) => (
                  <div
                    key={tx.id}
                    onClick={() => setSelectedTx(tx)}
                    className="py-3 flex items-center justify-between hover:bg-slate-800/30 px-2 rounded-xl cursor-pointer transition"
                  >
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-semibold text-white">{tx.description}</span>
                        {tx.is_anomaly && (
                          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                            Outlier
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-slate-400">
                        {new Date(tx.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} • AI Confidence:{' '}
                        {(tx.ai_confidence * 100).toFixed(0)}%
                      </p>
                    </div>
                    <span className="font-mono font-bold text-xs text-white">₹{tx.amount.toLocaleString()}</span>
                  </div>
                ))
              ) : (
                <p className="py-8 text-center text-xs text-slate-500">No transactions recorded for this category.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Transaction Detail Drawer */}
      {selectedTx && (
        <TransactionDetailDrawer
          transaction={selectedTx}
          onClose={() => setSelectedTx(null)}
          onUpdated={() => {
            setSelectedTx(null);
            fetchInsights();
          }}
        />
      )}
    </div>
  );
};
