from enum import Enum


class FileProcessingStatus(str, Enum):
    PENDING = "pending"
    EXTRACTING = "extracting"
    EXTRACTED = "extracted"
    EMBEDDING = "embedding"
    COMPLETED = "completed"
    FAILED = "failed"


class KnowledgeBaseStatus(str, Enum):
    PENDING = "pending"
    PROCESSING = "processing"
    READY = "ready"
    FAILED = "failed"
    PARTIALLY_PROCESSED = "partially-processed"
