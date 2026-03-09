from contextlib import contextmanager
from uuid import UUID

import pymupdf
from celery.signals import worker_process_init

from celery import Task
from src.core.dependencies import get_database_session
from src.core.logger import logger
from src.models.enums import FileProcessingStatus

from .app import app
from .worker_context import ctx


@contextmanager
def db_session():
    gen = get_database_session()
    session = next(gen)

    try:
        yield session
    finally:
        session.close()
        try:
            next(gen)
        except StopIteration:
            pass


@worker_process_init.connect
def init_worker(**kwargs):
    ctx.initialize()


class BaseTask(Task):
    def on_failure(self, exc: Exception, task_id, args, kwargs, einfo):
        try:
            if self.name == "parse_document":
                file_id, knowledge_base_id = args
            elif self.name == "store_embeddings":
                _, file_id, knowledge_base_id = args
            else:
                return

            if ctx.loop is None:
                raise Exception(f"Event loop not initialized.")

            if ctx.kafka_producer is None:
                raise Exception(f"Kafka Producer not initialized.")

            if ctx.vector_db is None:
                raise Exception(f"Vector DB not initialized.")

            with db_session() as session:
                knowledge_base_controller = ctx.factory.get_knowledge_base_controller(
                    db_session=session,
                    vector_db=ctx.vector_db,
                    kafka_producer=ctx.kafka_producer,
                )
                ctx.loop.run_until_complete(
                    knowledge_base_controller.change_knowledge_base_file_status(
                        knowledge_base_id=knowledge_base_id,
                        file_id=file_id,
                        status=FileProcessingStatus.FAILED,
                        error=str(exc),
                    )
                )

        except Exception as hook_error:
            # Prevent Celery worker crash if hook fails
            logger.error(f"Failure hook error: {hook_error}")


@app.task(name="parse_document", base=BaseTask)
def parse_document(file_id: UUID, knowledge_base_id: UUID):
    if ctx.loop is None:
        raise Exception(f"Event loop not initialized.")

    if ctx.kafka_producer is None:
        raise Exception(f"Kafka Producer not initialized.")

    if ctx.vector_db is None:
        raise Exception(f"Vector DB not initialized.")

    with db_session() as session:
        file_controller = ctx.factory.get_file_controller(db_session=session)
        knowledge_base_controller = ctx.factory.get_knowledge_base_controller(
            db_session=session,
            vector_db=ctx.vector_db,
            kafka_producer=ctx.kafka_producer,
        )
        file = file_controller.get_by_id(file_id)
        file_path = file_controller._get_local_file_path(file.filename)

        if not file_path.exists():
            raise Exception(f"File {file_path} does not exists")

        ctx.loop.run_until_complete(
            knowledge_base_controller.change_knowledge_base_file_status(
                knowledge_base_id, file_id, FileProcessingStatus.EXTRACTING
            )
        )

        doc = pymupdf.open(file_path.resolve())

        ctx.loop.run_until_complete(
            knowledge_base_controller.change_knowledge_base_file_status(
                knowledge_base_id, file_id, FileProcessingStatus.EXTRACTED
            )
        )

        pages: list[str] = [page.get_text() for page in doc]  # type: ignore
        result = chr(12).join(pages)

        doc.close()

        return result


@app.task(name="store_embeddings", base=BaseTask)
def store_embeddings(content: str, file_id: UUID, knowledge_base_id: UUID):
    if ctx.loop is None:
        raise Exception(f"Event loop not initialized.")

    if ctx.kafka_producer is None:
        raise Exception(f"Kafka Producer not initialized.")

    if ctx.vector_db is None:
        raise Exception(f"Vector DB not initialized.")

    with db_session() as session:
        knowledge_base_controller = ctx.factory.get_knowledge_base_controller(
            db_session=session,
            vector_db=ctx.vector_db,
            kafka_producer=ctx.kafka_producer,
        )
        knowledge_base = knowledge_base_controller.get_by_id(knowledge_base_id)

        ctx.loop.run_until_complete(
            knowledge_base_controller.change_knowledge_base_file_status(
                knowledge_base_id, file_id, FileProcessingStatus.EMBEDDING
            )
        )

        knowledge_base_controller.vector_service.remove_file_from_vector_store(
            knowledge_base.vector_store_name, "file_id", file_id.hex
        )
        knowledge_base_controller.vector_service.ingest_document(
            content,
            knowledge_base.vector_store_name,
            metadata={
                "file_id": file_id.hex,
                "knowledge_base_id": knowledge_base_id.hex,
            },
        )

        ctx.loop.run_until_complete(
            knowledge_base_controller.change_knowledge_base_file_status(
                knowledge_base_id, file_id, FileProcessingStatus.COMPLETED
            )
        )
