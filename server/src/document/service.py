from typing import Annotated

from fastapi import Depends

from src.document.repository import DocumentRepository, get_document_repository
from src.document.schemas import DocumentRead
from src.exceptions import ResourceNotFoundException


class DocumentService:
    def __init__(self, document_repository: DocumentRepository):
        self.document_repository = document_repository

    async def get_document(self, document_id: int) -> DocumentRead:
        doc = await self.document_repository.get_by_id(document_id)
        if not doc:
            raise ResourceNotFoundException()
        return doc

    async def get_documents(
        self, skip: int = 0, limit: int = 100
    ) -> list[DocumentRead]:
        return await self.document_repository.get_all(skip=skip, limit=limit)


def get_document_service(
    document_repository: Annotated[
        DocumentRepository, Depends(get_document_repository)
    ],
) -> DocumentService:
    return DocumentService(document_repository=document_repository)
