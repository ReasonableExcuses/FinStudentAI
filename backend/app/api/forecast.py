from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import Dict, Any
from datetime import datetime
from collections import defaultdict

from ..database import get_db
from ..models.user import User
from ..models.transaction import Transaction
from ..models.budget import Budget
from ..schemas.forecast import ForecastSummaryOut
from ..services.auth_service import get_current_user
from ..ml.forecaster import forecaster

router = APIRouter(prefix="/forecast", tags=["Forecast"])

@router.get("", response_model=ForecastSummaryOut)
def get_forecast(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Retrieve all user expense transactions
    txs = db.query(Transaction).filter(
        Transaction.user_id == current_user.id,
        Transaction.type == "expense"
    ).order_by(Transaction.date.asc()).all()

    # Aggregate by month
    monthly_expenses = defaultdict(float)
    category_monthly = defaultdict(lambda: defaultdict(float))

    for t in txs:
        m_key = t.date.strftime("%Y-%m")
        monthly_expenses[m_key] += t.amount
        category_monthly[t.final_category][m_key] += t.amount

    forecast_res = forecaster.forecast_spending(
        monthly_expenses=dict(monthly_expenses),
        category_monthly={k: dict(v) for k, v in category_monthly.items()}
    )

    return ForecastSummaryOut(
        current_month=forecast_res["current_month"],
        current_actual=forecast_res["current_actual"],
        forecast_month=forecast_res["forecast_month"],
        forecast_predicted=forecast_res["forecast_predicted"],
        expected_change_percent=forecast_res["expected_change_percent"],
        method=forecast_res["method"],
        explanation=forecast_res["explanation"],
        historical_trend=forecast_res["historical_trend"],
        category_forecasts=forecast_res["category_forecasts"]
    )
