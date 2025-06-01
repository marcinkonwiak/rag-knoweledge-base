from pydantic import BaseModel, Field

class SpeechToTextResponse(BaseModel):
    text: str = Field(description="Transcribed text from the audio")
    confidence: float | None = Field(default=None, description="Confidence score of the transcription")