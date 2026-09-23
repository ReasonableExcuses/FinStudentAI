import React, { useState, useEffect } from 'react';
import { Plus, PieChart, AlertTriangle, TrendingUp, CheckCircle, Edit3, X } from 'lucide-react';
import { budgetsApi } from '../services/api';
import { BudgetProgress } from '../types';
import { BudgetProgressBar } from '../components/BudgetProgressBar';
import { EmptyState } from '../components/EmptyState';

const CATEGORIES = [
  'Food',
  'Transportation',
  'Shopping',
  'Education',
  'Entertainment',
  'Subscriptions',
  'Bills',
  'Health',
  'Accommodation',
  'Other',
];

export const BudgetsPage: React.FC = () => {
  const [budgets, setBudgets] = useState<BudgetProgress[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState('2026-09');

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [targetCategory, setTargetCategory] = useState('Food');
  const [budgetAmount, setBudgetAmount] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchBudgets = async () => {
    setIsLoading(true);
    try {
      const res = await budgetsApi.getAll(selectedMonth);
      setBudgets(res.data);
    } catch (err) {
      console.error('Failed to load budgets', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBudgets();
  }, [selectedMonth]);

  const handleSaveBudget = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!budgetAmount || parseFloat(budgetAmount) <= 0) return;

    setIsSubmitting(true);
    try {
      await budgetsApi.createOrUpdate({
        category: targetCategory,
        month: selectedMonth,
        amount: parseFloat(budgetAmount),
      });
      setIsModalOpen(false);
      setBudgetAmount('');
      fetchBudgets();
    } catch (err) {
      console.error('Failed to save budget', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const totalBudgeted = budgets.reduce((acc, b) => acc + b.budget_amount, 0);
  const totalSpent = budgets.reduce((acc, b) => acc + b.spent_amount, 0);
  const overallPct = totalBudgeted > 0 ? (totalSpent / totalBudgeted) * 100 : 0;

  return (
    <div className="space-y-5 sm:space-y-6 animate-fade-in pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold font-display text-white tracking-tight">Category Budgets</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Monitor limits, prevent overruns, and review velocity-based budget breach warnings.
          </p>
        </div>

        <div className="flex items-center space-x-2 sm:space-x-3 self-start sm:self-auto">
          {/* Month Selector */}
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="px-3 py-1.5 rounded-full bg-[#151821] border border-white/[0.08] text-xs text-slate-300 focus:outline-none focus:border-[#10b981] transition font-medium"
          >
            <option value="2026-09">Sep 2026</option>
            <option value="2026-08">Aug 2026</option>
            <option value="2026-07">Jul 2026</option>
          </select>

          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center space-x-1.5 px-3.5 py-1.5 text-xs font-bold rounded-full bg-[#10b981] hover:bg-[#34d399] text-[#042f1a] transition active:scale-95 shadow-sm"
          >
            <Plus className="w-4 h-4 font-bold" />
            <span>Set Budget</span>
          </button>
        </div>
      </div>

      {/* Aggregate Overview Card */}
      <div className="fin-card p-4 sm:p-6 border border-white/[0.08] flex flex-col md:flex-row items-start md:items-center justify-between gap-4 sm:gap-6">
        <div className="space-y-1 w-full md:w-auto">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#10b981]">Total Monthly Allocation</span>
          <h3 className="text-xl sm:text-2xl font-bold font-mono-numbers text-white">
            ₹{totalSpent.toLocaleString()} <span className="text-sm font-normal text-slate-400">/ ₹{totalBudgeted.toLocaleString()}</span>
          </h3>
          <p className="text-xs text-slate-400">
            {totalBudgeted - totalSpent >= 0 ? (
              <span className="text-[#34d399] font-semibold font-mono-numbers">₹{(totalBudgeted - totalSpent).toLocaleString()}</span>
            ) : (
              <span className="text-rose-400 font-semibold font-mono-numbers">Over by ₹{(totalSpent - totalBudgeted).toLocaleString()}</span>
            )}{' '}
            remaining across your {budgets.length} monitored categories
          </p>
        </div>

        <div className="w-full md:w-96">
          <BudgetProgressBar
            percentage={overallPct}
            status={
              overallPct > 100
                ? 'over_budget'
                : overallPct >= 90
                ? 'near_limit'
                : overallPct >= 70
                ? 'attention'
                : 'normal'
            }
          />
        </div>
      </div>

      {/* Budget Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {budgets.map((b) => (
          <div
            key={b.category}
            className={`fin-card p-4 sm:p-5 border transition duration-200 flex flex-col justify-between ${
              b.is_projected_over ? 'border-amber-500/40 bg-amber-500/[0.02]' : 'border-white/[0.08]'
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold text-white font-display">{b.category}</h3>
                <button
                  onClick={() => {
                    setTargetCategory(b.category);
                    setBudgetAmount(b.budget_amount.toString());
                    setIsModalOpen(true);
                  }}
                  className="p-1 text-slate-400 hover:text-white rounded hover:bg-white/[0.06] transition"
                  title="Edit Budget"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Numbers */}
              <div className="flex items-baseline justify-between mb-2 font-mono-numbers">
                <div>
                  <span className="text-[10px] text-slate-400">Spent: </span>
                  <span className="text-base font-bold text-white">₹{b.spent_amount.toLocaleString()}</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-400">Budget: </span>
                  <span className="text-xs text-slate-300">₹{b.budget_amount.toLocaleString()}</span>
                </div>
              </div>

              {/* Progress Bar */}
              <BudgetProgressBar percentage={b.usage_percentage} status={b.status} />

              {/* Velocity Projection Alert */}
              {b.is_projected_over && b.projection_alert && (
                <div className="mt-3 p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/25 text-amber-300 text-[11px] leading-relaxed flex items-start space-x-2">
                  <TrendingUp className="w-4 h-4 shrink-0 text-amber-400 mt-0.5" />
                  <div>
                    <span className="font-bold">Projected Breach: </span>
                    <span>{b.projection_alert}</span>
                  </div>
                </div>
              )}
            </div>

            <div className="mt-4 pt-3 border-t border-white/[0.06] flex items-center justify-between text-[11px] text-slate-400 font-mono-numbers">
              <span>Remaining:</span>
              <span className={`font-semibold ${b.remaining_amount === 0 ? 'text-rose-400' : 'text-slate-200'}`}>
                ₹{b.remaining_amount.toLocaleString()}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Set Budget Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#151821] border border-white/[0.1] rounded-2xl max-w-sm w-full p-6 shadow-2xl relative">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/[0.06] transition"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-base font-bold text-white mb-1 font-display">Set Category Budget</h3>
            <p className="text-xs text-slate-400 mb-4">Set target monthly limit for {selectedMonth}.</p>

            <form onSubmit={handleSaveBudget} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Category</label>
                <select
                  value={targetCategory}
                  onChange={(e) => setTargetCategory(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#0c0e12] border border-white/[0.08] text-xs text-white focus:outline-none focus:border-[#10b981] transition"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Monthly Limit (₹)</label>
                <input
                  type="number"
                  step="any"
                  required
                  placeholder="e.g. 5000"
                  value={budgetAmount}
                  onChange={(e) => setBudgetAmount(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#0c0e12] border border-white/[0.08] text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#10b981] transition font-mono-numbers"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white rounded-full hover:bg-white/[0.06] transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 text-xs font-bold bg-[#10b981] hover:bg-[#34d399] text-[#042f1a] rounded-full transition active:scale-95 disabled:opacity-50"
                >
                  {isSubmitting ? 'Saving...' : 'Set Budget'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
