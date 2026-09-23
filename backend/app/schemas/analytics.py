from pydantic import BaseModel
from typing import List, Optional, Dict, Any

class CategorySpend(BaseModel):
    category: str
    amount: float
    percentage: float
    transaction_count: int

class DailySpend(BaseModel):
    date: str  # "YYYY-MM-DD"
    amount: float
    income: float = 0.0

class MonthComparisonItem(BaseModel):
    category: str
    prev_month_amount: float
    current_month_amount: float
    change_amount: float
    change_percent: float

class DashboardSummary(BaseModel):
    total_balance: float
    income_this_month: float
    expenses_this_month: float
    savings_this_month: float
    budget_total: float
    budget_used_percent: float
    budget_status_text: str
    current_month_name: str
    anomaly_count: int
    recurring_count: int
    top_category: str
    categories: List[CategorySpend]
    daily_spending: List[DailySpend]
    recent_transactions: List[Any]

class WhySpendingMoreResponse(BaseModel):
    current_month: str
    previous_month: str
    current_total: float
    previous_total: float
    total_difference: float
    percent_increase: float
    summary_text: str
    top_contributors: List[Dict[str, Any]]
