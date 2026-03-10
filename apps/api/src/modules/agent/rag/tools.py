from langchain.tools import ToolRuntime, tool
from langchain_core.runnables import RunnableConfig

from .context import Context
from .schema import RetrievedDocumentChunk


@tool(response_format="content_and_artifact")
def retrieve_context(query: str, config: RunnableConfig, runtime: ToolRuntime[Context]):
    """Retrieve information to help answer a query."""
    knowledge_base = runtime.context.knowledge_base_controller.get_by_id(
        runtime.context.knowledge_base_id
    )
    result = runtime.context.knowledge_base_controller.vector_service.search(
        query, collection_name=knowledge_base.vector_store_name
    )
    retrieved_documents: list[RetrievedDocumentChunk] = [
        RetrievedDocumentChunk(
            file=runtime.context.file_controller.get_by_id(doc.file_id),
            score=doc.score,
            text=doc.chunk,
        )
        for doc in result
    ]

    serialized = "\n\n".join(
        (f"Source: {doc.file.original_filename}\nContent: {doc.text}")
        for doc in retrieved_documents
    )
    return serialized, [item.model_dump(mode="json") for item in retrieved_documents]
