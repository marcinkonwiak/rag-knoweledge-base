from typing import Annotated

from fastapi import APIRouter, Depends, Query, Security

from src.auth import azure_user
from src.document.schemas import DocumentRead
from src.document.service import DocumentService, get_document_service

router = APIRouter()


@router.get("/{document_id}", dependencies=[Security(azure_user)])
async def get_document(
    document_id: int,
    document_service: Annotated[DocumentService, Depends(get_document_service)],
) -> DocumentRead:
    return await document_service.get_document(document_id=document_id)


@router.get("/", dependencies=[Security(azure_user)])
async def get_documents(
    document_service: Annotated[DocumentService, Depends(get_document_service)],
    skip: Annotated[int, Query(ge=0)] = 0,
    limit: Annotated[int, Query(ge=1, le=100)] = 100,
) -> list[DocumentRead]:
    return await document_service.get_documents(skip=skip, limit=limit)
