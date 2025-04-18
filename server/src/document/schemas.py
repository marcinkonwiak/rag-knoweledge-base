from pydantic import BaseModel, Field


class DocumentRead(BaseModel):
    id: int
    title: str
    content: str | None
    created_by_id: int | None

    class Config:
        from_attributes = True


class DocumentCreate(BaseModel):
    title: str = Field(min_length=1, max_length=255)


class DocumentUpdate(BaseModel):
    title: str = Field(min_length=1, max_length=255)
    content: str | None = Field(default=None, max_length=10000)
