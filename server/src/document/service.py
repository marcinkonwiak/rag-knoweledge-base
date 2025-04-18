from typing import Annotated

from fastapi import Depends, HTTPException, status

from src.document.repository import DocumentRepository, get_document_repository
from src.document.schemas import DocumentRead


class DocumentService:
    def __init__(self, document_repository: DocumentRepository):
        self.document_repository = document_repository

    async def get_document(self, document_id: int) -> DocumentRead:
        doc = await self.document_repository.get_by_id(document_id)
        if not doc:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Document not found"
            )
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
