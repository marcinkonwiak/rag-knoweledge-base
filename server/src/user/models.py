import datetime
from typing import TYPE_CHECKING

from sqlalchemy import DateTime, String
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.sql import func

from src.database.core import Base

if TYPE_CHECKING:
    from src.document.models import Document


class User(Base):
    __tablename__ = "usr"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    azure_ad_id: Mapped[str] = mapped_column(String(36), unique=True, index=True)
    email: Mapped[str] = mapped_column(String, unique=True)
    full_name: Mapped[str] = mapped_column(nullable=True)
    created_at: Mapped[datetime.datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
    updated_at: Mapped[datetime.datetime] = mapped_column(
        DateTime(timezone=True), onupdate=func.now()
    )

    documents: Mapped[list["Document"]] = relationship(back_populates="created_by")
