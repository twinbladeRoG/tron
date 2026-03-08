import asyncio

from aiokafka import AIOKafkaProducer

from src.core.dependencies import get_vector_database
from src.core.factory.factory import Factory
from src.core.kafka.dependencies import initialize_kafka_producer


class WorkerContext:
    kafka_producer: AIOKafkaProducer | None = None
    loop: asyncio.AbstractEventLoop | None = None
    vector_db = None
    factory = Factory()

    def initialize(self):
        self.loop = asyncio.new_event_loop()
        asyncio.set_event_loop(self.loop)

        self.kafka_producer = self.loop.run_until_complete(initialize_kafka_producer())

        self.vector_db = get_vector_database()


ctx = WorkerContext()
