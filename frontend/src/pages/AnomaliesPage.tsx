import React, { useState, useEffect } from 'react';
import { AlertTriangle, ShieldAlert, Sparkles, TrendingUp, Info, ArrowRight } from 'lucide-react';
import { anomaliesApi, transactionsApi } from '../services/api';
import { AnomalyItem, Transaction } from '../types';
import { EmptyState } from '../components/EmptyState';
import { TransactionDetailDrawer } from '../components/TransactionDetailDrawer';

export const AnomaliesPage: React.FC = () => {
  const [anomalies, setAnomalies] = useState<AnomalyItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);

  const fetchAnomalies = async () => {
    setIsLoading(true);
    try {
      const res = await anomaliesApi.getAll();
      setAnomalies(res.data);
    } catch (err) {
      console.error('Failed to load anomalies', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAnomalies();
  }, []);

  const handleInspect = async (id: number) => {
    try {
      const res = await transactionsApi.getOne(id);
      setSelectedTx(res.data);
    } catch (err) {
      console.error('Failed to load transaction details', err);
    }
  };

  return (
    <div className="space-y-5 sm:space-y-6 animate-fade-in pb-12 max-w-5xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold font-display text-white tracking-tight">Anomaly Detection</h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Statistical outlier flags identifying spending spikes that deviate from your historical baselines.
        </p>
      </div>

      {/* Methodology Explainer Box */}
      <div className="fin-card p-4 sm:p-5 border border-white/[0.08] bg-white/[0.02]">
        <div className="flex items-start space-x-3">
          <div className="w-8 h-8 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
            <Info className="w-4 h-4" />
          </div>
          <div className="text-xs space-y-1">
            <h4 className="font-bold text-white">How Anomaly Detection Works in FinStudent AI</h4>
            <p className="text-slate-400 leading-relaxed">
              Unlike simplistic budget trackers that only compare against total monthly caps, FinStudent AI models individual category distributions using <strong>Robust Z-scores (Median Absolute Deviation)</strong> reinforced by an <strong>Isolation Forest</strong>. An expense is flagged if it represents a severe statistical outlier for that specific student category.
            </p>
          </div>
        </div>
      </div>

      {/* Anomalies List */}
      {anomalies.length > 0 ? (
        <div className="space-y-4">
          {anomalies.map((item) => (
            <div
              key={item.id}
              className="fin-card p-4 sm:p-6 border border-amber-500/30 bg-amber-500/[0.02] shadow-sm hover:border-amber-500/50 transition duration-200"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/[0.06]">
                <div className="flex items-start space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/15 text-amber-300 border border-amber-500/30 flex items-center justify-center shrink-0">
                    <AlertTriangle className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="text-base font-bold text-white">{item.description}</h3>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 uppercase">
                        Outlier
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Recorded on {item.date} • Category:{' '}
                      <span className="text-[#34d399] font-medium">{item.category}</span>
                    </p>
                  </div>
                </div>

                <div className="text-left sm:text-right font-mono-numbers">
                  <span className="text-xl sm:text-2xl font-bold text-rose-400">
                    ₹{item.amount.toLocaleString()}
                  </span>
                  <p className="text-xs text-amber-400 font-bold mt-0.5">
                    +{item.deviation_percent.toFixed(0)}% Deviation
                  </p>
                </div>
              </div>

              {/* Statistics Comparison Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 my-4">
                <div className="p-3 rounded-xl bg-[#0c0e12] border border-white/[0.06]">
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Transaction Amount</span>
                  <p className="text-base font-bold font-mono-numbers text-white mt-0.5">
                    ₹{item.amount.toLocaleString()}
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-[#0c0e12] border border-white/[0.06]">
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                    Historical {item.category} Average
                  </span>
                  <p className="text-base font-bold font-mono-numbers text-slate-300 mt-0.5">
                    ₹{item.historical_average.toLocaleString()}
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-[#0c0e12] border border-white/[0.06]">
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Anomaly Score</span>
                  <p className="text-base font-bold font-mono-numbers text-amber-400 mt-0.5">
                    {item.anomaly_score.toFixed(2)}{' '}
                    <span className="text-[10px] text-slate-500 font-normal">/ 1.00</span>
                  </p>
                </div>
              </div>

              {/* Anomaly Reason Narrative */}
              <p className="text-xs text-slate-300 bg-[#0c0e12] p-3 rounded-xl border border-white/[0.06] leading-relaxed mb-4">
                {item.anomaly_reason}
              </p>

              {/* Inspect Button */}
              <div className="flex justify-end">
                <button
                  onClick={() => handleInspect(item.id)}
                  className="flex items-center space-x-1.5 px-4 py-2 text-xs font-semibold rounded-full bg-white/[0.06] hover:bg-white/[0.1] text-slate-200 border border-white/[0.08] transition active:scale-95"
                >
                  <span>Inspect Explainability & Correct Category</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={AlertTriangle}
          title="No Unusual Spending Detected"
          description="All recorded student transactions currently align with your typical category spending patterns."
        />
      )}

      {/* Transaction Detail Drawer */}
      {selectedTx && (
        <TransactionDetailDrawer
          transaction={selectedTx}
          onClose={() => setSelectedTx(null)}
          onUpdated={() => {
            setSelectedTx(null);
            fetchAnomalies();
          }}
        />
      )}
    </div>
  );
};
