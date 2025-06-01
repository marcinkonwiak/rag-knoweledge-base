from pydantic import BaseModel, Field


class SpeechToTextRequest(BaseModel):
    language: str = Field(default="en-US", description="Language code for speech recognition")


class SpeechToTextResponse(BaseModel):
    text: str = Field(description="Transcribed text from the audio")
    confidence: float | None = Field(default=None, description="Confidence score of the transcription")