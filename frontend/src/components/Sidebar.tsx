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
  GraduationCap
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Sidebar: React.FC = () => {
  const { user } = useAuth();

  const navItems = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/transactions', label: 'Transactions', icon: Receipt },
    { to: '/import', label: 'CSV Import', icon: FileSpreadsheet },
    { to: '/budgets', label: 'Budgets', icon: PieChart },
    { to: '/analytics', label: 'Analytics', icon: BarChart3 },
    { to: '/anomalies', label: 'Anomalies', icon: AlertTriangle, badge: 'ML' },
    { to: '/recurring', label: 'Recurring', icon: Repeat },
    { to: '/forecast', label: 'Forecast', icon: TrendingUp, badge: 'AI' },
    { to: '/insights', label: 'Insights', icon: Sparkles, badge: 'New' },
    { to: '/ask', label: 'Ask FinStudent', icon: HelpCircle },
    { to: '/evaluation', label: 'ML Evaluation', icon: Activity },
    { to: '/profile', label: 'Profile', icon: UserCheck },
  ];

  return (
    <aside className="w-64 border-r border-slate-800 bg-[#0b101d] flex flex-col h-screen sticky top-0 select-none z-30">
      {/* Brand Header */}
      <div className="h-16 flex items-center px-6 border-b border-slate-800/80">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 to-teal-400 flex items-center justify-center shadow-lg shadow-teal-500/25">
            <GraduationCap className="w-5 h-5 text-slate-950 font-bold" />
          </div>
          <div>
            <h1 className="font-display font-bold text-base text-white tracking-wide flex items-center gap-1.5">
              FinStudent <span className="text-brand-400 text-xs px-1.5 py-0.5 rounded bg-brand-500/10 border border-brand-500/20">AI</span>
            </h1>
            <p className="text-[10px] text-slate-400">Student Expense Intelligence</p>
          </div>
        </div>
      </div>

      {/* Nav List */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all duration-150 ${
                  isActive
                    ? 'bg-brand-500/15 text-brand-300 font-semibold border border-brand-500/30 shadow-sm shadow-brand-500/10'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`
              }
            >
              <div className="flex items-center space-x-3">
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-brand-500/20 text-brand-300 border border-brand-500/30 uppercase tracking-wider">
                  {item.badge}
                </span>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Student Badge Footer */}
      <div className="p-4 border-t border-slate-800/80 bg-slate-900/40">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-full bg-brand-500/20 text-brand-300 border border-brand-500/30 flex items-center justify-center font-bold text-xs">
            {user?.name?.[0] || 'A'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-slate-200 truncate">{user?.name || 'Alex'}</p>
            <p className="text-[10px] text-slate-400 truncate">{user?.university || 'Engineering University'}</p>
          </div>
        </div>
      </div>
    </aside>
  );
};
