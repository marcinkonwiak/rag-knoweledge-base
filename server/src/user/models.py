import datetime
from typing import TYPE_CHECKING
from uuid import UUID

from sqlalchemy import DateTime, String
from sqlalchemy.dialects.postgresql import UUID as PSQLUUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.sql import func

from src.database.core import Base

if TYPE_CHECKING:
    from src.document.models import Document


class User(Base):
    __tablename__ = "usr"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    azure_id: Mapped[UUID] = mapped_column(
        PSQLUUID(as_uuid=True), unique=True, index=True, nullable=True
    )
    email: Mapped[str] = mapped_column(String, unique=True, nullable=True)
    name: Mapped[str] = mapped_column(nullable=True)
    created_at: Mapped[datetime.datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
    updated_at: Mapped[datetime.datetime] = mapped_column(
        DateTime(timezone=True), onupdate=func.now(), nullable=True
    )

    documents: Mapped[list["Document"]] = relationship(back_populates="created_by")
