import React, { useState, useEffect } from 'react';
import { Repeat, Calendar, CheckCircle2, ShieldCheck, Zap, CreditCard, Sparkles } from 'lucide-react';
import { recurringApi } from '../services/api';
import { RecurringSummary, RecurringExpense } from '../types';
import { EmptyState } from '../components/EmptyState';

export const RecurringPage: React.FC = () => {
  const [data, setData] = useState<RecurringSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchRecurring = async () => {
    setIsLoading(true);
    try {
      const res = await recurringApi.getAll();
      setData(res.data);
    } catch (err) {
      console.error('Failed to load recurring subscriptions', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRecurring();
  }, []);

  return (
    <div className="space-y-5 sm:space-y-6 animate-fade-in pb-12 max-w-5xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold font-display text-white tracking-tight">Subscriptions & Bills</h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Automatic discovery of student subscriptions and recurring bills via merchant normalization and cadence clustering.
        </p>
      </div>

      {/* Aggregate Monthly Commitment Card */}
      <div className="fin-card p-4 sm:p-6 border border-white/[0.08] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3 sm:space-x-4">
          <div className="w-11 h-11 rounded-xl bg-indigo-500/15 border border-indigo-500/30 text-indigo-400 flex items-center justify-center shrink-0">
            <Repeat className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-300">
              Fixed Monthly Commitments
            </span>
            <h3 className="text-xl sm:text-2xl font-bold font-mono-numbers text-white mt-0.5">
              ₹{data?.total_monthly_recurring?.toLocaleString() || '617'}{' '}
              <span className="text-xs font-normal text-slate-400">/ month</span>
            </h3>
            <p className="text-xs text-slate-400">
              {data?.subscription_count || 3} recurring payment streams identified
            </p>
          </div>
        </div>

        <div className="p-3 sm:px-4 sm:py-2.5 rounded-xl bg-white/[0.02] border border-white/[0.06] text-left sm:text-right font-mono-numbers w-full sm:w-auto">
          <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Annual Projected Commitment</span>
          <p className="text-base font-bold text-slate-200 mt-0.5">
            ₹{((data?.total_monthly_recurring || 617) * 12).toLocaleString()}
          </p>
        </div>
      </div>

      {/* Detected Subscriptions List */}
      {data?.recurring_items && data.recurring_items.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {data.recurring_items.map((item) => (
            <div
              key={item.id}
              className="fin-card p-4 sm:p-5 border border-white/[0.08] hover:border-white/[0.14] transition duration-200 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-9 h-9 rounded-xl bg-[#10b981]/15 border border-[#10b981]/30 flex items-center justify-center text-[#10b981] font-bold text-xs">
                    <Repeat className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-white/[0.06] text-slate-300 border border-white/[0.08] capitalize">
                    {item.frequency}
                  </span>
                </div>

                <h3 className="text-base font-bold text-white font-display mb-1">{item.merchant}</h3>
                <p className="text-xs text-slate-400 mb-4">
                  Category: <span className="text-slate-300 font-medium">{item.category}</span>
                </p>

                <div className="p-3 rounded-xl bg-[#0c0e12] border border-white/[0.06] space-y-1.5 text-xs mb-3 font-mono-numbers">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Amount:</span>
                    <span className="font-bold text-white">₹{item.amount.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Cadence:</span>
                    <span className="text-slate-200 font-medium">{item.occurrences} transactions</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Detection Confidence:</span>
                    <span className="text-[#10b981] font-semibold">
                      {(item.confidence * 100).toFixed(0)}%
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-white/[0.06] flex items-center justify-between text-[11px] text-slate-400">
                <span>Normalized:</span>
                <span className="font-mono text-slate-300">{item.merchant}</span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Repeat}
          title="No Recurring Subscriptions Found"
          description="Log multiple recurring charges (e.g. Netflix, gym, rent) across dates to enable automatic subscription discovery."
        />
      )}
    </div>
  );
};
