from src.core.logger import logger

from .producer import create_kafka_producer


async def get_kafka_producer():
    producer = create_kafka_producer()
    await producer.start()
    logger.debug("Starting Kafka producer...")
    try:
        yield producer
    finally:
        logger.debug("Stopping Kafka producer...")
        await producer.stop()
