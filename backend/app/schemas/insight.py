from pydantic import BaseModel
from typing import Optional, Any
from datetime import datetime

class InsightOut(BaseModel):
    id: int
    type: str  # "trend", "anomaly", "budget_risk", "recurring", "saving"
    title: str
    description: str
    supporting_data: Optional[Any] = None  # Parsed JSON object
    severity: str  # "normal", "attention", "warning", "positive"
    category: Optional[str] = None
    is_read: bool
    created_at: datetime

    class Config:
        from_attributes = True

class QARequest(BaseModel):
    question: str

class QAResponse(BaseModel):
    question: str
    answer: str
    intent: str
    structured_data: Optional[Any] = None
    supporting_chart_type: Optional[str] = None
    supporting_chart_data: Optional[Any] = None
    disclaimer: str = "FinStudent AI provides educational insights based on recorded data and does not provide financial advice."
