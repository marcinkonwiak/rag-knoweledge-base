from fastapi import APIRouter, Security

from src.auth import azure_user
from src.user.views import router as user_router

router = APIRouter(
    prefix="/api",
    dependencies=[Security(azure_user)],
)


router.include_router(user_router, prefix="/users", tags=["users"])
