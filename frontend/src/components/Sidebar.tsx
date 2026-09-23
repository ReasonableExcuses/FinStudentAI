import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Receipt,
  FileSpreadsheet,
  PieChart,
  BarChart3,
  AlertTriangle,
  Repeat,
  TrendingUp,
  Sparkles,
  HelpCircle,
  Activity,
  UserCheck,
  GraduationCap,
  X
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen = false, onClose }) => {
  const { user } = useAuth();

  const navItems = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/transactions', label: 'Transactions', icon: Receipt },
    { to: '/import', label: 'CSV Import', icon: FileSpreadsheet },
    { to: '/budgets', label: 'Budgets', icon: PieChart },
    { to: '/analytics', label: 'Analytics', icon: BarChart3 },
    { to: '/anomalies', label: 'Anomalies', icon: AlertTriangle, badge: 'MAD+IF' },
    { to: '/recurring', label: 'Recurring', icon: Repeat },
    { to: '/forecast', label: 'Forecast', icon: TrendingUp, badge: 'WMA' },
    { to: '/insights', label: 'Insights', icon: Sparkles, badge: 'AI' },
    { to: '/ask', label: 'Ask FinStudent', icon: HelpCircle },
    { to: '/evaluation', label: 'ML Evaluation', icon: Activity },
    { to: '/profile', label: 'Profile', icon: UserCheck },
  ];

  const sidebarContent = (
    <div className="w-64 bg-[#12151d] border-r border-white/[0.08] flex flex-col h-full select-none">
      {/* Brand Header */}
      <div className="h-16 flex items-center justify-between px-5 border-b border-white/[0.08]">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-xl bg-[#10b981] flex items-center justify-center text-[#042f1a] font-bold shadow-sm">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-display font-bold text-sm text-white tracking-tight flex items-center gap-1.5">
              FinStudent <span className="text-[#10b981] text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-[#10b981]/15 border border-[#10b981]/30">AI</span>
            </h1>
            <p className="text-[10px] text-slate-400 font-medium">Student Finance Intelligence</p>
          </div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="md:hidden p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/[0.06] transition"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Nav List */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all duration-150 ${
                  isActive
                    ? 'bg-[#10b981]/15 text-[#34d399] font-semibold border border-[#10b981]/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]'
                }`
              }
            >
              <div className="flex items-center space-x-3">
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full bg-white/[0.06] text-slate-300 border border-white/[0.08] uppercase tracking-wider">
                  {item.badge}
                </span>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Student Badge Footer */}
      <div className="p-3.5 border-t border-white/[0.08] bg-[#0c0e12]/60">
        <NavLink
          to="/profile"
          onClick={onClose}
          className="flex items-center space-x-3 hover:opacity-80 transition"
        >
          <div className="w-8 h-8 rounded-full bg-[#10b981]/20 text-[#34d399] border border-[#10b981]/30 flex items-center justify-center font-bold text-xs">
            {user?.name?.[0] || 'A'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-slate-200 truncate">{user?.name || 'Alex'}</p>
            <p className="text-[10px] text-slate-400 truncate">{user?.university || 'Engineering University'}</p>
          </div>
        </NavLink>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside className="hidden md:flex h-screen sticky top-0 z-20">
        {sidebarContent}
      </aside>

      {/* Mobile Slide-Out Drawer with Backdrop */}
      {isOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
            onClick={onClose}
          />
          {/* Drawer Panel */}
          <div className="relative z-50 w-72 max-w-[85vw] h-full shadow-2xl animate-in slide-in-from-left duration-200">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};
