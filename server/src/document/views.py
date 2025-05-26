from typing import Annotated

from fastapi import APIRouter, Depends, Query
from starlette.responses import StreamingResponse

from src.document.schemas import DocumentChatInput, DocumentInDB, DocumentInput
from src.document.service import DocumentService, get_document_service

router = APIRouter()


@router.post("/chat")
async def chat(
    chat_in: DocumentChatInput,
    document_service: Annotated[DocumentService, Depends(get_document_service)],
) -> StreamingResponse:
    return StreamingResponse(
        await document_service.chat(chat_in), media_type="text/event-stream"  # Changed media_type
    )


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
