import json
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from datetime import datetime
from collections import defaultdict
import calendar

from ..database import get_db
from ..models.user import User
from ..models.transaction import Transaction
from ..models.budget import Budget
from ..models.recurring import RecurringExpense
from ..models.qa import QAQuery
from ..schemas.insight import QARequest, QAResponse
from ..services.auth_service import get_current_user
from ..ml.qa_engine import qa_engine
from ..ml.forecaster import forecaster

router = APIRouter(prefix="/qa", tags=["Ask FinStudent"])

@router.post("", response_model=QAResponse)
def ask_question(
    req: QARequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    now = datetime.utcnow()
    curr_month = now.strftime("%Y-%m")
    curr_y, curr_m = map(int, curr_month.split("-"))

    prev_m = curr_m - 1 if curr_m > 1 else 12
    prev_y = curr_y if curr_m > 1 else curr_y - 1
    prev_month = f"{prev_y:04d}-{prev_m:02d}"

    curr_start = datetime(curr_y, curr_m, 1)
    _, last_day = calendar.monthrange(curr_y, curr_m)
    curr_end = datetime(curr_y, curr_m, last_day, 23, 59, 59)

    prev_start = datetime(prev_y, prev_m, 1)
    _, prev_last_day = calendar.monthrange(prev_y, prev_m)
    prev_end = datetime(prev_y, prev_m, prev_last_day, 23, 59, 59)

    txs = db.query(Transaction).filter(Transaction.user_id == current_user.id).all()

    curr_categories = defaultdict(float)
    prev_categories = defaultdict(float)
    curr_income = 0.0
    curr_expense = 0.0
    anomalies = []

    for t in txs:
        if curr_start <= t.date <= curr_end:
            if t.type == "expense":
                curr_categories[t.final_category] += t.amount
                curr_expense += t.amount
                if t.is_anomaly:
                    anomalies.append({
                        "description": t.description,
                        "amount": t.amount,
                        "category": t.final_category,
                        "deviation_percent": round(t.anomaly_score * 800) if t.anomaly_score else 200,
                        "historical_average": 163.0
                    })
            else:
                curr_income += t.amount
        elif prev_start <= t.date <= prev_end:
            if t.type == "expense":
                prev_categories[t.final_category] += t.amount

    recurring = db.query(RecurringExpense).filter(
        RecurringExpense.user_id == current_user.id,
        RecurringExpense.is_active == True
    ).all()
    rec_items = [{"merchant": r.merchant, "amount": r.amount, "frequency": r.frequency} for r in recurring]

    budgets = db.query(Budget).filter(Budget.user_id == current_user.id, Budget.month == curr_month).all()
    budget_items = []
    for b in budgets:
        spent = curr_categories.get(b.category, 0.0)
        budget_items.append({"category": b.category, "budget_amount": b.amount, "spent_amount": spent})

    # Forecast
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

    user_context = {
        "current_month": curr_month,
        "current_expenses": curr_expense,
        "current_income": curr_income,
        "categories": dict(curr_categories),
        "previous_categories": dict(prev_categories),
        "anomalies": anomalies,
        "recurring": rec_items,
        "forecast": forecast_data,
        "budgets": budget_items
    }

    response_dict = qa_engine.process_query(req.question, user_context)

    # Save query to history
    qa_record = QAQuery(
        user_id=current_user.id,
        question=req.question,
        answer=response_dict["answer"],
        intent=response_dict.get("intent"),
        structured_data=json.dumps(response_dict.get("structured_data", {}))
    )
    db.add(qa_record)
    db.commit()

    return QAResponse(
        question=response_dict["question"],
        answer=response_dict["answer"],
        intent=response_dict["intent"],
        structured_data=response_dict.get("structured_data"),
        supporting_chart_type=response_dict.get("supporting_chart_type"),
        supporting_chart_data=response_dict.get("supporting_chart_data")
    )
