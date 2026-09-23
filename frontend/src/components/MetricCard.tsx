import React from 'react';
import { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon: LucideIcon;
  trend?: {
    value: string;
    isPositive: boolean;
    label?: string;
  };
  highlightColor?: 'teal' | 'emerald' | 'amber' | 'indigo' | 'rose';
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  highlightColor = 'teal',
}) => {
  const colorMap = {
    teal: 'bg-[#10b981]/15 text-[#34d399] border-[#10b981]/30',
    emerald: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
    amber: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
    indigo: 'bg-sky-500/15 text-sky-400 border-sky-500/30',
    rose: 'bg-rose-500/15 text-rose-400 border-rose-500/30',
  };

  return (
    <div className="fin-card rounded-2xl p-4 sm:p-5 border border-white/[0.08] flex flex-col justify-between">
      <div className="flex items-center justify-between mb-3">
        <span className="text-[11px] font-semibold text-slate-400 tracking-wider uppercase">{title}</span>
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center border ${colorMap[highlightColor]}`}>
          <Icon className="w-4 h-4" />
        </div>
      </div>
      <div>
        <div className="flex items-baseline space-x-2">
          <span className="text-2xl sm:text-3xl font-bold tracking-tight text-white font-mono-numbers">{value}</span>
        </div>
        {(subtitle || trend) && (
          <div className="mt-2.5 flex flex-wrap items-center text-xs gap-1.5">
            {trend && (
              <span
                className={`font-semibold px-2 py-0.5 rounded-full text-[11px] ${
                  trend.isPositive ? 'bg-[#10b981]/15 text-[#34d399] border border-[#10b981]/30' : 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                }`}
              >
                {trend.value}
              </span>
            )}
            {subtitle && <span className="text-slate-400 text-[11px]">{subtitle}</span>}
          </div>
        )}
      </div>
    </div>
  );
};
