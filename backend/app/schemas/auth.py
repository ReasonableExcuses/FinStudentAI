from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class UserBase(BaseModel):
    email: str
    name: str = "Alex"
    university: str = "Engineering University"
    monthly_income: float = 24000.0
    monthly_budget: float = 20000.0
    currency: str = "₹"
    student_type: str = "Hosteller"

class UserCreate(BaseModel):
    email: str
    password: str
    name: Optional[str] = "Alex"
    university: Optional[str] = "Engineering University"
    monthly_income: Optional[float] = 24000.0
    monthly_budget: Optional[float] = 20000.0
    currency: Optional[str] = "₹"
    student_type: Optional[str] = "Hosteller"

class UserLogin(BaseModel):
    email: str
    password: str

class UserUpdate(BaseModel):
    name: Optional[str] = None
    university: Optional[str] = None
    monthly_income: Optional[float] = None
    monthly_budget: Optional[float] = None
    currency: Optional[str] = None
    student_type: Optional[str] = None

class UserOut(UserBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str
    user: UserOut

class TokenData(BaseModel):
    email: Optional[str] = None
