import React from 'react';

interface BudgetProgressBarProps {
  percentage: number;
  status: 'normal' | 'attention' | 'near_limit' | 'over_budget';
  showLabel?: boolean;
}

export const BudgetProgressBar: React.FC<BudgetProgressBarProps> = ({
  percentage,
  status,
  showLabel = true,
}) => {
  const clamped = Math.min(100, Math.max(0, percentage));

  const statusConfig = {
    normal: {
      barClass: 'bg-[#10b981]',
      badgeClass: 'status-badge-normal',
      label: 'On Track (< 70%)',
    },
    attention: {
      barClass: 'bg-amber-400',
      badgeClass: 'status-badge-attention',
      label: 'Moderate (70–90%)',
    },
    near_limit: {
      barClass: 'bg-orange-500',
      badgeClass: 'status-badge-near-limit',
      label: 'Near Limit (90–100%)',
    },
    over_budget: {
      barClass: 'bg-rose-500',
      badgeClass: 'status-badge-over-budget',
      label: 'Over Budget (> 100%)',
    },
  };

  const current = statusConfig[status] || statusConfig.normal;

  return (
    <div className="w-full">
      <div className="w-full bg-white/[0.06] rounded-full h-2 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${current.barClass}`}
          style={{ width: `${clamped}%` }}
        />
      </div>
      {showLabel && (
        <div className="flex items-center justify-between text-xs mt-1.5">
          <span className="text-slate-400 font-mono-numbers text-[11px]">{percentage.toFixed(0)}% used</span>
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${current.badgeClass}`}>
            {current.label}
          </span>
        </div>
      )}
    </div>
  );
};
