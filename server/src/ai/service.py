from llama_index.core import Document, Settings, StorageContext, VectorStoreIndex
from llama_index.embeddings.google_genai import GoogleGenAIEmbedding
from llama_index.llms.google_genai import GoogleGenAI
from llama_index.vector_stores.postgres import PGVectorStore
from sqlalchemy import make_url

from src.settings import settings

# Settings.llm = GoogleGenAI()
# Settings.embed_model = GoogleGenAIEmbedding()


class AiService:
    def generate_embedding(self, text: str) -> ...:
        Settings.llm = GoogleGenAI()
        Settings.embed_model = GoogleGenAIEmbedding()

        doc = Document(text=text)
        url = make_url(settings.DATABASE_URL)
        vector_store = PGVectorStore.from_params(
            database=url.database,
            host=url.host,
            password=url.password,
            port=url.port.__str__(),
            user=url.username,
            table_name="document",
            embed_dim=768,
            hnsw_kwargs={
                "hnsw_m": 16,
                "hnsw_ef_construction": 64,
                "hnsw_ef_search": 40,
                "hnsw_dist_method": "vector_cosine_ops",
            },
        )

        storage_context = StorageContext.from_defaults(vector_store=vector_store)
        # vector_index = VectorStoreIndex.from_documents(
        #     [doc],
        #     storage_context=storage_context,
        #     show_progress=True,
        # )
        index = VectorStoreIndex.from_vector_store(
            vector_store, storage_context=storage_context
        )
        qe = index.as_query_engine(llm=GoogleGenAI())
        print(qe.query("What is the capital of France?"))


def get_ai_service() -> AiService:
    return AiService()
