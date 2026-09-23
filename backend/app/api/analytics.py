from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta
import calendar

from ..database import get_db
from ..models.user import User
from ..models.transaction import Transaction
from ..models.budget import Budget
from ..schemas.analytics import (
    DashboardSummary,
    CategorySpend,
    DailySpend,
    MonthComparisonItem,
    WhySpendingMoreResponse
)
from ..services.auth_service import get_current_user

router = APIRouter(prefix="/analytics", tags=["Analytics"])

def get_month_range(year: int, month: int):
    start = datetime(year, month, 1)
    _, last_day = calendar.monthrange(year, month)
    end = datetime(year, month, last_day, 23, 59, 59)
    return start, end

@router.get("/summary", response_model=DashboardSummary)
def get_dashboard_summary(
    month: Optional[str] = None,  # "YYYY-MM"
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    now = datetime.utcnow()
    target_month = month or now.strftime("%Y-%m")
    y, m = map(int, target_month.split("-"))
    start_date, end_date = get_month_range(y, m)

    # All-time transactions for balance calculation
    all_txs = db.query(Transaction).filter(Transaction.user_id == current_user.id).all()
    all_income = sum(t.amount for t in all_txs if t.type == "income")
    all_expense = sum(t.amount for t in all_txs if t.type == "expense")
    total_balance = max(0.0, round(all_income - all_expense, 2))

    # Current month transactions
    month_txs = [t for t in all_txs if start_date <= t.date <= end_date]
    month_income = sum(t.amount for t in month_txs if t.type == "income")
    month_expense = sum(t.amount for t in month_txs if t.type == "expense")
    savings = round(month_income - month_expense, 2)

    # Budget total
    budgets = db.query(Budget).filter(
        Budget.user_id == current_user.id,
        Budget.month == target_month
    ).all()
    budget_total = sum(b.amount for b in budgets)
    if budget_total == 0:
        budget_total = current_user.monthly_budget or 20000.0

    used_pct = round((month_expense / budget_total) * 100, 1) if budget_total > 0 else 0.0
    status_text = f"You have used {used_pct:.0f}% of your monthly budget."

    # Categories breakdown
    cat_map = {}
    cat_count = {}
    for t in month_txs:
        if t.type == "expense":
            cat_map[t.final_category] = cat_map.get(t.final_category, 0.0) + t.amount
            cat_count[t.final_category] = cat_count.get(t.final_category, 0) + 1

    cat_list = []
    top_cat = "None"
    top_amt = 0.0
    for cat, amt in cat_map.items():
        if amt > top_amt:
            top_amt = amt
            top_cat = cat
        pct = round((amt / month_expense) * 100, 1) if month_expense > 0 else 0.0
        cat_list.append(CategorySpend(
            category=cat,
            amount=round(amt, 2),
            percentage=pct,
            transaction_count=cat_count[cat]
        ))
    cat_list.sort(key=lambda x: x.amount, reverse=True)

    # Daily spending series
    daily_map: Dict[str, Dict[str, float]] = {}
    curr_d = start_date
    while curr_d <= end_date:
        d_str = curr_d.strftime("%Y-%m-%d")
        daily_map[d_str] = {"expense": 0.0, "income": 0.0}
        curr_d += timedelta(days=1)

    for t in month_txs:
        d_str = t.date.strftime("%Y-%m-%d")
        if d_str in daily_map:
            if t.type == "expense":
                daily_map[d_str]["expense"] += t.amount
            else:
                daily_map[d_str]["income"] += t.amount

    daily_list = [
        DailySpend(date=d, amount=round(vals["expense"], 2), income=round(vals["income"], 2))
        for d, vals in sorted(daily_map.items())
    ]

    # Anomalies count in this month
    anomaly_count = sum(1 for t in month_txs if t.is_anomaly)

    # Recurring count
    recurring_count = sum(1 for t in month_txs if t.is_recurring)

    # Recent transactions
    recent = sorted(month_txs, key=lambda x: x.date, reverse=True)[:5]
    recent_formatted = [
        {
            "id": t.id,
            "date": t.date.strftime("%d %b"),
            "description": t.description,
            "amount": t.amount,
            "type": t.type,
            "category": t.final_category,
            "ai_confidence": round(t.ai_confidence * 100) if t.ai_confidence else 95,
            "is_anomaly": t.is_anomaly
        }
        for t in recent
    ]

    month_name = datetime(y, m, 1).strftime("%B %Y")

    return DashboardSummary(
        total_balance=total_balance,
        income_this_month=round(month_income, 2),
        expenses_this_month=round(month_expense, 2),
        savings_this_month=savings,
        budget_total=round(budget_total, 2),
        budget_used_percent=used_pct,
        budget_status_text=status_text,
        current_month_name=month_name,
        anomaly_count=anomaly_count,
        recurring_count=recurring_count,
        top_category=top_cat,
        categories=cat_list,
        daily_spending=daily_list,
        recent_transactions=recent_formatted
    )

@router.get("/month-comparison", response_model=List[MonthComparisonItem])
def get_month_comparison(
    current_month: Optional[str] = None,   # "2026-09"
    previous_month: Optional[str] = None,  # "2026-08"
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    now = datetime.utcnow()
    curr_str = current_month or now.strftime("%Y-%m")
    curr_y, curr_m = map(int, curr_str.split("-"))

    if previous_month:
        prev_y, prev_m = map(int, previous_month.split("-"))
    else:
        prev_m = curr_m - 1 if curr_m > 1 else 12
        prev_y = curr_y if curr_m > 1 else curr_y - 1

    curr_start, curr_end = get_month_range(curr_y, curr_m)
    prev_start, prev_end = get_month_range(prev_y, prev_m)

    txs = db.query(Transaction).filter(
        Transaction.user_id == current_user.id,
        Transaction.type == "expense"
    ).all()

    curr_map = {}
    prev_map = {}

    for t in txs:
        if curr_start <= t.date <= curr_end:
            curr_map[t.final_category] = curr_map.get(t.final_category, 0.0) + t.amount
        elif prev_start <= t.date <= prev_end:
            prev_map[t.final_category] = prev_map.get(t.final_category, 0.0) + t.amount

    all_categories = sorted(list(set(list(curr_map.keys()) + list(prev_map.keys()))))
    comparison = []

    for cat in all_categories:
        c_amt = curr_map.get(cat, 0.0)
        p_amt = prev_map.get(cat, 0.0)
        diff = c_amt - p_amt
        pct = round((diff / p_amt) * 100, 1) if p_amt > 0 else (100.0 if c_amt > 0 else 0.0)

        comparison.append(MonthComparisonItem(
            category=cat,
            prev_month_amount=round(p_amt, 2),
            current_month_amount=round(c_amt, 2),
            change_amount=round(diff, 2),
            change_percent=pct
        ))

    comparison.sort(key=lambda x: abs(x.change_amount), reverse=True)
    return comparison

@router.get("/why-spending-more", response_model=WhySpendingMoreResponse)
def get_why_spending_more(
    current_month: Optional[str] = None,
    previous_month: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    now = datetime.utcnow()
    curr_str = current_month or now.strftime("%Y-%m")
    curr_y, curr_m = map(int, curr_str.split("-"))

    prev_m = curr_m - 1 if curr_m > 1 else 12
    prev_y = curr_y if curr_m > 1 else curr_y - 1
    prev_str = previous_month or f"{prev_y:04d}-{prev_m:02d}"

    curr_start, curr_end = get_month_range(curr_y, curr_m)
    prev_start, prev_end = get_month_range(prev_y, prev_m)

    txs = db.query(Transaction).filter(
        Transaction.user_id == current_user.id,
        Transaction.type == "expense"
    ).all()

    curr_cat: Dict[str, float] = {}
    prev_cat: Dict[str, float] = {}

    for t in txs:
        if curr_start <= t.date <= curr_end:
            curr_cat[t.final_category] = curr_cat.get(t.final_category, 0.0) + t.amount
        elif prev_start <= t.date <= prev_end:
            prev_cat[t.final_category] = prev_cat.get(t.final_category, 0.0) + t.amount

    curr_total = sum(curr_cat.values())
    prev_total = sum(prev_cat.values())
    tot_diff = curr_total - prev_total
    pct_inc = round((tot_diff / prev_total) * 100, 1) if prev_total > 0 else 0.0

    increases = []
    for cat, c_amt in curr_cat.items():
        p_amt = prev_cat.get(cat, 0.0)
        diff = c_amt - p_amt
        if diff > 0:
            diff_pct = round((diff / p_amt) * 100, 1) if p_amt > 0 else 100.0
            increases.append({
                "category": cat,
                "current_amount": round(c_amt, 2),
                "previous_amount": round(p_amt, 2),
                "difference": round(diff, 2),
                "percent_increase": diff_pct
            })

    increases.sort(key=lambda x: x["difference"], reverse=True)
    top_contributors = increases[:4]

    if tot_diff > 0:
        top_str = ", ".join([f"{item['category']} (+₹{item['difference']:,.0f})" for item in top_contributors[:3]])
        summary_text = (
            f"Your spending increased by ₹{tot_diff:,.0f} ({pct_inc:+0.1f}%) compared with last month. "
            f"The largest contributors were {top_str}."
        )
    else:
        summary_text = (
            f"Your spending decreased by ₹{abs(tot_diff):,.0f} compared with last month."
        )

    return WhySpendingMoreResponse(
        current_month=curr_str,
        previous_month=prev_str,
        current_total=round(curr_total, 2),
        previous_total=round(prev_total, 2),
        total_difference=round(tot_diff, 2),
        percent_increase=pct_inc,
        summary_text=summary_text,
        top_contributors=top_contributors
    )
