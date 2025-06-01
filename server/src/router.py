from fastapi import APIRouter, Security

from src.auth import azure_user
from src.document.views import router as document_router
from src.speech_to_text.views import router as speech_to_text_router
from src.user.views import router as user_router

router = APIRouter(
    prefix="/api",
    dependencies=[Security(azure_user)],
)


router.include_router(user_router, prefix="/users", tags=["users"])
router.include_router(document_router, prefix="/documents", tags=["documents"])
router.include_router(speech_to_text_router, prefix="/speech-to-text", tags=["speech-to-text"])
