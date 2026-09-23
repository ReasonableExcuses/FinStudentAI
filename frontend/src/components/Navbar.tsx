import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Plus, Database, LogOut, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { TransactionModal } from './TransactionModal';

export const Navbar: React.FC = () => {
  const { user, logout, seedDemo } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSeeding, setIsSeeding] = useState(false);

  const getPageTitle = () => {
    const path = location.pathname;
    if (path.includes('dashboard')) return 'Dashboard Overview';
    if (path.includes('transactions')) return 'Transaction Management';
    if (path.includes('import')) return 'CSV Transaction Import';
    if (path.includes('budgets')) return 'Category Budgets & Projections';
    if (path.includes('analytics')) return 'Spending Analytics & Trends';
    if (path.includes('anomalies')) return 'Anomaly Detection Center';
    if (path.includes('recurring')) return 'Subscriptions & Recurring Bills';
    if (path.includes('forecast')) return 'Spending Forecast Engine';
    if (path.includes('insights')) return 'Personalized Financial Insights';
    if (path.includes('ask')) return 'Ask FinStudent AI';
    if (path.includes('evaluation')) return 'ML & Statistical Benchmark';
    if (path.includes('profile')) return 'Student Financial Profile';
    return 'FinStudent AI';
  };

  const handleSeed = async () => {
    setIsSeeding(true);
    await seedDemo();
    setIsSeeding(false);
    navigate('/dashboard');
    window.location.reload();
  };

  return (
    <>
      <header className="h-16 border-b border-slate-800 bg-[#090d16]/80 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-20">
        <div>
          <h2 className="text-base font-semibold text-white tracking-tight">{getPageTitle()}</h2>
          <p className="text-[11px] text-slate-400">
            Student Profile: <span className="text-slate-300 font-medium">{user?.student_type || 'Hosteller'}</span> • Currency: <span className="text-brand-400 font-bold">₹ (INR)</span>
          </p>
        </div>

        <div className="flex items-center space-x-3">
          {/* Quick Demo Seed */}
          <button
            onClick={handleSeed}
            disabled={isSeeding}
            className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 transition duration-150 disabled:opacity-50"
            title="Reset & populate realistic 3-month student transactions"
          >
            <Database className="w-3.5 h-3.5 text-indigo-400" />
            <span>{isSeeding ? 'Seeding Demo...' : 'Try Demo Data'}</span>
          </button>

          {/* Add Transaction Button */}
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center space-x-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-xl bg-brand-500 hover:bg-brand-400 text-slate-950 shadow-md shadow-brand-500/20 transition duration-150"
          >
            <Plus className="w-3.5 h-3.5 font-bold" />
            <span>Add Transaction</span>
          </button>

          {/* Logout */}
          <button
            onClick={logout}
            className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition duration-150"
            title="Sign out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Transaction Modal */}
      {isModalOpen && (
        <TransactionModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSuccess={() => {
            setIsModalOpen(false);
            window.location.reload();
          }}
        />
      )}
    </>
  );
};
