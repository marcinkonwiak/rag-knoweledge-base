from typing import Annotated

from fastapi import APIRouter, Depends, Query

from src.ai.service import AiService, get_ai_service
from src.database.core import DbSession
from src.document.schemas import DocumentInDB, DocumentInput
from src.document.service import DocumentService, get_document_service

router = APIRouter()


@router.get("/chat")
async def chat(
    ai_service: Annotated[AiService, Depends(get_ai_service)],
    session: DbSession,
    query: str,
) -> str:
    return await ai_service.chat(query, db_session=session)


@router.get("/{document_id}")
async def get_document(
    document_id: int,
    document_service: Annotated[DocumentService, Depends(get_document_service)],
) -> DocumentInDB:
    return await document_service.get_by_id(document_id=document_id)


@router.get("/")
async def get_documents(
    document_service: Annotated[DocumentService, Depends(get_document_service)],
    skip: Annotated[int, Query(ge=0)] = 0,
    limit: Annotated[int, Query(ge=1, le=100)] = 100,
) -> list[DocumentInDB]:
    return await document_service.get_all(skip=skip, limit=limit)


@router.post("/")
async def create_document(
    document_service: Annotated[DocumentService, Depends(get_document_service)],
    document: DocumentInput,
) -> DocumentInDB:
    return await document_service.create(document=document)


@router.patch("/{document_id}")
async def update_document(
    document_id: int,
    document_service: Annotated[DocumentService, Depends(get_document_service)],
    document: DocumentInput,
) -> DocumentInDB:
    return await document_service.update(document_id=document_id, document=document)


@router.delete("/{document_id}")
async def delete_document(
    document_id: int,
    document_service: Annotated[DocumentService, Depends(get_document_service)],
) -> None:
    await document_service.delete(document_id=document_id)
