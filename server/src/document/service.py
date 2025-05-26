from collections.abc import AsyncGenerator
from typing import Annotated

from fastapi import Depends
from pydantic_ai.messages import (
    ModelMessage,
    ModelRequest,
    ModelResponse,
    TextPart,
    UserPromptPart,
)

from src.ai.service import AiService, get_ai_service
from src.document.repository import DocumentRepository, get_document_repository
from src.document.schemas import (
    DocumentChatInput,
    DocumentChatRole,
    DocumentInDB,
    DocumentInput,
)
from src.exceptions import ResourceNotFoundException


class DocumentService:
    def __init__(
        self,
        document_repository: DocumentRepository,
        ai_service: AiService,
    ):
        self.document_repository = document_repository
        self.ai_service = ai_service

    async def get_by_id(self, document_id: int) -> DocumentInDB:
        doc = await self.document_repository.get_by_id(document_id)
        if not doc:
            raise ResourceNotFoundException()
        return doc

    async def get_all(self, skip: int = 0, limit: int = 100) -> list[DocumentInDB]:
        return await self.document_repository.get_all(skip=skip, limit=limit)

    async def create(self, document: DocumentInput) -> DocumentInDB:
        doc = await self.document_repository.create(obj_in=document)
        doc = await self.generate_embeddings(document_id=doc.id)

        return doc

    async def update(self, document_id: int, document: DocumentInput) -> DocumentInDB:
        doc = await self.document_repository.update(id=document_id, obj_in=document)
        if doc is None:
            raise ResourceNotFoundException()

        doc = await self.generate_embeddings(document_id=document_id)

        return doc

    async def generate_embeddings(self, document_id: int) -> DocumentInDB:
        doc = await self.document_repository.get_by_id(document_id)
        if not doc:
            raise ResourceNotFoundException()

        if doc.content and doc.title:
            embeddings = self.ai_service.generate_embeddings(doc.title, doc.content)
            if embeddings is None:
                raise ValueError("Failed to generate embeddings for the document.")

            doc = await self.document_repository.update_embeddings(
                id=document_id, vector=embeddings
            )
            assert doc is not None

        return doc

    async def delete(self, document_id: int) -> None:
        doc = await self.document_repository.delete(id=document_id)
        if doc is None:
            raise ResourceNotFoundException()
        return None

    async def chat(self, chat_in: DocumentChatInput) -> AsyncGenerator[bytes]:
        pydantic_history: list[ModelMessage] = []
        for message in chat_in.history:
            if message.role == DocumentChatRole.USER:
                pydantic_history.append(
                    ModelRequest(
                        parts=[
                            UserPromptPart(
                                content=message.content,
                            )
                        ]
                    )
                )
            elif message.role == DocumentChatRole.AI:
                pydantic_history.append(
                    ModelResponse(
                        parts=[TextPart(content=message.content)],
                    )
                )

        return await self.ai_service.chat(
            content=chat_in.query, message_history=pydantic_history
        )


def get_document_service(
    document_repository: Annotated[
        DocumentRepository, Depends(get_document_repository)
    ],
    ai_service: Annotated[AiService, Depends(get_ai_service)],
) -> DocumentService:
    return DocumentService(
        document_repository=document_repository,
        ai_service=ai_service,
    )
