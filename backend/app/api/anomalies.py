from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List, Dict, Any

from ..database import get_db
from ..models.user import User
from ..models.transaction import Transaction
from ..services.auth_service import get_current_user

router = APIRouter(prefix="/anomalies", tags=["Anomalies"])

@router.get("", response_model=List[Dict[str, Any]])
def get_anomalies(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Fetch all flagged anomaly transactions for current user
    anomaly_txs = db.query(Transaction).filter(
        Transaction.user_id == current_user.id,
        Transaction.is_anomaly == True
    ).order_by(Transaction.date.desc()).all()

    results = []
    for tx in anomaly_txs:
        # Calculate historical average for this category excluding this transaction
        cat_txs = db.query(Transaction.amount).filter(
            Transaction.user_id == current_user.id,
            Transaction.type == "expense",
            Transaction.final_category == tx.final_category,
            Transaction.id != tx.id
        ).all()
        hist_amounts = [t[0] for t in cat_txs]
        hist_avg = (sum(hist_amounts) / len(hist_amounts)) if hist_amounts else tx.amount
        dev_pct = round(((tx.amount - hist_avg) / hist_avg) * 100, 1) if hist_avg > 0 else 0.0

        results.append({
            "id": tx.id,
            "date": tx.date.strftime("%d %b %Y"),
            "description": tx.description,
            "amount": tx.amount,
            "category": tx.final_category,
            "anomaly_score": tx.anomaly_score,
            "historical_average": round(hist_avg, 2),
            "deviation_percent": dev_pct,
            "anomaly_reason": tx.anomaly_reason or f"Significantly higher than typical {tx.final_category} spending."
        })

    return results
