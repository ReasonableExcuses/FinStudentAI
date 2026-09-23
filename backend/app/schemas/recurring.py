from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class RecurringExpenseOut(BaseModel):
    id: int
    merchant: str
    category: str
    amount: float
    frequency: str
    occurrences: int
    last_detected: datetime
    confidence: float
    is_active: bool

    class Config:
        from_attributes = True

class RecurringSummaryOut(BaseModel):
    total_monthly_recurring: float
    subscription_count: int
    recurring_items: List[RecurringExpenseOut]
