from typing import Any
from uuid import uuid4

from langchain_text_splitters import RecursiveCharacterTextSplitter
from qdrant_client import QdrantClient
from qdrant_client.models import (
    Distance,
    FieldCondition,
    Filter,
    MatchValue,
    PointStruct,
    VectorParams,
)

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
        logger.debug(f"Text is splitted into {len(texts)} segments")
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

    def get_count_of_points_from_collection(
        self, collection_name: str, key: str, value: str
    ):
        collection_exists = self.vector_db.collection_exists(
            collection_name=collection_name
        )
        if collection_exists == False:
            return 0

        results = self.vector_db.count(
            collection_name=collection_name,
            count_filter=Filter(
                must=[FieldCondition(key=key, match=MatchValue(value=value))]
            ),
        )

        logger.debug(
            f'Found {results} points for collection: "{collection_name}" for key: {key}'
        )

        return results.count

    def remove_file_from_vector_store(self, collection_name: str, key: str, value: str):
        count = self.get_count_of_points_from_collection(collection_name, key, value)

        if count == 0:
            return None

        result = self.vector_db.delete(
            collection_name=collection_name,
            points_selector=Filter(
                must=[FieldCondition(key=key, match=MatchValue(value=value))]
            ),
        )

        logger.debug(
            f'Removed points for collection: "{collection_name}" for key: {key}, with status: "{result.status}"'
        )

        return result.status

    def ingest_document(
        self, content: str, collection_name: str, *, metadata: dict[str, Any]
    ):
        chunk_size = self.embedding_service.get_embedding_size(
            provider="fastembed", model_name="BAAI/bge-small-en"
        )

        self.initialize_vector_collection(collection_name, vector_size=chunk_size)

        chunks = self.split_content(content, chunk_size=chunk_size)
        embedding = self.embedding_service.create_embedding(
            chunks, provider="fastembed", model_name="BAAI/bge-small-en"
        )

        for _, (chunk, embedding) in enumerate(zip(chunks, embedding.data)):
            self.vector_db.upload_points(
                collection_name=collection_name,
                points=[
                    PointStruct(
                        id=uuid4().hex,
                        vector=embedding.embedding,
                        payload={"chunk": chunk, **metadata},
                    )
                ],
            )

    def remove_vector_collection(self, collection_name: str):
        collection_exists = self.vector_db.collection_exists(
            collection_name=collection_name
        )

        if collection_exists is False:
            logger.debug(f"Collection {collection_name} is not found")
            return None

        result = self.vector_db.delete_collection(collection_name)

        if result is False:
            logger.debug(f"Collection {collection_name} is removed successfully")

        return result
