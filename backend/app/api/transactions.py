from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime

from ..database import get_db
from ..models.user import User
from ..models.transaction import Transaction
from ..schemas.transaction import (
    TransactionCreate,
    TransactionUpdate,
    TransactionOut,
    ClassifyRequest,
    ClassifyResponse
)
from ..services.auth_service import get_current_user
from ..ml.classifier import classifier
from ..ml.anomaly_detector import anomaly_detector
from ..ml.recurring_detector import recurring_detector

router = APIRouter(prefix="/transactions", tags=["Transactions"])

@router.post("/classify", response_model=ClassifyResponse)
def classify_transaction(req: ClassifyRequest):
    result = classifier.classify(req.description, req.amount)
    return ClassifyResponse(
        description=req.description,
        category=result["category"],
        confidence=result["confidence"],
        reason=result["reason"],
        method=result["method"]
    )

@router.get("", response_model=List[TransactionOut])
def get_transactions(
    category: Optional[str] = None,
    type: Optional[str] = None,
    is_anomaly: Optional[bool] = None,
    month: Optional[str] = None,  # "YYYY-MM"
    search: Optional[str] = None,
    limit: int = Query(100, ge=1, le=500),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(Transaction).filter(Transaction.user_id == current_user.id)

    if category:
        query = query.filter(Transaction.final_category == category)
    if type:
        query = query.filter(Transaction.type == type)
    if is_anomaly is not None:
        query = query.filter(Transaction.is_anomaly == is_anomaly)
    if search:
        query = query.filter(Transaction.description.ilike(f"%{search}%"))

    if month:
        try:
            year, m = map(int, month.split("-"))
            start_date = datetime(year, m, 1)
            end_m = m + 1 if m < 12 else 1
            end_y = year if m < 12 else year + 1
            end_date = datetime(end_y, end_m, 1)
            query = query.filter(Transaction.date >= start_date, Transaction.date < end_date)
        except Exception:
            pass

    return query.order_by(Transaction.date.desc()).offset(offset).limit(limit).all()

@router.post("", response_model=TransactionOut)
def create_transaction(
    tx_in: TransactionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Step 1: AI Categorization if category omitted or set to auto
    ai_cat = tx_in.ai_category
    confidence = tx_in.ai_confidence or 1.0
    reason = tx_in.classification_reason

    if not ai_cat:
        clf_result = classifier.classify(tx_in.description, tx_in.amount)
        ai_cat = clf_result["category"]
        confidence = clf_result["confidence"]
        reason = clf_result["reason"]

    final_cat = tx_in.final_category or ai_cat

    # Step 2: Merchant Normalization
    norm_merchant = recurring_detector.normalize_merchant(tx_in.description)

    # Step 3: Anomaly Detection against historical transactions in this category
    is_anomaly = False
    anomaly_score = 0.0
    anomaly_reason = None

    if tx_in.type == "expense":
        hist_txs = db.query(Transaction.amount).filter(
            Transaction.user_id == current_user.id,
            Transaction.type == "expense",
            Transaction.final_category == final_cat
        ).all()
        hist_amounts = [t[0] for t in hist_txs]

        anom_res = anomaly_detector.evaluate_transaction(tx_in.amount, final_cat, hist_amounts)
        is_anomaly = anom_res["is_anomaly"]
        anomaly_score = anom_res["anomaly_score"]
        anomaly_reason = anom_res["anomaly_reason"]

    tx = Transaction(
        user_id=current_user.id,
        date=tx_in.date,
        description=tx_in.description,
        amount=tx_in.amount,
        type=tx_in.type,
        ai_category=ai_cat,
        final_category=final_cat,
        ai_confidence=confidence,
        classification_reason=reason,
        anomaly_score=anomaly_score,
        is_anomaly=is_anomaly,
        anomaly_reason=anomaly_reason,
        merchant_normalized=norm_merchant,
        payment_method=tx_in.payment_method or "UPI",
        notes=tx_in.notes
    )
    db.add(tx)
    db.commit()
    db.refresh(tx)
    return tx

@router.get("/{id}", response_model=TransactionOut)
def get_transaction(
    id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    tx = db.query(Transaction).filter(
        Transaction.id == id,
        Transaction.user_id == current_user.id
    ).first()
    if not tx:
        raise HTTPException(status_code=404, detail="Transaction not found.")
    return tx

@router.patch("/{id}", response_model=TransactionOut)
def update_transaction(
    id: int,
    tx_update: TransactionUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    tx = db.query(Transaction).filter(
        Transaction.id == id,
        Transaction.user_id == current_user.id
    ).first()
    if not tx:
        raise HTTPException(status_code=404, detail="Transaction not found.")

    update_data = tx_update.dict(exclude_unset=True)
    for field, val in update_data.items():
        setattr(tx, field, val)

    db.commit()
    db.refresh(tx)
    return tx

@router.delete("/{id}")
def delete_transaction(
    id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    tx = db.query(Transaction).filter(
        Transaction.id == id,
        Transaction.user_id == current_user.id
    ).first()
    if not tx:
        raise HTTPException(status_code=404, detail="Transaction not found.")

    db.delete(tx)
    db.commit()
    return {"message": "Transaction deleted successfully"}
