import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Plus, Database, LogOut, Menu } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { TransactionModal } from './TransactionModal';

interface NavbarProps {
  onOpenMobileMenu?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenMobileMenu }) => {
  const { user, logout, seedDemo } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSeeding, setIsSeeding] = useState(false);

  const getPageTitle = () => {
    const path = location.pathname;
    if (path.includes('dashboard')) return 'Dashboard';
    if (path.includes('transactions')) return 'Transactions';
    if (path.includes('import')) return 'CSV Import';
    if (path.includes('budgets')) return 'Budgets & Projections';
    if (path.includes('analytics')) return 'Spending Analytics';
    if (path.includes('anomalies')) return 'Anomaly Center';
    if (path.includes('recurring')) return 'Subscriptions';
    if (path.includes('forecast')) return 'Spending Forecast';
    if (path.includes('insights')) return 'Personal Insights';
    if (path.includes('ask')) return 'Ask FinStudent AI';
    if (path.includes('evaluation')) return 'ML Benchmark';
    if (path.includes('profile')) return 'Student Profile';
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
      <header className="h-16 border-b border-white/[0.08] bg-[#0c0e12]/90 backdrop-blur-md px-3 sm:px-6 flex items-center justify-between sticky top-0 z-20">
        <div className="flex items-center space-x-3 min-w-0">
          {/* Mobile Menu Button */}
          <button
            onClick={onOpenMobileMenu}
            className="md:hidden p-2 -ml-1 text-slate-400 hover:text-white rounded-lg hover:bg-white/[0.06] transition"
            aria-label="Open menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="truncate">
            <h2 className="text-sm sm:text-base font-semibold text-white tracking-tight truncate">
              {getPageTitle()}
            </h2>
            <p className="hidden sm:block text-[11px] text-slate-400 truncate">
              Profile: <span className="text-slate-300 font-medium">{user?.student_type || 'Hosteller'}</span> • Currency: <span className="text-[#10b981] font-bold">₹ (INR)</span>
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 sm:space-x-3 shrink-0">
          {/* Quick Demo Seed */}
          <button
            onClick={handleSeed}
            disabled={isSeeding}
            className="flex items-center space-x-1.5 px-2.5 sm:px-3 py-1.5 text-xs font-semibold rounded-full bg-white/[0.05] hover:bg-white/[0.1] text-slate-300 border border-white/[0.1] transition duration-150 disabled:opacity-50"
            title="Populate realistic student demo data"
          >
            <Database className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
            <span className="hidden sm:inline">{isSeeding ? 'Seeding...' : 'Demo Data'}</span>
          </button>

          {/* Add Transaction Button */}
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center space-x-1.5 px-3 sm:px-3.5 py-1.5 text-xs font-bold rounded-full bg-[#10b981] hover:bg-[#34d399] text-[#042f1a] transition duration-150 active:scale-95 shadow-sm"
          >
            <Plus className="w-3.5 h-3.5 font-bold shrink-0" />
            <span className="hidden xs:inline">Add</span>
            <span className="hidden md:inline">Transaction</span>
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
