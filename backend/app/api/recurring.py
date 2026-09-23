from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List, Dict, Any

from ..database import get_db
from ..models.user import User
from ..models.recurring import RecurringExpense
from ..models.transaction import Transaction
from ..schemas.recurring import RecurringSummaryOut, RecurringExpenseOut
from ..services.auth_service import get_current_user
from ..ml.recurring_detector import recurring_detector

router = APIRouter(prefix="/recurring", tags=["Recurring Expenses"])

@router.get("", response_model=RecurringSummaryOut)
def get_recurring_expenses(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Fetch existing stored recurring records
    items = db.query(RecurringExpense).filter(
        RecurringExpense.user_id == current_user.id,
        RecurringExpense.is_active == True
    ).all()

    # If no stored recurring records, run dynamic detection on user's transactions
    if not items:
        user_txs = db.query(Transaction).filter(
            Transaction.user_id == current_user.id,
            Transaction.type == "expense"
        ).all()

        tx_dicts = [
            {
                "id": t.id,
                "date": t.date,
                "description": t.description,
                "amount": t.amount,
                "category": t.final_category
            }
            for t in user_txs
        ]

        detected = recurring_detector.detect_recurring(tx_dicts)
        for d in detected:
            rec = RecurringExpense(
                user_id=current_user.id,
                merchant=d["merchant"],
                category=d["category"],
                amount=d["amount"],
                frequency=d["frequency"],
                occurrences=d["occurrences"],
                last_detected=d["last_detected"],
                confidence=d["confidence"],
                is_active=True
            )
            db.add(rec)
        if detected:
            db.commit()
            items = db.query(RecurringExpense).filter(
                RecurringExpense.user_id == current_user.id,
                RecurringExpense.is_active == True
            ).all()

    total_monthly = sum(i.amount for i in items)

    return RecurringSummaryOut(
        total_monthly_recurring=round(total_monthly, 2),
        subscription_count=len(items),
        recurring_items=items
    )
