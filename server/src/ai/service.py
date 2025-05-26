from collections.abc import AsyncGenerator

from google.genai import Client
from google.genai.types import EmbedContentConfig
from pydantic_ai.messages import ModelMessage
from sqlalchemy.ext.asyncio import AsyncSession

from src.ai.embeddings_agent import Deps, agent
from src.ai.events import AgentDelta, AgentDone
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
    ) -> AsyncGenerator[bytes]:
        if message_history is None:
            message_history = []

        deps = Deps(google_client=self.client, db=self.session)

        async def stream() -> AsyncGenerator[bytes]:
            async with agent.run_stream(
                f"Search query: `{content}`",
                message_history=message_history,
                deps=deps,
            ) as result:
                async for text in result.stream_text(delta=True):
                    delta_event = AgentDelta(v=text)
                    yield delta_event.to_sse()

                done_event = AgentDone()
                yield done_event.to_sse()

        return stream()


def get_ai_service(
    session: DbSession,
) -> AiService:
    client = Client(api_key=settings.GEMINI_API_KEY)

    return AiService(client=client, session=session)
