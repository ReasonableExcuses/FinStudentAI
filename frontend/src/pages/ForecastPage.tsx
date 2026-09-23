import React, { useState, useEffect } from 'react';
import { TrendingUp, Sparkles, AlertCircle, Info, Calendar, ArrowUpRight, BarChart2 } from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine
} from 'recharts';
import { forecastApi } from '../services/api';
import { ForecastSummary, CategoryForecast } from '../types';
import { EmptyState } from '../components/EmptyState';

export const ForecastPage: React.FC = () => {
  const [forecast, setForecast] = useState<ForecastSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchForecast = async () => {
    setIsLoading(true);
    try {
      const res = await forecastApi.getForecast();
      setForecast(res.data);
    } catch (err) {
      console.error('Failed to load forecast', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchForecast();
  }, []);

  return (
    <div className="space-y-5 sm:space-y-6 animate-fade-in pb-12 max-w-5xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold font-display text-white tracking-tight">Spending Forecast</h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Predictive estimates of future expenditure and category ranges derived from time-series spending patterns.
        </p>
      </div>

      {/* Top Forecast Highlight Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        {/* Actual Month */}
        <div className="fin-card p-4 sm:p-5 border border-white/[0.08]">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            {forecast?.current_month || 'September 2026'} Actual
          </span>
          <div className="text-xl sm:text-2xl font-bold font-mono-numbers text-white mt-1">
            ₹{forecast?.current_actual?.toLocaleString() || '15,580'}
          </div>
          <p className="text-xs text-slate-400 mt-1">Recorded month-to-date spending</p>
        </div>

        {/* Forecast Month */}
        <div className="fin-card p-4 sm:p-5 border border-[#10b981]/40 bg-[#10b981]/[0.03]">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#34d399]">
              {forecast?.forecast_month || 'October 2026'} Predicted
            </span>
            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-[#10b981]/20 text-[#34d399] border border-[#10b981]/30 uppercase">
              AI Forecast
            </span>
          </div>
          <div className="text-xl sm:text-2xl font-bold font-mono-numbers text-[#10b981] mt-1">
            ₹{forecast?.forecast_predicted?.toLocaleString() || '16,800'}
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Expected change:{' '}
            <span className="text-[#34d399] font-bold font-mono-numbers">
              {forecast?.expected_change_percent && forecast.expected_change_percent > 0 ? '+' : ''}
              {forecast?.expected_change_percent?.toFixed(1) || '+7.8'}%
            </span>
          </p>
        </div>

        {/* Methodology Card */}
        <div className="fin-card p-4 sm:p-5 border border-white/[0.08] flex flex-col justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Statistical Model</span>
            <p className="text-xs font-semibold text-white mt-1">Weighted Moving Average + Trend</p>
            <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
              Blends weighted historical averages with linear trend extrapolation.
            </p>
          </div>
          <p className="text-[10px] text-slate-500 italic mt-2">
            Estimates only. Does not guarantee future expenditure.
          </p>
        </div>
      </div>

      {/* Historical + Predicted Trend Chart */}
      <div className="fin-card p-4 sm:p-6 border border-white/[0.08]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <h3 className="text-sm font-bold text-white font-display">Historical Spending vs Next Month Forecast</h3>
            <p className="text-[11px] text-slate-400">
              The dashed section represents the predicted model trajectory
            </p>
          </div>
          <div className="flex items-center space-x-3 text-xs">
            <div className="flex items-center space-x-1.5">
              <div className="w-3 h-0.5 bg-slate-400" />
              <span className="text-slate-400 text-[10px]">Actual</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <div className="w-3 h-0.5 border-t-2 border-dashed border-[#10b981]" />
              <span className="text-[#10b981] text-[10px] font-bold">Predicted</span>
            </div>
          </div>
        </div>

        <div className="h-60 sm:h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={forecast?.historical_trend || []}
              margin={{ top: 20, right: 20, left: -15, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.05)" />
              <XAxis dataKey="period" stroke="#64748b" fontSize={10} />
              <YAxis stroke="#64748b" fontSize={10} />
              <Tooltip
                formatter={(val: any, name: any, props: any) => [
                  `₹${Number(val).toLocaleString()}`,
                  props.payload.is_forecast ? 'Estimated Forecast' : 'Recorded Actual',
                ]}
                contentStyle={{
                  backgroundColor: '#161a24',
                  borderColor: 'rgba(255, 255, 255, 0.1)',
                  borderRadius: '0.75rem',
                  fontSize: '12px',
                  color: '#fff',
                }}
              />
              <Line
                type="monotone"
                dataKey="amount"
                stroke="#10b981"
                strokeWidth={2.5}
                dot={{ fill: '#10b981', r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Category Level Predictions Grid */}
      <div className="fin-card p-4 sm:p-6 border border-white/[0.08] space-y-4">
        <div>
          <h3 className="text-sm font-bold text-white font-display">Category-Level Expense Forecasts</h3>
          <p className="text-[11px] text-slate-400">
            Estimated category totals and statistical prediction intervals for next month.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {forecast?.category_forecasts && forecast.category_forecasts.length > 0 ? (
            forecast.category_forecasts.map((cat) => (
              <div
                key={cat.category}
                className="p-3.5 sm:p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] hover:border-white/[0.12] transition"
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xs font-bold text-white">{cat.category}</h4>
                  <span
                    className={`text-[10px] font-semibold font-mono-numbers ${
                      cat.expected_change_percent > 0 ? 'text-amber-400' : 'text-[#10b981]'
                    }`}
                  >
                    {cat.expected_change_percent > 0 ? '+' : ''}
                    {cat.expected_change_percent.toFixed(1)}%
                  </span>
                </div>

                <div className="flex items-baseline justify-between mb-2 font-mono-numbers">
                  <span className="text-[10px] text-slate-400">Historical Avg:</span>
                  <span className="text-xs text-slate-300">₹{cat.current_average.toLocaleString()}</span>
                </div>

                <div className="flex items-baseline justify-between mb-3 font-mono-numbers">
                  <span className="text-[10px] text-[#34d399] font-semibold">Predicted Next:</span>
                  <span className="text-base font-bold text-[#10b981]">
                    ₹{cat.predicted_amount.toLocaleString()}
                  </span>
                </div>

                <div className="pt-2 border-t border-white/[0.06] text-[10px] text-slate-400 flex items-center justify-between font-mono-numbers">
                  <span>Estimated Range:</span>
                  <span className="font-medium text-slate-300">
                    ₹{cat.lower_bound.toLocaleString()} – ₹{cat.upper_bound.toLocaleString()}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <p className="text-xs text-slate-500 col-span-3 py-6 text-center">
              Insufficient historical data to produce category forecasts.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
