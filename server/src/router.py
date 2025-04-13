from fastapi import APIRouter

from src.user.views import router as user_router

router = APIRouter(prefix="/api")


router.include_router(user_router, prefix="/users", tags=["users"])
