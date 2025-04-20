from typing import Annotated

from fastapi import APIRouter, Depends, Query

from src.user.schemas import UserInDB
from src.user.service import UserService, get_user_service

router = APIRouter()


@router.get("/{user_id}")
async def get_user(
    user_id: int, user_service: Annotated[UserService, Depends(get_user_service)]
) -> UserInDB:
    return await user_service.get_by_id(user_id=user_id)


@router.get("/")
async def get_users(
    user_service: Annotated[UserService, Depends(get_user_service)],
    skip: Annotated[int, Query(ge=0)] = 0,
    limit: Annotated[int, Query(ge=1, le=100)] = 100,
) -> list[UserInDB]:
    return await user_service.get_all(skip=skip, limit=limit)
