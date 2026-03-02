import asyncio
import json
from datetime import datetime
from pprint import pprint

from aiokafka import AIOKafkaConsumer

from src.core.config import settings
from src.core.logger import logger


def create_kafka_consumer(
    *topic: list[str], loop: asyncio.AbstractEventLoop | None = None
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

    except asyncio.CancelledError as e:
        await consumer.stop()
    finally:
        await consumer.stop()
