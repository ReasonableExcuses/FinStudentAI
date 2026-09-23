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
    <div className="space-y-6 animate-fade-in pb-12 max-w-5xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold font-display text-white">Personalized Spending Forecast</h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Predictive estimates of future expenditure and category ranges derived from your historical spending patterns.
        </p>
      </div>

      {/* Top Forecast Highlight Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Actual Month */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-800">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            {forecast?.current_month || 'September 2026'} Actual
          </span>
          <div className="text-2xl font-bold font-mono text-white mt-1">
            ₹{forecast?.current_actual?.toLocaleString() || '15,580'}
          </div>
          <p className="text-xs text-slate-400 mt-1">Recorded month-to-date spending</p>
        </div>

        {/* Forecast Month */}
        <div className="glass-panel p-5 rounded-2xl border border-brand-500/40 bg-gradient-to-br from-slate-900 to-brand-950/30">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-brand-300">
              {forecast?.forecast_month || 'October 2026'} Predicted
            </span>
            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-brand-500/20 text-brand-300 border border-brand-500/30 uppercase">
              AI Forecast
            </span>
          </div>
          <div className="text-2xl font-bold font-mono text-brand-400 mt-1">
            ₹{forecast?.forecast_predicted?.toLocaleString() || '16,800'}
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Expected change:{' '}
            <span className="text-brand-300 font-bold">
              {forecast?.expected_change_percent && forecast.expected_change_percent > 0 ? '+' : ''}
              {forecast?.expected_change_percent?.toFixed(1) || '+7.8'}%
            </span>
          </p>
        </div>

        {/* Methodology Card */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 flex flex-col justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Statistical Model</span>
            <p className="text-xs font-semibold text-white mt-1">Weighted Moving Average + Trend</p>
            <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
              Blends weighted historical averages with linear trend estimation.
            </p>
          </div>
          <p className="text-[10px] text-slate-500 italic mt-2">
            Estimates only. Does not guarantee future expenditure.
          </p>
        </div>
      </div>

      {/* Historical + Predicted Trend Chart */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800">
        <div className="flex items-center justify-between mb-4">
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
              <div className="w-3 h-0.5 border-t-2 border-dashed border-teal-400" />
              <span className="text-brand-400 text-[10px] font-bold">Predicted</span>
            </div>
          </div>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={forecast?.historical_trend || []}
              margin={{ top: 20, right: 20, left: -10, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="period" stroke="#64748b" fontSize={10} />
              <YAxis stroke="#64748b" fontSize={10} />
              <Tooltip
                formatter={(val: any, name: any, props: any) => [
                  `₹${Number(val).toLocaleString()}`,
                  props.payload.is_forecast ? 'Estimated Forecast' : 'Recorded Actual',
                ]}
                contentStyle={{
                  backgroundColor: '#0f172a',
                  borderColor: '#334155',
                  borderRadius: '0.75rem',
                  fontSize: '12px',
                }}
              />
              <Line
                type="monotone"
                dataKey="amount"
                stroke="#14b8a6"
                strokeWidth={2.5}
                dot={{ fill: '#14b8a6', r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Category Level Predictions Grid */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
        <div>
          <h3 className="text-sm font-bold text-white font-display">Category-Level Expense Forecasts</h3>
          <p className="text-[11px] text-slate-400">
            Estimated category totals and statistical prediction intervals for next month.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {forecast?.category_forecasts && forecast.category_forecasts.length > 0 ? (
            forecast.category_forecasts.map((cat) => (
              <div
                key={cat.category}
                className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition"
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xs font-bold text-white">{cat.category}</h4>
                  <span
                    className={`text-[10px] font-semibold ${
                      cat.expected_change_percent > 0 ? 'text-amber-400' : 'text-emerald-400'
                    }`}
                  >
                    {cat.expected_change_percent > 0 ? '+' : ''}
                    {cat.expected_change_percent.toFixed(1)}%
                  </span>
                </div>

                <div className="flex items-baseline justify-between mb-2">
                  <span className="text-[10px] text-slate-400">Historical Avg:</span>
                  <span className="font-mono text-xs text-slate-300">₹{cat.current_average.toLocaleString()}</span>
                </div>

                <div className="flex items-baseline justify-between mb-3">
                  <span className="text-[10px] text-brand-300 font-semibold">Predicted Next:</span>
                  <span className="font-mono text-base font-bold text-brand-400">
                    ₹{cat.predicted_amount.toLocaleString()}
                  </span>
                </div>

                <div className="pt-2 border-t border-slate-800/80 text-[10px] text-slate-400 flex items-center justify-between">
                  <span>Estimated Range:</span>
                  <span className="font-mono font-medium text-slate-300">
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
