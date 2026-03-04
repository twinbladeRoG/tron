from langchain_text_splitters import RecursiveCharacterTextSplitter
from qdrant_client import QdrantClient
from qdrant_client.models import Distance, VectorParams

from src.core.exception import NotFoundException
from src.core.logger import logger

from .embeddings import EmbeddingService


class VectorDatabaseService:
    def __init__(
        self, vector_db: QdrantClient, embedding_service: EmbeddingService
    ) -> None:
        self.vector_db = vector_db
        self.embedding_service = embedding_service

    def split_content(self, content: str, *, chunk_size: int, chunk_overlap: int = 0):
        logger.debug(
            f"Splitting text with chunk_size of {chunk_size} and chunk_overlap of {chunk_overlap}"
        )
        text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=chunk_size, chunk_overlap=chunk_overlap
        )
        texts = text_splitter.split_text(content)
        logger.debug(f"Text is splitted into f{len(texts)} segments")
        return texts

    def initialize_vector_collection(
        self,
        collection_name: str,
        *,
        vector_size: int = 1024,
        raise_if_not_found: bool = False,
    ):
        collection_exists = self.vector_db.collection_exists(
            collection_name=collection_name
        )

        if collection_exists == True:
            logger.debug(f"Collection '{collection_name}' already exists.")
        else:
            logger.debug(f"Collection '{collection_name}' does not exist. Creating it.")

            if raise_if_not_found:
                raise NotFoundException("Collection does not exists")

            self.vector_db.create_collection(
                collection_name=collection_name,
                vectors_config=VectorParams(size=vector_size, distance=Distance.COSINE),
            )
