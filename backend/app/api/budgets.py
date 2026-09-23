from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
import calendar

from ..database import get_db
from ..models.user import User
from ..models.budget import Budget
from ..models.transaction import Transaction
from ..schemas.budget import BudgetCreate, BudgetUpdate, BudgetOut, BudgetProgressOut
from ..services.auth_service import get_current_user
from ..ml.forecaster import forecaster

router = APIRouter(prefix="/budgets", tags=["Budgets"])

@router.get("", response_model=List[BudgetProgressOut])
def get_budgets(
    month: Optional[str] = None,  # "YYYY-MM"
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    now = datetime.utcnow()
    target_month = month or now.strftime("%Y-%m")

    # Fetch user's budgets for this month
    budgets = db.query(Budget).filter(
        Budget.user_id == current_user.id,
        Budget.month == target_month
    ).all()

    # Calculate actual spending for each category in this month
    try:
        y, m = map(int, target_month.split("-"))
        start_date = datetime(y, m, 1)
        _, last_day = calendar.monthrange(y, m)
        end_date = datetime(y, m, last_day, 23, 59, 59)
    except Exception:
        start_date = datetime(now.year, now.month, 1)
        last_day = 30
        end_date = now

    txs = db.query(Transaction).filter(
        Transaction.user_id == current_user.id,
        Transaction.type == "expense",
        Transaction.date >= start_date,
        Transaction.date <= end_date
    ).all()

    category_spent = {}
    for tx in txs:
        category_spent[tx.final_category] = category_spent.get(tx.final_category, 0.0) + tx.amount

    # Day of month for pace calculation
    current_day = min(last_day, now.day) if (now.year == y and now.month == m) else last_day

    results = []
    for b in budgets:
        spent = category_spent.get(b.category, 0.0)
        remaining = max(0.0, b.amount - spent)
        pct = round((spent / b.amount) * 100, 1) if b.amount > 0 else 0.0

        # Semantic status determination
        if pct > 100.0:
            status_label = "over_budget"
        elif pct >= 90.0:
            status_label = "near_limit"
        elif pct >= 70.0:
            status_label = "attention"
        else:
            status_label = "normal"

        # Projected spend calculation
        proj_data = forecaster.project_budget_status(
            category=b.category,
            spent_amount=spent,
            budget_amount=b.amount,
            day_of_month=current_day,
            days_in_month=last_day
        )

        results.append(BudgetProgressOut(
            id=b.id,
            category=b.category,
            month=b.month,
            budget_amount=b.amount,
            spent_amount=round(spent, 2),
            remaining_amount=round(remaining, 2),
            usage_percentage=pct,
            status=status_label,
            projected_spend=proj_data["projected_spend"],
            is_projected_over=proj_data["is_projected_over"],
            projection_alert=proj_data["projection_alert"]
        ))

    return results

@router.post("", response_model=BudgetOut)
def create_or_update_budget(
    budget_in: BudgetCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    existing = db.query(Budget).filter(
        Budget.user_id == current_user.id,
        Budget.month == budget_in.month,
        Budget.category == budget_in.category
    ).first()

    if existing:
        existing.amount = budget_in.amount
        db.commit()
        db.refresh(existing)
        return existing

    budget = Budget(
        user_id=current_user.id,
        category=budget_in.category,
        month=budget_in.month,
        amount=budget_in.amount
    )
    db.add(budget)
    db.commit()
    db.refresh(budget)
    return budget

@router.patch("/{id}", response_model=BudgetOut)
def update_budget(
    id: int,
    budget_in: BudgetUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    budget = db.query(Budget).filter(
        Budget.id == id,
        Budget.user_id == current_user.id
    ).first()
    if not budget:
        raise HTTPException(status_code=404, detail="Budget not found.")

    budget.amount = budget_in.amount
    db.commit()
    db.refresh(budget)
    return budget

@router.delete("/{id}")
def delete_budget(
    id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    budget = db.query(Budget).filter(
        Budget.id == id,
        Budget.user_id == current_user.id
    ).first()
    if not budget:
        raise HTTPException(status_code=404, detail="Budget not found.")

    db.delete(budget)
    db.commit()
    return {"message": "Budget deleted successfully"}
