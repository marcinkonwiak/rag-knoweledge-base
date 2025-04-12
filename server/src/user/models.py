from sqlalchemy import Column, DateTime, Integer, String
from sqlalchemy.sql import func

from src.database.core import Base


class User(Base):
    __tablename__ = "usr"

    id = Column(Integer, primary_key=True, index=True)
    azure_ad_id = Column(String(36), unique=True, index=True, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    full_name = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
