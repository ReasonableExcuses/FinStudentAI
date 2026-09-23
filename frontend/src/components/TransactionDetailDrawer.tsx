import React, { useState } from 'react';
import { X, Sparkles, AlertTriangle, Check, RefreshCw, Calendar, Tag, CreditCard } from 'lucide-react';
import { Transaction } from '../types';
import { transactionsApi } from '../services/api';

interface TransactionDetailDrawerProps {
  transaction: Transaction | null;
  onClose: () => void;
  onUpdated: () => void;
}

const CATEGORIES = [
  'Food',
  'Transportation',
  'Education',
  'Entertainment',
  'Shopping',
  'Bills',
  'Health',
  'Subscriptions',
  'Accommodation',
  'Income',
  'Freelance',
  'Other',
];

export const TransactionDetailDrawer: React.FC<TransactionDetailDrawerProps> = ({
  transaction,
  onClose,
  onUpdated,
}) => {
  if (!transaction) return null;

  const [selectedCategory, setSelectedCategory] = useState(transaction.final_category);
  const [isUpdating, setIsUpdating] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleCategoryChange = async (newCategory: string) => {
    setSelectedCategory(newCategory);
    setIsUpdating(true);
    setSuccessMsg(null);
    try {
      await transactionsApi.update(transaction.id, { final_category: newCategory });
      setSuccessMsg('Category updated successfully!');
      onUpdated();
    } catch (err) {
      console.error('Failed to override category', err);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/70 backdrop-blur-md animate-fade-in">
      <div className="w-full sm:max-w-md bg-[#151821] border-l border-white/[0.08] h-full p-6 flex flex-col shadow-2xl overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/[0.08]">
          <div>
            <span className="text-[10px] uppercase font-mono font-semibold tracking-wider text-emerald-400">
              Audit & Explainability
            </span>
            <h3 className="text-base font-bold text-white font-display mt-0.5">{transaction.description}</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/[0.05] transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Amount & Date Card */}
        <div className="my-5 p-4 rounded-xl bg-[#0c0e12] border border-white/[0.08] flex items-center justify-between">
          <div>
            <p className="text-[11px] font-medium text-slate-400">Amount</p>
            <p
              className={`text-2xl font-bold font-mono ${
                transaction.type === 'income' ? 'text-emerald-400' : 'text-white'
              }`}
            >
              {transaction.type === 'income' ? '+' : '-'}₹{transaction.amount.toLocaleString()}
            </p>
          </div>
          <div className="text-right">
            <span
              className={`px-2.5 py-1 rounded-full text-[11px] font-semibold ${
                transaction.type === 'income'
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                  : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
              }`}
            >
              {transaction.type.toUpperCase()}
            </span>
            <p className="text-xs text-slate-400 mt-1.5 font-mono">
              {new Date(transaction.date).toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              })}
            </p>
          </div>
        </div>

        {/* AI Explainability Section */}
        <div className="space-y-4 flex-1">
          <div className="p-4 rounded-xl bg-[#0c0e12] border border-white/[0.08] space-y-3">
            <div className="flex items-center space-x-2 text-xs font-semibold text-emerald-400">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <span>Categorization Pipeline</span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-3 rounded-lg bg-[#151821] border border-white/[0.06]">
                <p className="text-slate-400 text-[10px] uppercase font-mono">Predicted Category</p>
                <p className="font-semibold text-white mt-1">{transaction.ai_category || transaction.final_category}</p>
              </div>
              <div className="p-3 rounded-lg bg-[#151821] border border-white/[0.06]">
                <p className="text-slate-400 text-[10px] uppercase font-mono">Model Confidence</p>
                <p className="font-semibold text-emerald-400 mt-1 font-mono">
                  {(transaction.ai_confidence * 100).toFixed(0)}%
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-300 bg-[#151821] p-3 rounded-lg border border-white/[0.06] leading-relaxed">
              {transaction.classification_reason || 'Identified based on description patterns.'}
            </p>
          </div>

          {/* Anomaly Detection Status */}
          <div
            className={`p-4 rounded-xl border ${
              transaction.is_anomaly
                ? 'bg-amber-500/10 border-amber-500/30 text-amber-200'
                : 'bg-[#0c0e12] border-white/[0.08] text-slate-300'
            }`}
          >
            <div className="flex items-center space-x-2 text-xs font-semibold mb-2">
              <AlertTriangle
                className={`w-4 h-4 ${transaction.is_anomaly ? 'text-amber-400' : 'text-slate-400'}`}
              />
              <span>Anomaly Assessment</span>
              {transaction.is_anomaly && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 uppercase">
                  Unusual
                </span>
              )}
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs mb-2">
              <div>
                <span className="text-slate-400 text-[10px] uppercase font-mono">Anomaly Score: </span>
                <span className="font-mono font-bold text-white">{transaction.anomaly_score.toFixed(2)}</span>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] uppercase font-mono">Recurring: </span>
                <span className="font-bold text-white">{transaction.is_recurring ? 'Yes' : 'No'}</span>
              </div>
            </div>

            <p className="text-xs leading-relaxed text-slate-300">
              {transaction.anomaly_reason || 'Normal transaction consistent with your typical spending profile.'}
            </p>
          </div>

          {/* Change Category / Human Correction */}
          <div className="p-4 rounded-xl bg-[#0c0e12] border border-white/[0.08]">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-slate-200">
                Override Final Category
              </label>
              {transaction.ai_category && transaction.ai_category !== selectedCategory && (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  User Corrected
                </span>
              )}
            </div>

            <select
              value={selectedCategory}
              disabled={isUpdating}
              onChange={(e) => handleCategoryChange(e.target.value)}
              className="w-full px-3 py-2.5 rounded-lg bg-[#151821] border border-white/[0.12] text-xs text-white focus:outline-none focus:border-emerald-500 transition cursor-pointer"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>

            {successMsg && (
              <p className="text-[11px] text-emerald-400 mt-2 flex items-center gap-1 font-medium">
                <Check className="w-3.5 h-3.5" />
                <span>{successMsg}</span>
              </p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-white/[0.08] text-[11px] text-slate-500 text-center font-mono">
          Method: {transaction.payment_method || 'UPI'} • Pipeline: Multi-Stage
        </div>
      </div>
    </div>
  );
};
