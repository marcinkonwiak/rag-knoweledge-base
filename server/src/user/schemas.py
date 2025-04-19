from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field


class UserInDB(BaseModel):
    id: int
    azure_id: UUID
    email: str | None
    name: str | None

    model_config = ConfigDict(from_attributes=True)


class UserRead(BaseModel):
    id: int
    email: str | None
    name: str | None

    model_config = ConfigDict(extra="ignore")


class UserCreate(BaseModel):
    azure_id: str
    name: str | None


class UserUpdate(BaseModel):
    name: str | None = Field(max_length=100)
