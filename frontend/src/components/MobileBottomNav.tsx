import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Receipt,
  PieChart,
  Sparkles,
  HelpCircle,
} from 'lucide-react';

export const MobileBottomNav: React.FC = () => {
  const navItems = [
    { to: '/dashboard', label: 'Overview', icon: LayoutDashboard },
    { to: '/transactions', label: 'History', icon: Receipt },
    { to: '/budgets', label: 'Budgets', icon: PieChart },
    { to: '/insights', label: 'Insights', icon: Sparkles },
    { to: '/ask', label: 'Ask AI', icon: HelpCircle },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-[#12151d]/95 backdrop-blur-xl border-t border-white/[0.08] pb-safe px-2 py-1.5 flex items-center justify-around shadow-2xl">
      {navItems.map((item) => {
        const Icon = item.icon;
        return (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all duration-150 relative min-w-[56px] min-h-[44px] ${
                isActive
                  ? 'text-[#10b981] font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <Icon className={`w-5 h-5 mb-0.5 transition-transform ${isActive ? 'scale-110 stroke-[2.2]' : 'stroke-[1.8]'}`} />
                <span className="text-[10px] tracking-tight">{item.label}</span>
                {isActive && (
                  <span className="w-1 h-1 rounded-full bg-[#10b981] absolute bottom-0.5" />
                )}
              </>
            )}
          </NavLink>
        );
      })}
    </nav>
  );
};
