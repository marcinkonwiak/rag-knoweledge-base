from typing import Annotated

from fastapi import Depends

from src.exceptions import ResourceAlreadyExistsException, ResourceNotFoundException
from src.user.repository import UserRepository, get_user_repository
from src.user.schemas import UserCreate, UserInDB


class UserService:
    def __init__(self, user_repository: UserRepository):
        self.user_repository = user_repository

    async def get_by_id(self, user_id: int) -> UserInDB:
        user = await self.user_repository.get_by_id(user_id)
        if not user:
            raise ResourceNotFoundException()
        return user

    async def get_by_azure_id(self, azure_id: str) -> UserInDB:
        user = await self.user_repository.get_by_azure_id(azure_id)
        if not user:
            raise ResourceNotFoundException()
        return user

    async def get_all(self, skip: int = 0, limit: int = 100) -> list[UserInDB]:
        return await self.user_repository.get_all(skip=skip, limit=limit)

    async def create(self, user_in: UserCreate) -> UserInDB:
        if await self.user_repository.get_by_azure_id(user_in.azure_id):
            raise ResourceAlreadyExistsException()

        return await self.user_repository.create(obj_in=user_in)


def get_user_service(
    user_repository: Annotated[UserRepository, Depends(get_user_repository)],
) -> UserService:
    return UserService(user_repository=user_repository)
