import io
import csv
from datetime import datetime
from fastapi import APIRouter, Depends, UploadFile, File, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session
from typing import List, Optional

from ..database import get_db
from ..models.user import User
from ..models.transaction import Transaction
from ..services.auth_service import get_current_user
from ..ml.classifier import classifier
from ..ml.anomaly_detector import anomaly_detector
from ..ml.recurring_detector import recurring_detector

router = APIRouter(prefix="/import", tags=["CSV Import"])

class CsvRowPreview(BaseModel):
    date: str
    description: str
    amount: float
    type: str
    ai_category: str
    confidence: float
    final_category: str
    is_anomaly: bool
    anomaly_reason: Optional[str] = None

class CsvConfirmRequest(BaseModel):
    transactions: List[CsvRowPreview]

@router.post("/preview", response_model=List[CsvRowPreview])
async def preview_csv(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if not file.filename.endswith(".csv"):
        raise HTTPException(status_code=400, detail="Only CSV files are supported.")

    content = await file.read()
    try:
        decoded = content.decode("utf-8-sig")
    except UnicodeDecodeError:
        decoded = content.decode("latin-1")

    reader = csv.DictReader(io.StringIO(decoded))
    if not reader.fieldnames:
        raise HTTPException(status_code=400, detail="Malformed CSV file with no header row.")

    # Normalize fieldnames
    field_map = {fn.strip().lower(): fn for fn in reader.fieldnames}
    required = ["date", "description", "amount"]
    missing = [r for r in required if r not in field_map]
    if missing:
        raise HTTPException(
            status_code=400,
            detail=f"Missing required CSV columns: {', '.join(missing)}. Expected headers: date, description, amount, type"
        )

    preview_rows = []
    # Fetch historical amounts per category for anomaly check
    hist_txs = db.query(Transaction.final_category, Transaction.amount).filter(
        Transaction.user_id == current_user.id,
        Transaction.type == "expense"
    ).all()
    cat_hist = {}
    for cat, amt in hist_txs:
        cat_hist.setdefault(cat, []).append(amt)

    for idx, row in enumerate(reader):
        try:
            raw_date = row[field_map["date"]].strip()
            # Parse date flexibly (YYYY-MM-DD, DD/MM/YYYY, etc.)
            dt = None
            for fmt in ("%Y-%m-%d", "%d-%m-%Y", "%d/%m/%Y", "%m/%d/%Y", "%Y/%m/%d"):
                try:
                    dt = datetime.strptime(raw_date, fmt)
                    break
                except ValueError:
                    continue
            if not dt:
                dt = datetime.utcnow()

            desc = row[field_map["description"]].strip()
            raw_amt = row[field_map["amount"]].strip().replace(",", "").replace("₹", "").replace("$", "")
            amt = abs(float(raw_amt))
            tx_type = row.get(field_map.get("type", ""), "expense").strip().lower()
            if tx_type not in ("income", "expense"):
                tx_type = "expense"

            # AI Categorization
            clf = classifier.classify(desc, amt)
            ai_cat = clf["category"]
            conf = clf["confidence"]

            # Anomaly check
            is_anom = False
            anom_reason = None
            if tx_type == "expense":
                h_amts = cat_hist.get(ai_cat, [])
                anom_res = anomaly_detector.evaluate_transaction(amt, ai_cat, h_amts)
                is_anom = anom_res["is_anomaly"]
                anom_reason = anom_res["anomaly_reason"]

            preview_rows.append(CsvRowPreview(
                date=dt.strftime("%Y-%m-%d"),
                description=desc,
                amount=amt,
                type=tx_type,
                ai_category=ai_cat,
                confidence=conf,
                final_category=ai_cat,
                is_anomaly=is_anom,
                anomaly_reason=anom_reason
            ))
        except Exception:
            continue

    if not preview_rows:
        raise HTTPException(status_code=400, detail="No valid transaction rows found in uploaded CSV.")

    return preview_rows

@router.post("/confirm")
def confirm_csv_import(
    req: CsvConfirmRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    saved_count = 0
    for row in req.transactions:
        try:
            dt = datetime.strptime(row.date, "%Y-%m-%d")
        except Exception:
            dt = datetime.utcnow()

        merchant_norm = recurring_detector.normalize_merchant(row.description)
        tx = Transaction(
            user_id=current_user.id,
            date=dt,
            description=row.description,
            amount=row.amount,
            type=row.type,
            ai_category=row.ai_category,
            final_category=row.final_category,
            ai_confidence=row.confidence,
            classification_reason=f"Batch AI classified as {row.ai_category}",
            anomaly_score=0.95 if row.is_anomaly else 0.05,
            is_anomaly=row.is_anomaly,
            anomaly_reason=row.anomaly_reason,
            merchant_normalized=merchant_norm,
            payment_method="CSV Import"
        )
        db.add(tx)
        saved_count += 1

    db.commit()
    return {"message": f"Successfully imported {saved_count} transactions."}
