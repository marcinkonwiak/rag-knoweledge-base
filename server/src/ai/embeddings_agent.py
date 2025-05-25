from dataclasses import dataclass

import logfire
from google.genai import Client
from google.genai.types import EmbedContentConfig
from pydantic_ai import Agent, RunContext
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from src.document.models import Document

INSTRUCTIONS = (
    "#ROLE\n"
    "You role is to retrieve relevant sections from the "
    "documentation based on the user's query.\n\n"
    "#INSTRUCTIONS\n"
    "- You will receive a search query from the user.\n"
    "- User the 'retrieve' tool to search the documentation.\n"
    "- Always use the tool even if the query seems too broad, short or vague.\n"
    "- Respond in the user's language.\n"
    "- Retrieve only the most relevant sections of the documentation. "
    "Do not return everything\n"
)


@dataclass
class Deps:
    google_client: Client
    db: AsyncSession


agent = Agent(
    "google-gla:gemini-2.5-flash-preview-05-20",
    system_prompt=INSTRUCTIONS,
    deps_type=Deps,
)


@agent.tool
async def retrieve(context: RunContext[Deps], search_query: str) -> str:
    """Retrieve documentation sections based on a search query.

    Args:
        context: The call context.
        search_query: The search query.
    """
    with logfire.span(
        "create embedding for {search_query=}", search_query=search_query
    ):
        embedding = context.deps.google_client.models.embed_content(
            model="gemini-embedding-exp-03-07",
            contents=search_query,
            config=EmbedContentConfig(task_type="RETRIEVAL_QUERY"),
        )

    assert embedding.embeddings, "No embeddings found in response"
    assert len(embedding.embeddings) == 1, (
        f"Expected 1 embedding, got {len(embedding.embeddings)}, "
        f"doc query: {search_query!r}"
    )
    embedding_vector = embedding.embeddings[0].values

    query = (
        select(Document.title, Document.content)
        .order_by(Document.vector.cosine_distance(embedding_vector))
        .limit(5)
    )

    result = await context.deps.db.execute(query)
    rows = result.fetchall()

    return "\n\n".join(
        f"# Document: `{row.title}`\n\n```\n{row.content}\n```\n---\n" for row in rows
    )
