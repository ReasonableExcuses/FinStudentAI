import React, { useState } from 'react';
import { UserCheck, Save, CheckCircle2, AlertTriangle, GraduationCap, Shield } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { profileApi } from '../services/api';

export const ProfilePage: React.FC = () => {
  const { user, updateUser } = useAuth();

  const [name, setName] = useState(user?.name || 'Alex');
  const [university, setUniversity] = useState(user?.university || 'Engineering University');
  const [monthlyIncome, setMonthlyIncome] = useState(user?.monthly_income?.toString() || '24000');
  const [monthlyBudget, setMonthlyBudget] = useState(user?.monthly_budget?.toString() || '20000');
  const [currency, setCurrency] = useState(user?.currency || '₹');
  const [studentType, setStudentType] = useState(user?.student_type || 'Hosteller');

  const [isSaving, setIsSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSuccessMsg(null);
    setError(null);

    try {
      const res = await profileApi.update({
        name: name.trim(),
        university: university.trim(),
        monthly_income: parseFloat(monthlyIncome) || 24000,
        monthly_budget: parseFloat(monthlyBudget) || 20000,
        currency,
        student_type: studentType,
      });
      updateUser(res.data);
      setSuccessMsg('Student profile updated successfully!');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to update profile.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-5 sm:space-y-6 animate-fade-in pb-12 max-w-3xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold font-display text-white tracking-tight">Student Profile</h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Configure baseline allowances, institutional parameters, and living context.
        </p>
      </div>

      {successMsg && (
        <div className="p-3.5 rounded-xl bg-[#10b981]/10 border border-[#10b981]/25 text-[#34d399] text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {error && (
        <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="fin-card p-4 sm:p-6 border border-white/[0.08] space-y-5">
        <div className="flex items-center space-x-4 pb-5 border-b border-white/[0.08]">
          <div className="w-12 h-12 rounded-2xl bg-[#10b981]/15 text-[#34d399] border border-[#10b981]/30 flex items-center justify-center font-bold text-lg font-display">
            {name[0] || 'A'}
          </div>
          <div>
            <h3 className="text-base font-bold text-white font-display">{name}</h3>
            <p className="text-xs text-slate-400">{user?.email}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Student Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#0c0e12] border border-white/[0.08] text-sm text-white focus:outline-none focus:border-[#10b981] transition"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">University / Institute</label>
            <input
              type="text"
              required
              value={university}
              onChange={(e) => setUniversity(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#0c0e12] border border-white/[0.08] text-sm text-white focus:outline-none focus:border-[#10b981] transition"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-mono-numbers">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1 font-sans">Monthly Expected Allowance (₹)</label>
            <input
              type="number"
              required
              value={monthlyIncome}
              onChange={(e) => setMonthlyIncome(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#0c0e12] border border-white/[0.08] text-sm text-white focus:outline-none focus:border-[#10b981] transition"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1 font-sans">Target Monthly Budget (₹)</label>
            <input
              type="number"
              required
              value={monthlyBudget}
              onChange={(e) => setMonthlyBudget(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#0c0e12] border border-white/[0.08] text-sm text-white focus:outline-none focus:border-[#10b981] transition"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Student Living Type</label>
            <select
              value={studentType}
              onChange={(e) => setStudentType(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#0c0e12] border border-white/[0.08] text-sm text-white focus:outline-none focus:border-[#10b981] transition"
            >
              <option value="Hosteller">Hosteller (Mess & Campus living)</option>
              <option value="Day Scholar">Day Scholar (Transit & Commute)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Preferred Currency Symbol</label>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#0c0e12] border border-white/[0.08] text-sm text-white focus:outline-none focus:border-[#10b981] transition"
            >
              <option value="₹">₹ (INR - Indian Rupee)</option>
              <option value="$">$ (USD)</option>
              <option value="€">€ (EUR)</option>
              <option value="£">£ (GBP)</option>
            </select>
          </div>
        </div>

        <div className="pt-4 border-t border-white/[0.06] flex justify-end">
          <button
            type="submit"
            disabled={isSaving}
            className="flex items-center space-x-2 px-5 py-2.5 rounded-full bg-[#10b981] hover:bg-[#34d399] text-[#042f1a] font-bold text-xs shadow-sm transition active:scale-95 disabled:opacity-50"
          >
            <Save className="w-4 h-4 font-bold" />
            <span>{isSaving ? 'Saving...' : 'Save Profile'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
