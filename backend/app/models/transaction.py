from sqlalchemy import Column, Integer, String, Float, DateTime, Boolean, ForeignKey, Text
from sqlalchemy.orm import relationship
from datetime import datetime
from ..database import Base

class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    date = Column(DateTime, nullable=False, index=True)
    description = Column(String, nullable=False)
    amount = Column(Float, nullable=False)
    type = Column(String, nullable=False, default="expense")  # expense / income

    # AI Categorization & Tracking
    ai_category = Column(String, nullable=True)
    final_category = Column(String, nullable=False)  # User can override
    ai_confidence = Column(Float, default=1.0)
    classification_reason = Column(String, nullable=True)

    # Anomaly Detection
    anomaly_score = Column(Float, default=0.0)
    is_anomaly = Column(Boolean, default=False)
    anomaly_reason = Column(String, nullable=True)

    # Recurring & Meta
    merchant_normalized = Column(String, nullable=True)
    is_recurring = Column(Boolean, default=False)
    payment_method = Column(String, default="UPI")  # UPI, Cash, Card, NetBanking
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationship
    user = relationship("User", back_populates="transactions")
