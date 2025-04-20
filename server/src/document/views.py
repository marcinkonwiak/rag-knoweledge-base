from typing import Annotated

from fastapi import APIRouter, Depends, Query

from src.document.schemas import DocumentCreate, DocumentInDB
from src.document.service import DocumentService, get_document_service

router = APIRouter()


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
    document: DocumentCreate,
) -> DocumentInDB:
    return await document_service.create(document=document)
