import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  TrendingUp,
  ArrowRight,
  TrendingDown,
  Sparkles,
  HelpCircle,
  Eye,
  Calendar,
  X
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import { analyticsApi, transactionsApi } from '../services/api';
import { MonthComparisonItem, WhySpendingMore, Transaction } from '../types';
import { TransactionDetailDrawer } from '../components/TransactionDetailDrawer';

export const AnalyticsPage: React.FC = () => {
  const [comparison, setComparison] = useState<MonthComparisonItem[]>([]);
  const [whySpending, setWhySpending] = useState<WhySpendingMore | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Drilldown state
  const [drilldownCategory, setDrilldownCategory] = useState<string | null>(null);
  const [categoryTransactions, setCategoryTransactions] = useState<Transaction[]>([]);
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);

  const fetchAnalytics = async () => {
    setIsLoading(true);
    try {
      const [compRes, whyRes] = await Promise.all([
        analyticsApi.getMonthComparison('2026-09', '2026-08'),
        analyticsApi.getWhySpendingMore('2026-09', '2026-08'),
      ]);
      setComparison(compRes.data);
      setWhySpending(whyRes.data);
    } catch (err) {
      console.error('Failed to load analytics', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const handleCategoryClick = async (category: string) => {
    setDrilldownCategory(category);
    try {
      const res = await transactionsApi.getAll({ category, month: '2026-09' });
      setCategoryTransactions(res.data);
    } catch (err) {
      console.error('Failed to fetch transactions for category', err);
    }
  };

  // Format data for comparison BarChart
  const chartData = comparison.map((item) => ({
    name: item.category,
    August: item.prev_month_amount,
    September: item.current_month_amount,
  }));

  return (
    <div className="space-y-5 sm:space-y-6 animate-fade-in pb-12">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold font-display text-white tracking-tight">Spending Analytics</h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Detailed month-over-month category breakdown, variance analysis, and spending drivers.
        </p>
      </div>

      {/* "Why Am I Spending More?" Feature Card */}
      {whySpending && (
        <div className="fin-card p-4 sm:p-6 border border-white/[0.08]">
          <div className="flex items-center space-x-2 text-xs font-bold text-[#10b981] uppercase tracking-wider mb-2">
            <Sparkles className="w-4 h-4 text-[#10b981]" />
            <span>Root-Cause Analysis • Sep vs Aug</span>
          </div>

          <h3 className="text-base sm:text-lg font-bold text-white font-display mb-2">Why did I spend more this month?</h3>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-4xl">{whySpending.summary_text}</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-3 mt-4">
            {whySpending.top_contributors.map((c) => (
              <div
                key={c.category}
                onClick={() => handleCategoryClick(c.category)}
                className="p-3 sm:p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.06] hover:border-white/[0.12] cursor-pointer transition flex items-center justify-between active:scale-[0.99]"
              >
                <div>
                  <span className="text-xs font-semibold text-white">{c.category}</span>
                  <p className="text-[10px] text-slate-400 font-mono-numbers">
                    ₹{c.previous_amount.toLocaleString()} → ₹{c.current_amount.toLocaleString()}
                  </p>
                </div>
                <div className="text-right font-mono-numbers">
                  <span className="text-xs font-bold text-amber-400">
                    +₹{c.difference.toLocaleString()}
                  </span>
                  <p className="text-[10px] text-amber-400 font-semibold">+{c.percent_increase.toFixed(0)}%</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Month-over-Month Comparison Chart */}
      <div className="fin-card p-4 sm:p-6 border border-white/[0.08]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <h3 className="text-sm font-bold text-white font-display">Month-over-Month Spending Comparison</h3>
            <p className="text-[11px] text-slate-400">Comparing August (Previous) vs September (Current)</p>
          </div>
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-white/[0.06] text-slate-300 border border-white/[0.08] self-start sm:self-auto">
            Aug vs Sep 2026
          </span>
        </div>

        <div className="h-60 sm:h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 20, right: 10, left: -20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.05)" />
              <XAxis dataKey="name" stroke="#64748b" fontSize={10} />
              <YAxis stroke="#64748b" fontSize={10} />
              <Tooltip
                formatter={(val: any) => [`₹${Number(val).toLocaleString()}`]}
                contentStyle={{
                  backgroundColor: '#161a24',
                  borderColor: 'rgba(255, 255, 255, 0.1)',
                  borderRadius: '0.75rem',
                  fontSize: '12px',
                  color: '#fff',
                }}
              />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
              <Bar dataKey="August" fill="#64748b" radius={[4, 4, 0, 0]} />
              <Bar dataKey="September" fill="#10b981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* MoM Detailed Table with Click-Through */}
      <div className="fin-card p-4 sm:p-6 border border-white/[0.08]">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-white font-display">Category Variance Breakdown</h3>
            <p className="text-[11px] text-slate-400">Click any category to inspect the underlying transactions</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-white/[0.08] bg-white/[0.02] text-slate-400 uppercase text-[10px] tracking-wider">
                <th className="py-3 px-4 font-semibold">Category</th>
                <th className="py-3 px-4 font-semibold text-right">Aug 2026</th>
                <th className="py-3 px-4 font-semibold text-right">Sep 2026</th>
                <th className="py-3 px-4 font-semibold text-right">Net Change</th>
                <th className="py-3 px-4 font-semibold text-center">Variance %</th>
                <th className="py-3 px-4 font-semibold text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.05]">
              {comparison.map((row) => (
                <tr
                  key={row.category}
                  onClick={() => handleCategoryClick(row.category)}
                  className="hover:bg-white/[0.02] cursor-pointer transition"
                >
                  <td className="py-3 px-4 font-semibold text-white">{row.category}</td>
                  <td className="py-3 px-4 text-right font-mono-numbers text-slate-400">
                    ₹{row.prev_month_amount.toLocaleString()}
                  </td>
                  <td className="py-3 px-4 text-right font-mono-numbers text-slate-100 font-bold">
                    ₹{row.current_month_amount.toLocaleString()}
                  </td>
                  <td
                    className={`py-3 px-4 text-right font-mono-numbers font-bold ${
                      row.change_amount > 0
                        ? 'text-rose-400'
                        : row.change_amount < 0
                        ? 'text-[#10b981]'
                        : 'text-slate-400'
                    }`}
                  >
                    {row.change_amount > 0 ? '+' : ''}₹{row.change_amount.toLocaleString()}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold font-mono-numbers ${
                        row.change_percent > 15
                          ? 'bg-rose-500/15 text-rose-400'
                          : row.change_percent < 0
                          ? 'bg-[#10b981]/15 text-[#34d399]'
                          : 'bg-white/[0.04] text-slate-400'
                      }`}
                    >
                      {row.change_percent > 0 ? '+' : ''}
                      {row.change_percent.toFixed(1)}%
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className="text-[#10b981] hover:text-[#34d399] text-[11px] font-semibold inline-flex items-center gap-1">
                      <Eye className="w-3 h-3" />
                      <span>View</span>
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Drill-down Supporting Transactions Modal */}
      {drilldownCategory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#151821] border border-white/[0.1] rounded-2xl max-w-2xl w-full p-5 sm:p-6 shadow-2xl relative max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.08] mb-4">
              <div>
                <span className="text-[10px] uppercase font-bold text-[#10b981]">Supporting Evidence</span>
                <h3 className="text-base font-bold text-white font-display">
                  September {drilldownCategory} Transactions ({categoryTransactions.length})
                </h3>
              </div>
              <button
                onClick={() => setDrilldownCategory(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/[0.06] transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="overflow-y-auto flex-1 divide-y divide-white/[0.05] pr-1">
              {categoryTransactions.length > 0 ? (
                categoryTransactions.map((tx) => (
                  <div
                    key={tx.id}
                    onClick={() => setSelectedTx(tx)}
                    className="py-3 flex items-center justify-between hover:bg-white/[0.02] px-2 rounded-xl cursor-pointer transition active:scale-[0.99]"
                  >
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-semibold text-white">{tx.description}</span>
                        {tx.is_anomaly && (
                          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                            Outlier
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        {new Date(tx.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} • AI Confidence:{' '}
                        {tx.ai_confidence}%
                      </p>
                    </div>
                    <span className="font-mono-numbers font-bold text-xs text-white">₹{tx.amount.toLocaleString()}</span>
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
            fetchAnalytics();
          }}
        />
      )}
    </div>
  );
};
