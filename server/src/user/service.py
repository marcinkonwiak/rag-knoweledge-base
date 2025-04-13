from typing import Annotated

from fastapi import Depends, HTTPException, status

from src.user.repository import UserRepository, get_user_repository
from src.user.schemas import UserRead


class UserService:
    def __init__(
        self, user_repository: Annotated[UserRepository, Depends(get_user_repository)]
    ):
        self.user_repository = user_repository

    async def get_user(self, user_id: int) -> UserRead:
        user = await self.user_repository.get_by_id(user_id)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="User not found"
            )
        return user

    async def get_users(self, skip: int = 0, limit: int = 100) -> list[UserRead]:
        return await self.user_repository.get_all(skip=skip, limit=limit)


def get_user_service(
    user_repository: Annotated[UserRepository, Depends(get_user_repository)],
) -> UserService:
    return UserService(user_repository=user_repository)
