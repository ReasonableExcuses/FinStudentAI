import React, { useState, useEffect } from 'react';
import {
  Plus,
  Search,
  Filter,
  Trash2,
  Edit2,
  AlertTriangle,
  ArrowUpDown,
  Sparkles,
  Download,
  ChevronRight
} from 'lucide-react';
import { transactionsApi } from '../services/api';
import { Transaction } from '../types';
import { TransactionModal } from '../components/TransactionModal';
import { TransactionDetailDrawer } from '../components/TransactionDetailDrawer';
import { EmptyState } from '../components/EmptyState';

const CATEGORIES = [
  'All',
  'Food',
  'Transportation',
  'Education',
  'Entertainment',
  'Shopping',
  'Bills',
  'Subscriptions',
  'Health',
  'Accommodation',
  'Income',
  'Freelance',
];

export const TransactionsPage: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedType, setSelectedType] = useState('All');
  const [sortBy, setSortBy] = useState<'date' | 'amount'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Modals & Drawers
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingTx, setEditingTx] = useState<Transaction | null>(null);
  const [detailTx, setDetailTx] = useState<Transaction | null>(null);

  const fetchTransactions = async () => {
    setIsLoading(true);
    try {
      const params: any = {};
      if (selectedCategory !== 'All') params.category = selectedCategory;
      if (selectedType !== 'All') params.type = selectedType;
      if (search.trim()) params.search = search.trim();

      const res = await transactionsApi.getAll(params);
      setTransactions(res.data);
    } catch (err) {
      console.error('Failed to load transactions', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [selectedCategory, selectedType]);

  const handleDelete = async (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    if (!window.confirm('Delete this transaction?')) return;
    try {
      await transactionsApi.delete(id);
      fetchTransactions();
    } catch (err) {
      console.error('Failed to delete transaction', err);
    }
  };

  const handleEdit = (e: React.MouseEvent, tx: Transaction) => {
    e.stopPropagation();
    setEditingTx(tx);
    setIsAddModalOpen(true);
  };

  // Sorting
  const sortedTransactions = [...transactions].sort((a, b) => {
    if (sortBy === 'date') {
      const d1 = new Date(a.date).getTime();
      const d2 = new Date(b.date).getTime();
      return sortOrder === 'desc' ? d2 - d1 : d1 - d2;
    } else {
      return sortOrder === 'desc' ? b.amount - a.amount : a.amount - b.amount;
    }
  });

  return (
    <div className="space-y-5 sm:space-y-6 animate-fade-in pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold font-display text-white tracking-tight">Transactions</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Audit, filter, and inspect AI category classifications and confidence scores.
          </p>
        </div>

        <button
          onClick={() => {
            setEditingTx(null);
            setIsAddModalOpen(true);
          }}
          className="flex items-center space-x-2 px-4 py-2 text-xs font-bold rounded-full bg-[#10b981] hover:bg-[#34d399] text-[#042f1a] transition active:scale-95 shadow-sm self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 font-bold" />
          <span>Add Transaction</span>
        </button>
      </div>

      {/* Horizontal Category Filter Pills (Scrollable on mobile) */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full scrollbar-none">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
              selectedCategory === cat
                ? 'bg-[#10b981] text-[#042f1a] font-semibold shadow-sm'
                : 'bg-white/[0.04] text-slate-400 hover:text-white hover:bg-white/[0.08] border border-white/[0.06]'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Search & Sort Toolbar */}
      <div className="fin-card p-3 sm:p-4 border border-white/[0.08] flex flex-col sm:flex-row items-center gap-2.5 justify-between">
        {/* Search */}
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search transactions..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && fetchTransactions()}
            className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-[#0c0e12] border border-white/[0.08] text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#10b981] transition"
          />
        </div>

        {/* Filter & Sort Controls */}
        <div className="flex items-center justify-between sm:justify-end gap-2 w-full sm:w-auto">
          {/* Type Dropdown */}
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-[#0c0e12] border border-white/[0.08] text-xs text-slate-300 focus:outline-none focus:border-[#10b981] transition"
          >
            <option value="All">All Types</option>
            <option value="expense">Expenses Only</option>
            <option value="income">Income Only</option>
          </select>

          {/* Sort Switcher */}
          <button
            onClick={() => {
              if (sortBy === 'date') {
                setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc');
              } else {
                setSortBy('date');
                setSortOrder('desc');
              }
            }}
            className="flex items-center space-x-1 px-3 py-1.5 text-xs font-semibold rounded-xl bg-white/[0.04] border border-white/[0.08] text-slate-300 hover:text-white transition"
          >
            <ArrowUpDown className="w-3.5 h-3.5" />
            <span>Date {sortBy === 'date' && (sortOrder === 'desc' ? '↓' : '↑')}</span>
          </button>
        </div>
      </div>

      {/* Transactions Container */}
      <div className="fin-card border border-white/[0.08] overflow-hidden">
        {/* Mobile View: Cards */}
        <div className="block sm:hidden divide-y divide-white/[0.05]">
          {sortedTransactions.length > 0 ? (
            sortedTransactions.map((tx) => (
              <div
                key={tx.id}
                onClick={() => setDetailTx(tx)}
                className="p-3.5 hover:bg-white/[0.02] cursor-pointer transition active:scale-[0.99] flex items-center justify-between"
              >
                <div className="flex-1 min-w-0 pr-3">
                  <div className="flex items-center space-x-2">
                    <span className="font-semibold text-white text-xs truncate">{tx.description}</span>
                    {tx.is_anomaly && (
                      <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 shrink-0">
                        Outlier
                      </span>
                    )}
                    {tx.is_recurring && (
                      <span className="text-[9px] font-semibold px-1.5 py-0.2 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 shrink-0">
                        Recurring
                      </span>
                    )}
                  </div>
                  <div className="flex items-center space-x-2 mt-1 text-[11px] text-slate-400">
                    <span>
                      {new Date(tx.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                    </span>
                    <span>•</span>
                    <span className="text-[#34d399] font-medium">{tx.final_category || tx.ai_category || 'General'}</span>
                    <span>•</span>
                    <span className="font-mono-numbers">{(tx.ai_confidence > 1 ? tx.ai_confidence : Math.round((tx.ai_confidence || 0) * 100))}% conf</span>
                  </div>
                </div>

                <div className="text-right shrink-0 flex items-center space-x-2">
                  <div>
                    <p
                      className={`font-mono-numbers font-bold text-xs ${
                        tx.type === 'income' ? 'text-[#10b981]' : 'text-slate-100'
                      }`}
                    >
                      {tx.type === 'income' ? '+' : '-'}₹{tx.amount.toLocaleString()}
                    </p>
                    <div className="flex items-center justify-end space-x-1 mt-1">
                      <button
                        onClick={(e) => handleEdit(e, tx)}
                        className="p-1 text-slate-400 hover:text-white"
                        title="Edit"
                      >
                        <Edit2 className="w-3 h-3" />
                      </button>
                      <button
                        onClick={(e) => handleDelete(e, tx.id)}
                        className="p-1 text-slate-400 hover:text-rose-400"
                        title="Delete"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-600" />
                </div>
              </div>
            ))
          ) : (
            <div className="py-12 text-center text-xs text-slate-500">No transactions match the selected criteria.</div>
          )}
        </div>

        {/* Desktop View: Table */}
        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-white/[0.08] bg-white/[0.02] text-slate-400 uppercase text-[10px] tracking-wider">
                <th className="py-3 px-4 font-semibold">Date</th>
                <th className="py-3 px-4 font-semibold">Description</th>
                <th className="py-3 px-4 font-semibold">Type</th>
                <th className="py-3 px-4 font-semibold">Category</th>
                <th className="py-3 px-4 font-semibold text-center">AI Confidence</th>
                <th className="py-3 px-4 font-semibold text-right">Amount</th>
                <th className="py-3 px-4 font-semibold text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.05]">
              {sortedTransactions.length > 0 ? (
                sortedTransactions.map((tx) => (
                  <tr
                    key={tx.id}
                    onClick={() => setDetailTx(tx)}
                    className="hover:bg-white/[0.02] cursor-pointer transition"
                  >
                    <td className="py-3.5 px-4 text-slate-400 font-medium whitespace-nowrap">
                      {new Date(tx.date).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                      })}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center space-x-2">
                        <span className="font-semibold text-white">{tx.description}</span>
                        {tx.is_anomaly && (
                          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 uppercase">
                            Outlier
                          </span>
                        )}
                        {tx.is_recurring && (
                          <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                            Sub
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-semibold capitalize ${
                          tx.type === 'income' ? 'text-[#10b981] bg-[#10b981]/15' : 'text-slate-300 bg-white/[0.04]'
                        }`}
                      >
                        {tx.type}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-white/[0.05] text-slate-300 border border-white/[0.08]">
                        {tx.final_category || tx.ai_category || 'General'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className="font-mono-numbers text-[#10b981] font-semibold">
                        {(tx.ai_confidence > 1 ? tx.ai_confidence : Math.round((tx.ai_confidence || 0) * 100))}%
                      </span>
                    </td>
                    <td
                      className={`py-3.5 px-4 text-right font-mono-numbers font-bold ${
                        tx.type === 'income' ? 'text-[#10b981]' : 'text-slate-100'
                      }`}
                    >
                      {tx.type === 'income' ? '+' : '-'}₹{tx.amount.toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4 text-center" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-center space-x-2">
                        <button
                          onClick={(e) => handleEdit(e, tx)}
                          className="p-1 text-slate-400 hover:text-white transition"
                          title="Edit transaction"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={(e) => handleDelete(e, tx.id)}
                          className="p-1 text-slate-400 hover:text-rose-400 transition"
                          title="Delete transaction"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">
                    No transactions found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit / Add Modal */}
      {isAddModalOpen && (
        <TransactionModal
          isOpen={isAddModalOpen}
          initialData={editingTx}
          onClose={() => {
            setIsAddModalOpen(false);
            setEditingTx(null);
          }}
          onSuccess={() => {
            setIsAddModalOpen(false);
            setEditingTx(null);
            fetchTransactions();
          }}
        />
      )}

      {/* Transaction Detail Drawer */}
      {detailTx && (
        <TransactionDetailDrawer
          transaction={detailTx}
          onClose={() => setDetailTx(null)}
          onUpdated={() => {
            setDetailTx(null);
            fetchTransactions();
          }}
        />
      )}
    </div>
  );
};
