import asyncio
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.exceptions import HTTPException, RequestValidationError
from fastapi.responses import JSONResponse
from starlette.middleware.cors import CORSMiddleware

from src.core.config import settings
from src.core.exception import CustomException
from src.core.kafka.consumer import consume, create_kafka_consumer
from src.core.kafka.enums import KafkaTopic
from src.core.logger import logger
from src.router import router


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Lifespan context manager for the FastAPI application.
    """
    loop = asyncio.get_event_loop()
    consumer = create_kafka_consumer(
        [str(KafkaTopic.EXTRACT_DOCUMENT.value)], loop=loop
    )
    task = asyncio.create_task(consume(consumer))
    try:
        yield
    except asyncio.CancelledError:
        logger.error("Lifespan task cancelled")
        pass
    except Exception as e:
        logger.error(f"Error in lifespan: {e}")
    finally:
        await consumer.stop()
        task.cancel()


app = FastAPI()

if settings.all_cors_origins:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.all_cors_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )


@app.exception_handler(CustomException)
def custom_exception_handler(request: Request, exc: CustomException):
    return JSONResponse(
        status_code=exc.code,
        content={"message": exc.message, "error_code": exc.error_code},
    )


@app.exception_handler(HTTPException)
async def custom_http_exception_handler(request: Request, exc: HTTPException):
    return JSONResponse(
        status_code=exc.status_code,
        content={"message": f"Oops! {exc.detail}"},
    )


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    body = None
    if request.headers.get("content-type") == "application/json":
        try:
            body = await request.json()
        except:  # noqa: E722
            body = None

    human_errors = []

    for err in exc.errors():
        loc = err.get("loc", [])
        field = ".".join(str(i) for i in loc[1:])  # ignore "body"
        message = err.get("msg")

        invalid_value = None
        if body and len(loc) == 2:
            invalid_value = body.get(loc[1], None)

        # --- Create human readable msg ---
        if message == "field required":
            readable = f"The field '{field}' is required."
        else:
            readable = f"The field '{field}' is invalid: {message}."
            if invalid_value is not None:
                readable += f" You provided: {repr(invalid_value)}."

        human_errors.append(readable)

    return JSONResponse(
        status_code=422,
        content={
            "success": False,
            "error": "Unable to process this request. Invalid parameters found.",
            "type": "RequestValidationError",
            "details": human_errors,
        },
    )


app.include_router(router, prefix="/api")
