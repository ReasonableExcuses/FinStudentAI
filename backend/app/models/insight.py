from sqlalchemy import Column, Integer, String, DateTime, Boolean, ForeignKey, Text
from sqlalchemy.orm import relationship
from datetime import datetime
from ..database import Base

class Insight(Base):
    __tablename__ = "insights"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    type = Column(String, nullable=False)  # "trend", "anomaly", "budget_risk", "recurring", "saving"
    title = Column(String, nullable=False)
    description = Column(Text, nullable=False)
    supporting_data = Column(Text, nullable=True)  # JSON-encoded string of structured facts
    severity = Column(String, default="normal")  # "normal", "attention", "warning", "positive"
    category = Column(String, nullable=True)
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="insights")
