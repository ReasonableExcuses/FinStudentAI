export interface User {
  id: number;
  email: string;
  name: string;
  university: string;
  monthly_income: number;
  monthly_budget: number;
  currency: string;
  student_type: string;
  created_at: string;
}

export interface Transaction {
  id: number;
  user_id: number;
  date: string;
  description: string;
  amount: number;
  type: 'expense' | 'income';
  ai_category?: string;
  final_category: string;
  ai_confidence: number;
  classification_reason?: string;
  anomaly_score: number;
  is_anomaly: boolean;
  anomaly_reason?: string;
  merchant_normalized?: string;
  is_recurring: boolean;
  payment_method?: string;
  notes?: string;
  created_at: string;
}

export interface CategorySpend {
  category: string;
  amount: number;
  percentage: number;
  transaction_count: number;
}

export interface DailySpend {
  date: string;
  amount: number;
  income: number;
}

export interface DashboardSummary {
  total_balance: number;
  income_this_month: number;
  expenses_this_month: number;
  savings_this_month: number;
  budget_total: number;
  budget_used_percent: number;
  budget_status_text: string;
  current_month_name: string;
  anomaly_count: number;
  recurring_count: number;
  top_category: string;
  categories: CategorySpend[];
  daily_spending: DailySpend[];
  recent_transactions: {
    id: number;
    date: string;
    description: string;
    amount: number;
    type: string;
    category: string;
    ai_confidence: number;
    is_anomaly: boolean;
  }[];
}

export interface BudgetProgress {
  id?: number;
  category: string;
  month: string;
  budget_amount: number;
  spent_amount: number;
  remaining_amount: number;
  usage_percentage: number;
  status: 'normal' | 'attention' | 'near_limit' | 'over_budget';
  projected_spend?: number;
  is_projected_over: boolean;
  projection_alert?: string;
}

export interface RecurringExpense {
  id: number;
  merchant: string;
  category: string;
  amount: number;
  frequency: string;
  occurrences: number;
  last_detected: string;
  confidence: number;
  is_active: boolean;
}

export interface RecurringSummary {
  total_monthly_recurring: number;
  subscription_count: number;
  recurring_items: RecurringExpense[];
}

export interface CategoryForecast {
  category: string;
  current_average: number;
  predicted_amount: number;
  expected_change_percent: number;
  lower_bound: number;
  upper_bound: number;
  method: string;
}

export interface ForecastSummary {
  current_month: string;
  current_actual: number;
  forecast_month: string;
  forecast_predicted: number;
  expected_change_percent: number;
  method: string;
  explanation: string;
  historical_trend: {
    period: string;
    amount: number;
    is_forecast: boolean;
  }[];
  category_forecasts: CategoryForecast[];
}

export interface Insight {
  id: number;
  type: 'trend' | 'anomaly' | 'budget_risk' | 'recurring' | 'saving';
  title: string;
  description: string;
  supporting_data?: any;
  severity: 'normal' | 'attention' | 'warning' | 'positive';
  category?: string;
  is_read: boolean;
  created_at: string;
}

export interface MonthComparisonItem {
  category: string;
  prev_month_amount: number;
  current_month_amount: number;
  change_amount: number;
  change_percent: number;
}

export interface WhySpendingMore {
  current_month: string;
  previous_month: string;
  current_total: number;
  previous_total: number;
  total_difference: number;
  percent_increase: number;
  summary_text: string;
  top_contributors: {
    category: string;
    current_amount: number;
    previous_amount: number;
    difference: number;
    percent_increase: number;
  }[];
}

export interface AnomalyItem {
  id: number;
  date: string;
  description: string;
  amount: number;
  category: string;
  anomaly_score: number;
  historical_average: number;
  deviation_percent: number;
  anomaly_reason: string;
}

export interface MLReport {
  timestamp: string;
  classification: {
    accuracy: number;
    macro_precision: number;
    macro_recall: number;
    macro_f1: number;
    sample_count: number;
    category_metrics: Record<string, { precision: number; recall: number; f1: number }>;
  };
  anomaly: {
    precision: number;
    recall: number;
    f1: number;
    test_cases_count: number;
    algorithm: string;
  };
  forecast: {
    mae: number;
    rmse: number;
    evaluation_periods: number;
    model_name: string;
  };
  notes: string[];
}
