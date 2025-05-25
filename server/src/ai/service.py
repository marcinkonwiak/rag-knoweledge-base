from google.genai import Client
from google.genai.types import EmbedContentConfig

from src.settings import settings


class AiService:
    client: Client

    def __init__(self, client: Client):
        self.client = client

    def generate_embeddings(self, title: str, content: str) -> list[float] | None:
        response = self.client.models.embed_content(
            model="gemini-embedding-exp-03-07",
            contents=content,
            config=EmbedContentConfig(title=title, task_type="RETRIEVAL_DOCUMENT"),
        )

        if response.embeddings and len(response.embeddings) > 0:
            embedding = response.embeddings[0]
            if embedding.values:
                return embedding.values

        return None


def get_ai_service() -> AiService:
    client = Client(api_key=settings.GEMINI_API_KEY)

    return AiService(client=client)
