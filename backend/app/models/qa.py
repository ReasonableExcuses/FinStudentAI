from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from datetime import datetime
from ..database import Base

class QAQuery(Base):
    __tablename__ = "qa_queries"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    question = Column(String, nullable=False)
    answer = Column(Text, nullable=False)
    intent = Column(String, nullable=True)
    structured_data = Column(Text, nullable=True)  # JSON-encoded calculation facts
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="qa_queries")
