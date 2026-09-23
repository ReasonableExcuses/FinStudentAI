import React, { useState, useEffect } from 'react';
import { X, Sparkles, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { transactionsApi } from '../services/api';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialData?: any;
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

export const TransactionModal: React.FC<TransactionModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  initialData,
}) => {
  const [type, setType] = useState<'expense' | 'income'>(initialData?.type || 'expense');
  const [description, setDescription] = useState(initialData?.description || '');
  const [amount, setAmount] = useState<string>(initialData?.amount?.toString() || '');
  const [date, setDate] = useState(
    initialData?.date ? initialData.date.substring(0, 10) : new Date().toISOString().substring(0, 10)
  );
  const [category, setCategory] = useState(initialData?.final_category || '');
  const [paymentMethod, setPaymentMethod] = useState(initialData?.payment_method || 'UPI');
  const [notes, setNotes] = useState(initialData?.notes || '');

  // AI Classification state
  const [aiSuggestion, setAiSuggestion] = useState<{
    category: string;
    confidence: number;
    reason: string;
    method: string;
  } | null>(null);
  const [isClassifying, setIsClassifying] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Auto-classify description when user finishes typing
  useEffect(() => {
    if (!description.trim() || description.length < 3 || initialData) return;

    const timer = setTimeout(async () => {
      setIsClassifying(true);
      try {
        const res = await transactionsApi.classify({
          description: description.trim(),
          amount: amount ? parseFloat(amount) : undefined,
        });
        setAiSuggestion(res.data);
        if (!category) {
          setCategory(res.data.category);
        }
      } catch (err) {
        console.error('AI classification failed', err);
      } finally {
        setIsClassifying(false);
      }
    }, 450);

    return () => clearTimeout(timer);
  }, [description, amount]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description || !amount) {
      setError('Please provide a description and amount.');
      return;
    }

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setError('Amount must be a positive number.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const payload = {
        description: description.trim(),
        amount: numAmount,
        type,
        date: new Date(date).toISOString(),
        final_category: category || (aiSuggestion?.category || 'Other'),
        ai_category: aiSuggestion?.category || category,
        ai_confidence: aiSuggestion?.confidence || 1.0,
        classification_reason: aiSuggestion?.reason || 'User manual assignment',
        payment_method: paymentMethod,
        notes: notes.trim() || null,
      };

      if (initialData?.id) {
        await transactionsApi.update(initialData.id, payload);
      } else {
        await transactionsApi.create(payload);
      }

      onSuccess();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to save transaction.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#151821] border border-white/[0.1] rounded-2xl max-w-lg w-full p-5 sm:p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/[0.06] transition"
        >
          <X className="w-5 h-5" />
        </button>

        <h3 className="text-base sm:text-lg font-bold text-white mb-1 font-display tracking-tight">
          {initialData ? 'Edit Transaction' : 'Record Transaction'}
        </h3>
        <p className="text-xs text-slate-400 mb-5">
          Enter transaction details to trigger automated NLP classification and anomaly evaluation.
        </p>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Type Switcher */}
          <div className="grid grid-cols-2 gap-2 p-1 bg-[#0c0e12] rounded-xl border border-white/[0.08]">
            <button
              type="button"
              onClick={() => setType('expense')}
              className={`py-2 text-xs font-semibold rounded-lg transition ${
                type === 'expense'
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Expense
            </button>
            <button
              type="button"
              onClick={() => setType('income')}
              className={`py-2 text-xs font-semibold rounded-lg transition ${
                type === 'income'
                  ? 'bg-[#10b981]/20 text-[#34d399] border border-[#10b981]/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Income
            </button>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Description <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Uber to college, Canteen lunch, Library books"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#0c0e12] border border-white/[0.08] text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#10b981] transition"
            />
          </div>

          {/* AI Category Suggestion Pill */}
          {description.trim().length >= 3 && (
            <div className="p-3 rounded-xl bg-[#0c0e12] border border-white/[0.06] flex items-center justify-between text-xs">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-[#10b981] animate-pulse" />
                <div>
                  <span className="text-slate-400">AI Suggested Category: </span>
                  {isClassifying ? (
                    <span className="text-[#10b981] font-medium">Analyzing...</span>
                  ) : aiSuggestion ? (
                    <span className="text-[#34d399] font-semibold">{aiSuggestion.category}</span>
                  ) : (
                    <span className="text-slate-500">Awaiting input</span>
                  )}
                </div>
              </div>
              {aiSuggestion && !isClassifying && (
                <div className="flex items-center space-x-1.5">
                  <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-[#10b981]/15 text-[#34d399] border border-[#10b981]/30">
                    {(aiSuggestion.confidence * 100).toFixed(0)}% Confidence
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Amount and Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Amount (₹) <span className="text-rose-400">*</span>
              </label>
              <input
                type="number"
                step="any"
                required
                placeholder="₹ Amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#0c0e12] border border-white/[0.08] text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#10b981] transition font-mono-numbers"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Date</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#0c0e12] border border-white/[0.08] text-sm text-white focus:outline-none focus:border-[#10b981] transition"
              />
            </div>
          </div>

          {/* Category selection / Override */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-medium text-slate-300">
                Final Category {aiSuggestion && <span className="text-slate-500 text-[10px]">(Manual Override Allowed)</span>}
              </label>
            </div>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#0c0e12] border border-white/[0.08] text-sm text-white focus:outline-none focus:border-[#10b981] transition"
            >
              <option value="">Select Category...</option>
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Payment Method */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Payment Method</label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#0c0e12] border border-white/[0.08] text-sm text-white focus:outline-none focus:border-[#10b981] transition"
              >
                <option value="UPI">UPI</option>
                <option value="Cash">Cash</option>
                <option value="Card">Debit / Credit Card</option>
                <option value="NetBanking">NetBanking</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Notes (Optional)</label>
              <input
                type="text"
                placeholder="Optional tag or note"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#0c0e12] border border-white/[0.08] text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#10b981] transition"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-white/[0.06]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white rounded-full hover:bg-white/[0.06] transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 text-xs font-bold bg-[#10b981] hover:bg-[#34d399] text-[#042f1a] rounded-full transition active:scale-95 disabled:opacity-50 flex items-center space-x-2"
            >
              <span>{isSubmitting ? 'Saving...' : initialData ? 'Update' : 'Save Transaction'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
