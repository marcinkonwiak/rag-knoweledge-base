from google.genai import Client
from google.genai.types import EmbedContentConfig
from pydantic_ai.messages import ModelMessage
from sqlalchemy.ext.asyncio import AsyncSession

from src.ai.embeddings_agent import Deps, agent
from src.database.core import DbSession
from src.settings import settings


class AiService:
    client: Client

    def __init__(self, client: Client, session: AsyncSession):
        self.client = client
        self.session = session

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

    async def chat(
        self, content: str, message_history: list[ModelMessage] | None = None
    ) -> str:
        if message_history is None:
            message_history = []

        deps = Deps(google_client=self.client, db=self.session)
        res = await agent.run(
            f"{content}",
            deps=deps,
            message_history=message_history,
        )
        return res.output


def get_ai_service(
    session: DbSession,
) -> AiService:
    client = Client(api_key=settings.GEMINI_API_KEY)

    return AiService(client=client, session=session)
