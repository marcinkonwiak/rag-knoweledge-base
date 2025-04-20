from typing import Annotated

from fastapi import Depends

from src.document.repository import DocumentRepository, get_document_repository
from src.document.schemas import DocumentCreate, DocumentInDB
from src.exceptions import ResourceNotFoundException


class DocumentService:
    def __init__(self, document_repository: DocumentRepository):
        self.document_repository = document_repository

    async def get_by_id(self, document_id: int) -> DocumentInDB:
        doc = await self.document_repository.get_by_id(document_id)
        if not doc:
            raise ResourceNotFoundException()
        return doc

    async def get_all(self, skip: int = 0, limit: int = 100) -> list[DocumentInDB]:
        return await self.document_repository.get_all(skip=skip, limit=limit)

    async def create(self, document: DocumentCreate) -> DocumentInDB:
        return await self.document_repository.create(obj_in=document)


def get_document_service(
    document_repository: Annotated[
        DocumentRepository, Depends(get_document_repository)
    ],
) -> DocumentService:
    return DocumentService(document_repository=document_repository)
