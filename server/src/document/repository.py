from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from src.database.core import DbSession
from src.document.models import Document
from src.document.schemas import DocumentCreate, DocumentRead, DocumentUpdate


class DocumentRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def get_by_id(self, id: int) -> DocumentRead | None:
        doc = await self.session.get(DocumentRead, id)
        if doc:
            return DocumentRead.model_validate(doc)

        return None

    async def get_all(self, *, skip: int = 0, limit: int = 100) -> list[DocumentRead]:
        query = select(Document).order_by(Document.id).offset(skip).limit(limit)
        result = await self.session.execute(query)
        docs = result.scalars().all()
        return [DocumentRead.model_validate(doc) for doc in docs]

    async def create(self, *, obj_in: DocumentCreate) -> DocumentRead:
        doc = Document(**obj_in.model_dump())
        self.session.add(doc)
        await self.session.commit()
        await self.session.refresh(doc)
        return DocumentRead.model_validate(doc)

    async def update(self, *, id: int, obj_in: DocumentUpdate) -> DocumentRead | None:
        doc = await self.session.get(Document, id)
        if not doc:
            return None

        update_data = obj_in.model_dump(exclude_unset=True)

        for field, value in update_data.items():
            setattr(doc, field, value)

        self.session.add(doc)
        await self.session.commit()
        await self.session.refresh(doc)
        return DocumentRead.model_validate(doc)

    async def delete(self, *, id: int) -> DocumentRead | None:
        doc = await self.session.get(Document, id)
        if not doc:
            return None

        await self.session.delete(doc)
        await self.session.commit()
        return DocumentRead.model_validate(doc)


def get_document_repository(
    session: DbSession,
) -> DocumentRepository:
    return DocumentRepository(session=session)
