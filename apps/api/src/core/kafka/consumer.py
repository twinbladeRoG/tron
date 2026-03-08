import asyncio
import json
from datetime import datetime
from pprint import pprint

from aiokafka import AIOKafkaConsumer

from celery import chain
from src.celery.tasks import parse_document, store_embeddings
from src.core.config import settings
from src.core.kafka.enums import KafkaTopic
from src.core.logger import logger
from src.modules.knowledge_base.schema import ExtractPayload


def create_kafka_consumer(
    *topic: str, loop: asyncio.AbstractEventLoop | None = None
) -> AIOKafkaConsumer:
    """
    Create a Kafka consumer that consumes messages from the specified topic.
    """
    consumer = AIOKafkaConsumer(
        *topic,
        bootstrap_servers=",".join(settings.KAFKA_BROKERS),
        loop=loop,
    )

    return consumer


async def consume(consumer: AIOKafkaConsumer):
    """
    Consume messages from the Kafka topic.
    """
    await consumer.start()
    logger.info("Kafka consumer started")
    try:
        async for message in consumer:
            timestamp = datetime.now().strftime("%I:%M%p")
            logger.info(f"[{timestamp}] Received message from topic: {message.topic}")
            value = json.loads(message.value.decode("utf-8"))  # type: ignore
            pprint(value)  # noqa: T203

            match message.topic:
                case KafkaTopic.EXTRACT_DOCUMENT.value:
                    try:
                        payload = ExtractPayload.model_validate(value)

                        for file_id in payload.file_ids:
                            workflow = chain(
                                parse_document.s(file_id, payload.knowledge_base_id),  # type: ignore
                                store_embeddings.s(file_id, payload.knowledge_base_id),  # type: ignore
                            )
                            workflow.apply_async()
                    except Exception as e:
                        logger.error(
                            f"Error processing message from topic ({message.topic}): {e}\n"
                            f"Payload: {value}"
                        )

    except asyncio.CancelledError as e:
        await consumer.stop()
    finally:
        await consumer.stop()
