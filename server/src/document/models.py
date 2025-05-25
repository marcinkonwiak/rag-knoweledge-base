from typing import TYPE_CHECKING

from pgvector.sqlalchemy import VECTOR
from sqlalchemy import ForeignKey, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from src.database.core import Base

if TYPE_CHECKING:
    from src.user.models import User


class Document(Base):
    __tablename__ = "document"

    id: Mapped[int] = mapped_column(primary_key=True)
    title: Mapped[str]
    content: Mapped[str] = mapped_column(Text, nullable=True)
    created_by_id: Mapped[int] = mapped_column(ForeignKey("usr.id"), nullable=True)
    created_by: Mapped["User"] = relationship(back_populates="documents")
    vector: Mapped[VECTOR] = mapped_column(VECTOR(768), nullable=True)
