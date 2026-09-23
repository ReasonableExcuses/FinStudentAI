from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from ..database import Base

class Forecast(Base):
    __tablename__ = "forecasts"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    period = Column(String, nullable=False)  # "2026-10"
    category = Column(String, default="Total")  # "Total" or specific category
    predicted_amount = Column(Float, nullable=False)
    lower_bound = Column(Float, nullable=True)
    upper_bound = Column(Float, nullable=True)
    method = Column(String, default="Weighted Moving Average + Linear Trend")
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="forecasts")
