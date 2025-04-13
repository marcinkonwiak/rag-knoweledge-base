from typing import Annotated

from fastapi import APIRouter, Depends, Query, Security

from src.auth import azure_scheme
from src.user.schemas import UserRead
from src.user.service import UserService, get_user_service

router = APIRouter()


@router.get("/{user_id}", dependencies=[Security(azure_scheme)])
async def get_user(
    user_id: int, user_service: Annotated[UserService, Depends(get_user_service)]
) -> UserRead:
    return await user_service.get_user(user_id=user_id)


@router.get("/", dependencies=[Security(azure_scheme)])
async def get_users(
    user_service: Annotated[UserService, Depends(get_user_service)],
    skip: Annotated[int, Query(ge=0)] = 0,
    limit: Annotated[int, Query(ge=1, le=100)] = 100,
) -> list[UserRead]:
    return await user_service.get_users(skip=skip, limit=limit)
