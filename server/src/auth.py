from typing import Annotated

from fastapi import Depends, HTTPException, Security
from fastapi_azure_auth import SingleTenantAzureAuthorizationCodeBearer
from fastapi_azure_auth.user import User as AzureUser

from src.exceptions import ResourceNotFoundException
from src.settings import settings
from src.user.schemas import UserCreate, UserInDB
from src.user.service import UserService, get_user_service

azure_scheme = SingleTenantAzureAuthorizationCodeBearer(
    app_client_id=settings.APP_CLIENT_ID,
    tenant_id=settings.TENANT_ID,
    scopes=settings.SCOPES,
)


async def azure_user(
    azure_user: Annotated[AzureUser, Security(azure_scheme)],
    user_service: Annotated[UserService, Depends(get_user_service)],
) -> UserInDB:
    if not azure_user or not azure_user.oid:
        raise HTTPException(
            status_code=401,
            detail="User not authenticated",
        )

    try:
        user = await user_service.get_user_by_azure_id(azure_user.oid)
    except ResourceNotFoundException:
        user = await user_service.create_user(
            UserCreate(azure_id=azure_user.oid, name=azure_user.name)
        )

    return user
