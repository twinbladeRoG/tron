import json

from aiokafka import AIOKafkaProducer

from src.core.config import settings


def create_kafka_producer():
    """
    Create a Kafka producer that sends messages to the specified topic.
    """
    producer = AIOKafkaProducer(
        bootstrap_servers=",".join(settings.KAFKA_BROKERS),
        value_serializer=lambda m: json.dumps(m).encode("ascii"),
    )

    return producer
