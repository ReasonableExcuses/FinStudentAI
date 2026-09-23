from sqlalchemy import Column, Integer, String, Float, DateTime, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from ..database import Base

class RecurringExpense(Base):
    __tablename__ = "recurring_expenses"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    merchant = Column(String, nullable=False)
    category = Column(String, default="Subscriptions")
    amount = Column(Float, nullable=False)
    frequency = Column(String, default="Monthly")  # Monthly, Weekly, Daily, Yearly
    occurrences = Column(Integer, default=1)
    last_detected = Column(DateTime, default=datetime.utcnow)
    confidence = Column(Float, default=0.95)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="recurring_expenses")
