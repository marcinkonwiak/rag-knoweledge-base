import os
import tempfile
from typing import Tuple

import azure.cognitiveservices.speech as speechsdk
import ffmpeg
from fastapi import UploadFile

from src.settings import settings


class SpeechToTextService:
    def __init__(self, speech_key: str, speech_region: str):
        self.speech_key = speech_key
        self.speech_region = speech_region

    async def _convert_to_wav(self, audio_content: bytes, original_filename: str) -> bytes:
        with tempfile.NamedTemporaryFile(delete=False, suffix=os.path.splitext(original_filename)[1]) as input_file:
            input_file.write(audio_content)
            input_path = input_file.name

        with tempfile.NamedTemporaryFile(delete=False, suffix='.wav') as output_file:
            output_path = output_file.name

        try:
            (
                ffmpeg
                .input(input_path)
                .output(output_path, acodec='pcm_s16le', ar='16000', ac=1)
                .overwrite_output()
                .run(quiet=True, capture_stdout=True, capture_stderr=True)
            )

            with open(output_path, 'rb') as f:
                wav_content = f.read()

            return wav_content
        finally:
            if os.path.exists(input_path):
                os.unlink(input_path)
            if os.path.exists(output_path):
                os.unlink(output_path)

    async def transcribe_audio(self, audio_file: UploadFile, language: str) -> Tuple[str, float | None]:
        audio_content = await audio_file.read()

        if not audio_file.filename.lower().endswith('.wav'):
            try:
                audio_content = await self._convert_to_wav(audio_content, audio_file.filename)
            except Exception as e:
                return f"Error converting audio format: {str(e)}", None

        speech_config = speechsdk.SpeechConfig(
            subscription=self.speech_key, 
            region=self.speech_region
        )

        speech_config.speech_recognition_language = language

        push_stream = speechsdk.audio.PushAudioInputStream()

        push_stream.write(audio_content)
        push_stream.close()

        audio_config = speechsdk.audio.AudioConfig(stream=push_stream)

        speech_recognizer = speechsdk.SpeechRecognizer(
            speech_config=speech_config, 
            audio_config=audio_config
        )

        result = speech_recognizer.recognize_once_async().get()

        if result.reason == speechsdk.ResultReason.RecognizedSpeech:
            confidence = None

            return result.text, confidence
        elif result.reason == speechsdk.ResultReason.NoMatch:
            return "No speech could be recognized.", None
        elif result.reason == speechsdk.ResultReason.Canceled:
            cancellation_details = speechsdk.CancellationDetails(result)
            if cancellation_details.reason == speechsdk.CancellationReason.Error:
                return f"Error: {cancellation_details.error_details}", None
            else:
                return "Recognition canceled.", None

        return "Unknown error occurred.", None


def get_speech_to_text_service() -> SpeechToTextService:
    return SpeechToTextService(
        speech_key=settings.AZURE_SPEECH_KEY,
        speech_region=settings.AZURE_SPEECH_REGION
    )
