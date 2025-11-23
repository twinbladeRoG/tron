from celery.utils.log import get_task_logger

from celery import Celery
from src.core.config import settings

logger = get_task_logger(__name__)

app = Celery(
    __name__,
    broker=settings.REDIS_URL,
    backend=settings.CELERY_BACKEND_URI,
)

app.conf.task_track_started = True
app.conf.result_extended = True
app.conf.database_create_tables_at_setup = True
