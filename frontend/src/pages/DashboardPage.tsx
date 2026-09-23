import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Wallet,
  ArrowDownLeft,
  ArrowUpRight,
  PiggyBank,
  AlertTriangle,
  TrendingUp,
  Sparkles,
  Repeat,
  Plus,
  ArrowRight,
  Clock,
  ChevronRight
} from 'lucide-react';
import {
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid
} from 'recharts';
import { MetricCard } from '../components/MetricCard';
import { BudgetProgressBar } from '../components/BudgetProgressBar';
import { EmptyState } from '../components/EmptyState';
import { TransactionModal } from '../components/TransactionModal';
import { TransactionDetailDrawer } from '../components/TransactionDetailDrawer';
import { useAuth } from '../context/AuthContext';
import { analyticsApi, transactionsApi, insightsApi } from '../services/api';
import { DashboardSummary, Transaction, Insight } from '../types';

const CATEGORY_COLORS: Record<string, string> = {
  Food: '#10b981',           // Mint
  Transportation: '#38bdf8', // Sky
  Shopping: '#ec4899',       // Pink
  Education: '#8b5cf6',      // Purple
  Entertainment: '#f59e0b',  // Amber
  Subscriptions: '#6366f1',  // Indigo
  Bills: '#ef4444',          // Red
  Accommodation: '#06b6d4',  // Cyan
  Health: '#10b981',         // Emerald
  Other: '#64748b',          // Slate
};

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [insights, setInsights] = useState<Insight[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState('2026-09');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      const [sumRes, insRes] = await Promise.all([
        analyticsApi.getSummary(selectedMonth),
        insightsApi.getAll(),
      ]);
      setSummary(sumRes.data);
      setInsights(insRes.data.slice(0, 3));
    } catch (err) {
      console.error('Failed to load dashboard summary', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [selectedMonth]);

  const handleTxClick = async (txId: number) => {
    try {
      const res = await transactionsApi.getOne(txId);
      setSelectedTx(res.data);
    } catch (err) {
      console.error('Failed to fetch transaction detail', err);
    }
  };

  return (
    <div className="space-y-5 sm:space-y-6 animate-fade-in pb-12">
      {/* Top Greeting & Month Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold font-display text-white tracking-tight">
            Good morning, {user?.name || 'Alex'}
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Student financial overview for {summary?.current_month_name || 'September 2026'}.
          </p>
        </div>

        {/* Month Selector Tabs */}
        <div className="flex items-center space-x-1 p-1 bg-[#151821] border border-white/[0.08] rounded-full self-start sm:self-auto overflow-x-auto max-w-full">
          {[
            { label: 'Sep 2026', value: '2026-09' },
            { label: 'Aug 2026', value: '2026-08' },
            { label: 'Jul 2026', value: '2026-07' },
          ].map((m) => (
            <button
              key={m.value}
              onClick={() => setSelectedMonth(m.value)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-full transition whitespace-nowrap ${
                selectedMonth === m.value
                  ? 'bg-[#10b981] text-[#042f1a] shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>

      {/* Top 4 Metrics Grid (2x2 on mobile, 4x1 on desktop) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <MetricCard
          title="Total Balance"
          value={`₹${summary?.total_balance?.toLocaleString() || '18,420'}`}
          subtitle="Net accumulated"
          icon={Wallet}
          highlightColor="teal"
        />
        <MetricCard
          title="Income"
          value={`₹${summary?.income_this_month?.toLocaleString() || '24,000'}`}
          subtitle="Monthly allowance"
          icon={ArrowDownLeft}
          highlightColor="emerald"
        />
        <MetricCard
          title="Expenses"
          value={`₹${summary?.expenses_this_month?.toLocaleString() || '15,580'}`}
          subtitle="Recorded spend"
          icon={ArrowUpRight}
          highlightColor="rose"
        />
        <MetricCard
          title="Net Savings"
          value={`₹${summary?.savings_this_month?.toLocaleString() || '8,420'}`}
          subtitle="Savings remaining"
          icon={PiggyBank}
          highlightColor="indigo"
        />
      </div>

      {/* Budget Status Banner Card */}
      <div className="fin-card p-4 sm:p-5 border border-white/[0.08] flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center space-x-3 sm:space-x-4 w-full md:w-auto">
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-[#10b981]/15 border border-[#10b981]/30 flex items-center justify-center text-[#10b981] shrink-0">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Budget Health</span>
            <h3 className="text-sm sm:text-base font-bold text-white tracking-tight">
              You have used {summary?.budget_used_percent?.toFixed(0) || 71}% of your monthly target
            </h3>
            <p className="text-xs text-slate-400 font-mono-numbers">
              ₹{summary?.expenses_this_month?.toLocaleString() || '15,580'} spent of ₹
              {summary?.budget_total?.toLocaleString() || '20,000'} limit
            </p>
          </div>
        </div>

        <div className="w-full md:w-80">
          <BudgetProgressBar
            percentage={summary?.budget_used_percent || 71}
            status={
              (summary?.budget_used_percent || 71) > 100
                ? 'over_budget'
                : (summary?.budget_used_percent || 71) >= 90
                ? 'near_limit'
                : (summary?.budget_used_percent || 71) >= 70
                ? 'attention'
                : 'normal'
            }
          />
        </div>
      </div>

      {/* Main Charts Grid: Spending by Category & Daily Spending Trend */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 sm:gap-6">
        {/* Category Breakdown (Donut Chart) */}
        <div className="fin-card p-4 sm:p-6 border border-white/[0.08] flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-white font-display">Spending by Category</h3>
              <p className="text-[11px] text-slate-400">Where your student money went this month</p>
            </div>
            <Link
              to="/analytics"
              className="text-xs text-[#10b981] hover:text-[#34d399] font-semibold flex items-center gap-1"
            >
              <span>Details</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {summary?.categories && summary.categories.length > 0 ? (
            <div>
              <div className="h-48 sm:h-52 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsPieChart>
                    <Pie
                      data={summary.categories}
                      dataKey="amount"
                      nameKey="category"
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={75}
                      paddingAngle={4}
                    >
                      {summary.categories.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={CATEGORY_COLORS[entry.category] || '#64748b'}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(val: any) => [`₹${Number(val).toLocaleString()}`, 'Spent']}
                      contentStyle={{
                        backgroundColor: '#161a24',
                        borderColor: 'rgba(255, 255, 255, 0.1)',
                        borderRadius: '0.75rem',
                        fontSize: '12px',
                        color: '#f8fafc',
                      }}
                    />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </div>

              {/* Category Legend Pills */}
              <div className="space-y-1.5 mt-3 max-h-40 overflow-y-auto pr-1">
                {summary.categories.slice(0, 5).map((c) => (
                  <div key={c.category} className="flex items-center justify-between text-xs py-1 border-b border-white/[0.05]">
                    <div className="flex items-center space-x-2">
                      <div
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: CATEGORY_COLORS[c.category] || '#64748b' }}
                      />
                      <span className="text-slate-300 font-medium">{c.category}</span>
                    </div>
                    <div className="text-right space-x-2 font-mono-numbers">
                      <span className="text-white font-semibold">₹{c.amount.toLocaleString()}</span>
                      <span className="text-[10px] text-slate-500">({c.percentage.toFixed(0)}%)</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="py-12 text-center text-xs text-slate-500">No category data for this month.</div>
          )}
        </div>

        {/* Daily Spending Trend (Area Chart) */}
        <div className="fin-card p-4 sm:p-6 border border-white/[0.08] lg:col-span-2 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-white font-display">Daily Spending Velocity</h3>
              <p className="text-[11px] text-slate-400">Pace of expenses across the month</p>
            </div>
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-white/[0.06] text-slate-300 border border-white/[0.08]">
              Daily Pace
            </span>
          </div>

          <div className="h-56 sm:h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={summary?.daily_spending || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="spendingGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.05)" />
                <XAxis
                  dataKey="date"
                  tickFormatter={(val) => val.substring(8)}
                  stroke="#64748b"
                  fontSize={10}
                />
                <YAxis stroke="#64748b" fontSize={10} />
                <Tooltip
                  formatter={(val: any) => [`₹${Number(val).toLocaleString()}`, 'Spent']}
                  labelFormatter={(lbl) => `Date: ${lbl}`}
                  contentStyle={{
                    backgroundColor: '#161a24',
                    borderColor: 'rgba(255, 255, 255, 0.1)',
                    borderRadius: '0.75rem',
                    fontSize: '12px',
                    color: '#f8fafc',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="amount"
                  stroke="#10b981"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#spendingGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Middle Row: Personalized Insights & Quick AI Anomaly Highlight */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6">
        {/* Insights Snippets */}
        <div className="fin-card p-4 sm:p-5 border border-white/[0.08] md:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-[#10b981]" />
              <h3 className="text-sm font-bold text-white font-display">Personalized Insights</h3>
            </div>
            <Link
              to="/insights"
              className="text-xs text-[#10b981] hover:text-[#34d399] font-semibold flex items-center gap-1"
            >
              <span>View All</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="space-y-2.5">
            {insights.map((ins) => (
              <div
                key={ins.id}
                className="p-3 sm:p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.06] flex items-start space-x-3 hover:border-white/[0.12] transition"
              >
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold ${
                    ins.severity === 'warning'
                      ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                      : ins.severity === 'positive'
                      ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                      : 'bg-[#10b981]/15 text-[#34d399] border border-[#10b981]/30'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs font-bold text-white">{ins.title}</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">{ins.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Anomaly Quick Card */}
        <div className="fin-card p-4 sm:p-5 border border-white/[0.08] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2 text-xs font-bold text-amber-400">
                <AlertTriangle className="w-4 h-4" />
                <span>Outlier Detection</span>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30 uppercase">
                {summary?.anomaly_count || 1} Flagged
              </span>
            </div>

            <p className="text-xs text-slate-400 mb-4 leading-relaxed">
              Statistical anomaly detector flagged an expenditure deviating from your category baseline.
            </p>

            <div className="p-3 rounded-xl bg-[#0c0e12] border border-amber-500/30 space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-white truncate pr-2">Celebration Dinner</span>
                <span className="font-bold text-rose-400 font-mono-numbers shrink-0">₹1,800</span>
              </div>
              <p className="text-[10px] text-slate-400">
                Category: <span className="text-[#34d399] font-medium">Food</span> (Historical avg: ₹163)
              </p>
              <div className="pt-1 text-[11px] font-bold text-amber-400">+1004% Statistical Deviation</div>
            </div>
          </div>

          <Link
            to="/anomalies"
            className="mt-4 w-full py-2 text-center text-xs font-semibold rounded-full bg-white/[0.06] hover:bg-white/[0.1] text-slate-200 border border-white/[0.08] transition"
          >
            Inspect Outlier Center
          </Link>
        </div>
      </div>

      {/* Recent Transactions: Adaptive Desktop Table & Mobile Card List */}
      <div className="fin-card p-4 sm:p-6 border border-white/[0.08]">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-white font-display">Recent Transactions</h3>
            <p className="text-[11px] text-slate-400">Recorded expenses with AI category predictions</p>
          </div>
          <Link
            to="/transactions"
            className="text-xs text-[#10b981] hover:text-[#34d399] font-semibold flex items-center gap-1"
          >
            <span>View All</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        {/* Mobile View: Touch-Friendly Card List */}
        <div className="block sm:hidden space-y-2">
          {summary?.recent_transactions && summary.recent_transactions.length > 0 ? (
            summary.recent_transactions.map((t) => (
              <div
                key={t.id}
                onClick={() => handleTxClick(t.id)}
                className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06] hover:border-white/[0.12] transition active:scale-[0.99] cursor-pointer flex items-center justify-between"
              >
                <div className="flex-1 min-w-0 pr-3">
                  <div className="flex items-center space-x-2">
                    <span className="text-white font-semibold text-xs truncate">{t.description}</span>
                    {t.is_anomaly && (
                      <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 shrink-0">
                        Unusual
                      </span>
                    )}
                  </div>
                  <div className="flex items-center space-x-2 mt-1 text-[10px] text-slate-400">
                    <span>{t.date}</span>
                    <span>•</span>
                    <span className="text-[#34d399] font-medium">{t.category}</span>
                    <span>•</span>
                    <span className="font-mono-numbers">{t.ai_confidence}% conf</span>
                  </div>
                </div>

                <div className="text-right shrink-0 flex items-center space-x-2">
                  <span
                    className={`font-mono-numbers font-bold text-xs ${
                      t.type === 'income' ? 'text-[#10b981]' : 'text-slate-100'
                    }`}
                  >
                    {t.type === 'income' ? '+' : '-'}₹{t.amount.toLocaleString()}
                  </span>
                  <ChevronRight className="w-4 h-4 text-slate-600" />
                </div>
              </div>
            ))
          ) : (
            <div className="py-8 text-center text-xs text-slate-500">No transactions recorded for this period.</div>
          )}
        </div>

        {/* Desktop View: Clean Table */}
        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-white/[0.08] text-slate-400 uppercase text-[10px] tracking-wider">
                <th className="pb-3 font-semibold">Date</th>
                <th className="pb-3 font-semibold">Description</th>
                <th className="pb-3 font-semibold">Category</th>
                <th className="pb-3 font-semibold text-center">AI Confidence</th>
                <th className="pb-3 font-semibold text-right">Amount</th>
                <th className="pb-3 font-semibold text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.05]">
              {summary?.recent_transactions && summary.recent_transactions.length > 0 ? (
                summary.recent_transactions.map((t) => (
                  <tr
                    key={t.id}
                    onClick={() => handleTxClick(t.id)}
                    className="hover:bg-white/[0.02] cursor-pointer transition"
                  >
                    <td className="py-3 text-slate-400 font-medium whitespace-nowrap">{t.date}</td>
                    <td className="py-3 text-white font-semibold">{t.description}</td>
                    <td className="py-3">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-white/[0.05] text-slate-300 border border-white/[0.08]">
                        {t.category}
                      </span>
                    </td>
                    <td className="py-3 text-center">
                      <span className="font-mono-numbers text-[#10b981] font-semibold">{t.ai_confidence}%</span>
                    </td>
                    <td
                      className={`py-3 text-right font-mono-numbers font-bold ${
                        t.type === 'income' ? 'text-[#10b981]' : 'text-slate-100'
                      }`}
                    >
                      {t.type === 'income' ? '+' : '-'}₹{t.amount.toLocaleString()}
                    </td>
                    <td className="py-3 text-center">
                      {t.is_anomaly ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30">
                          Unusual
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-white/[0.04] text-slate-400">
                          Normal
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-500">
                    No transactions recorded for this period.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Transaction Detail Drawer */}
      {selectedTx && (
        <TransactionDetailDrawer
          transaction={selectedTx}
          onClose={() => setSelectedTx(null)}
          onUpdated={() => {
            setSelectedTx(null);
            fetchDashboardData();
          }}
        />
      )}
    </div>
  );
};
