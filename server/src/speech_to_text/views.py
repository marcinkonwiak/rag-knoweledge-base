from typing import Annotated

from fastapi import APIRouter, Depends, File, Form, UploadFile

from src.speech_to_text.schemas import SpeechToTextResponse
from src.speech_to_text.service import SpeechToTextService, get_speech_to_text_service

router = APIRouter()


@router.post("/", response_model=SpeechToTextResponse)
async def speech_to_text(
    service: Annotated[SpeechToTextService, Depends(get_speech_to_text_service)],
    audio_file: UploadFile = File(...),
    language: str = Form(default="pl-PL"),
) -> SpeechToTextResponse:
    text, confidence = await service.transcribe_audio(audio_file, language)
    return SpeechToTextResponse(text=text, confidence=confidence)
