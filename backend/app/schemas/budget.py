from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class BudgetBase(BaseModel):
    category: str
    month: str  # "YYYY-MM"
    amount: float = Field(..., gt=0)

class BudgetCreate(BudgetBase):
    pass

class BudgetUpdate(BaseModel):
    amount: float = Field(..., gt=0)

class BudgetOut(BudgetBase):
    id: int
    user_id: int
    created_at: datetime

    class Config:
        from_attributes = True

class BudgetProgressOut(BaseModel):
    id: Optional[int] = None
    category: str
    month: str
    budget_amount: float
    spent_amount: float
    remaining_amount: float
    usage_percentage: float
    status: str  # "normal", "attention", "near_limit", "over_budget"
    projected_spend: Optional[float] = None
    is_projected_over: bool = False
    projection_alert: Optional[str] = None
