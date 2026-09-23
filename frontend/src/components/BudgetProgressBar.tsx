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
      barClass: 'bg-emerald-500',
      badgeClass: 'status-badge-normal',
      label: 'Normal (< 70%)',
    },
    attention: {
      barClass: 'bg-amber-400',
      badgeClass: 'status-badge-attention',
      label: 'Attention (70–90%)',
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
      <div className="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${current.barClass}`}
          style={{ width: `${clamped}%` }}
        />
      </div>
      {showLabel && (
        <div className="flex items-center justify-between text-xs mt-1.5">
          <span className="text-slate-400">{percentage.toFixed(0)}% used</span>
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${current.badgeClass}`}>
            {current.label}
          </span>
        </div>
      )}
    </div>
  );
};
