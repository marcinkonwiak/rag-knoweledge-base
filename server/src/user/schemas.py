from pydantic import BaseModel, Field


class UserRead(BaseModel):
    id: int
    email: str
    full_name: str | None

    class Config:
        from_attributes = True


class UserCreate(BaseModel):
    azure_ad_id: str
    email: str
    full_name: str | None = Field(max_length=100)


class UserUpdate(BaseModel):
    full_name: str | None = Field(max_length=100)
