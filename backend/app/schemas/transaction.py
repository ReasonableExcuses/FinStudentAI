from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class ClassifyRequest(BaseModel):
    description: str
    amount: Optional[float] = None

class ClassifyResponse(BaseModel):
    description: str
    category: str
    confidence: float
    reason: str
    method: str  # "rule_based" or "ml_model"

class TransactionBase(BaseModel):
    date: datetime
    description: str
    amount: float = Field(..., gt=0, description="Amount must be positive")
    type: str = "expense"  # expense or income
    final_category: Optional[str] = None
    payment_method: Optional[str] = "UPI"
    notes: Optional[str] = None

class TransactionCreate(TransactionBase):
    ai_category: Optional[str] = None
    ai_confidence: Optional[float] = None
    classification_reason: Optional[str] = None

class TransactionUpdate(BaseModel):
    date: Optional[datetime] = None
    description: Optional[str] = None
    amount: Optional[float] = Field(None, gt=0)
    type: Optional[str] = None
    final_category: Optional[str] = None
    payment_method: Optional[str] = None
    notes: Optional[str] = None

class TransactionOut(BaseModel):
    id: int
    user_id: int
    date: datetime
    description: str
    amount: float
    type: str
    ai_category: Optional[str]
    final_category: str
    ai_confidence: float
    classification_reason: Optional[str]
    anomaly_score: float
    is_anomaly: bool
    anomaly_reason: Optional[str]
    merchant_normalized: Optional[str]
    is_recurring: bool
    payment_method: Optional[str]
    notes: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True

class TransactionFilter(BaseModel):
    category: Optional[str] = None
    type: Optional[str] = None
    is_anomaly: Optional[bool] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    search: Optional[str] = None
    month: Optional[str] = None  # "YYYY-MM"
