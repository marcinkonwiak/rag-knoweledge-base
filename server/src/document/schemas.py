from enum import Enum

from pydantic import BaseModel, ConfigDict, Field


class DocumentInDB(BaseModel):
    id: int
    title: str
    content: str | None
    created_by_id: int | None

    model_config = ConfigDict(from_attributes=True)


class DocumentRead(BaseModel):
    id: int
    title: str
    content: str | None

    model_config = ConfigDict(extra="ignore")


class DocumentInput(BaseModel):
    title: str = Field(min_length=1, max_length=255)
    content: str | None = Field(default=None, max_length=10000)


class DocumentChatRole(str, Enum):
    USER = "user"
    AI = "ai"


class DocumentChatHistoryItem(BaseModel):
    role: DocumentChatRole
    content: str = Field(min_length=1, max_length=10000)


class DocumentChatInput(BaseModel):
    query: str = Field(min_length=1, max_length=10000)
    history: list[DocumentChatHistoryItem] = Field(default_factory=list)
