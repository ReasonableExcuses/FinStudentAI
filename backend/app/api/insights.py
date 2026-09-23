import json
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List, Dict, Any
from datetime import datetime
from collections import defaultdict
import calendar

from ..database import get_db
from ..models.user import User
from ..models.insight import Insight
from ..models.transaction import Transaction
from ..models.budget import Budget
from ..models.recurring import RecurringExpense
from ..schemas.insight import InsightOut
from ..services.auth_service import get_current_user
from ..ml.insight_engine import insight_engine
from ..ml.forecaster import forecaster

router = APIRouter(prefix="/insights", tags=["Insights"])

@router.get("", response_model=List[InsightOut])
def get_insights(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    now = datetime.utcnow()
    curr_month = now.strftime("%Y-%m")
    curr_y, curr_m = map(int, curr_month.split("-"))

    prev_m = curr_m - 1 if curr_m > 1 else 12
    prev_y = curr_y if curr_m > 1 else curr_y - 1
    prev_month = f"{prev_y:04d}-{prev_m:02d}"

    # Calculate real data to feed insight engine
    txs = db.query(Transaction).filter(Transaction.user_id == current_user.id).all()

    curr_start = datetime(curr_y, curr_m, 1)
    _, last_day = calendar.monthrange(curr_y, curr_m)
    curr_end = datetime(curr_y, curr_m, last_day, 23, 59, 59)

    prev_start = datetime(prev_y, prev_m, 1)
    _, prev_last_day = calendar.monthrange(prev_y, prev_m)
    prev_end = datetime(prev_y, prev_m, prev_last_day, 23, 59, 59)

    curr_cat = defaultdict(float)
    prev_cat = defaultdict(float)
    curr_income = 0.0
    curr_expense = 0.0

    for t in txs:
        if curr_start <= t.date <= curr_end:
            if t.type == "expense":
                curr_cat[t.final_category] += t.amount
                curr_expense += t.amount
            else:
                curr_income += t.amount
        elif prev_start <= t.date <= prev_end:
            if t.type == "expense":
                prev_cat[t.final_category] += t.amount

    # Anomalies
    anomalies = [
        {
            "description": t.description,
            "amount": t.amount,
            "category": t.final_category,
            "historical_average": t.amount / (1 + (t.anomaly_score * 5)) if t.anomaly_score else 200,
            "deviation_percent": round(t.anomaly_score * 800) if t.anomaly_score else 200
        }
        for t in txs if t.is_anomaly and curr_start <= t.date <= curr_end
    ]

    # Recurring
    recurring = db.query(RecurringExpense).filter(
        RecurringExpense.user_id == current_user.id,
        RecurringExpense.is_active == True
    ).all()
    rec_dicts = [{"merchant": r.merchant, "amount": r.amount, "frequency": r.frequency} for r in recurring]

    # Budget checks
    budgets = db.query(Budget).filter(Budget.user_id == current_user.id, Budget.month == curr_month).all()
    budget_breaches = []
    current_day = min(last_day, now.day)
    for b in budgets:
        spent = curr_cat[b.category]
        proj = forecaster.project_budget_status(b.category, spent, b.amount, current_day, last_day)
        if proj["is_projected_over"]:
            budget_breaches.append({
                "category": b.category,
                "budget_amount": b.amount,
                "projected_spend": proj["projected_spend"]
            })

    # Historical monthly for forecast
    monthly_expenses = defaultdict(float)
    category_monthly = defaultdict(lambda: defaultdict(float))
    for t in txs:
        if t.type == "expense":
            m_k = t.date.strftime("%Y-%m")
            monthly_expenses[m_k] += t.amount
            category_monthly[t.final_category][m_k] += t.amount

    forecast_data = forecaster.forecast_spending(
        monthly_expenses=dict(monthly_expenses),
        category_monthly={k: dict(v) for k, v in category_monthly.items()}
    )

    generated = insight_engine.generate_insights(
        current_month=curr_month,
        previous_month=prev_month,
        current_cat_spend=dict(curr_cat),
        previous_cat_spend=dict(prev_cat),
        total_income=curr_income,
        total_expenses=curr_expense,
        anomalies=anomalies,
        recurring_items=rec_dicts,
        forecast_data=forecast_data,
        budget_breaches=budget_breaches
    )

    # Convert to InsightOut objects with parsed JSON supporting_data
    results = []
    for idx, item in enumerate(generated):
        parsed_data = None
        if item.get("supporting_data"):
            try:
                parsed_data = json.loads(item["supporting_data"])
            except Exception:
                parsed_data = item["supporting_data"]

        results.append(InsightOut(
            id=idx + 1,
            type=item["type"],
            title=item["title"],
            description=item["description"],
            supporting_data=parsed_data,
            severity=item["severity"],
            category=item.get("category"),
            is_read=False,
            created_at=datetime.utcnow()
        ))

    return results
