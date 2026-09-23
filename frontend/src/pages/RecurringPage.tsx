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
    <div className="space-y-6 animate-fade-in pb-12 max-w-5xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold font-display text-white">Subscriptions & Recurring Bills</h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Automatic discovery of student subscriptions, rent, and periodic bills through merchant normalization and interval clustering.
        </p>
      </div>

      {/* Aggregate Monthly Commitment Card */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 bg-gradient-to-r from-slate-900/90 to-indigo-950/20">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-500/15 border border-indigo-500/30 text-indigo-400 flex items-center justify-center shrink-0">
            <Repeat className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-300">
              Fixed Student Commitments
            </span>
            <h3 className="text-2xl font-bold font-mono text-white mt-0.5">
              ₹{data?.total_monthly_recurring?.toLocaleString() || '617'}{' '}
              <span className="text-xs font-normal text-slate-400">/ month</span>
            </h3>
            <p className="text-xs text-slate-400">
              {data?.subscription_count || 3} active recurring payment streams identified
            </p>
          </div>
        </div>

        <div className="px-4 py-2.5 rounded-xl bg-slate-900/80 border border-slate-800 text-right">
          <span className="text-[10px] text-slate-400 uppercase tracking-wider">Annual Projected Commitment</span>
          <p className="text-base font-bold font-mono text-slate-200">
            ₹{((data?.total_monthly_recurring || 617) * 12).toLocaleString()}
          </p>
        </div>
      </div>

      {/* Detected Subscriptions List */}
      {data?.recurring_items && data.recurring_items.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {data.recurring_items.map((item) => (
            <div
              key={item.id}
              className="glass-panel p-5 rounded-2xl border border-slate-800 hover:border-slate-700 transition duration-200 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-9 h-9 rounded-xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center text-brand-400 font-bold text-xs">
                    <Repeat className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-brand-300 border border-slate-700">
                    {item.frequency}
                  </span>
                </div>

                <h3 className="text-base font-bold text-white font-display mb-1">{item.merchant}</h3>
                <p className="text-xs text-slate-400 mb-4">
                  Category: <span className="text-slate-300 font-medium">{item.category}</span>
                </p>

                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1.5 text-xs mb-3">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Typical Amount:</span>
                    <span className="font-mono font-bold text-white">₹{item.amount.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Occurrences:</span>
                    <span className="text-slate-200 font-medium">{item.occurrences} recorded</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Detection Confidence:</span>
                    <span className="font-mono text-brand-400 font-semibold">
                      {(item.confidence * 100).toFixed(0)}%
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 text-[11px] text-slate-500 flex items-center justify-between">
                <span>Last Detected:</span>
                <span>{new Date(item.last_detected).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Repeat}
          title="No Recurring Expenses Detected Yet"
          description="Once you have recorded 2 or more periodic payments with similar merchants and dates, they will automatically appear here."
        />
      )}
    </div>
  );
};
