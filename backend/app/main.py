from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.router import api_v1_router
from app.core.config import get_settings
from app.core.errors import RequestIdMiddleware, register_error_handlers
from app.core.logging import logger, setup_logging


@asynccontextmanager
async def lifespan(app: FastAPI):
    setup_logging()
    logger.info("ShelfSaathi FastAPI service starting up [env=%s]", get_settings().APP_ENV)
    yield
    logger.info("ShelfSaathi FastAPI service shutting down")


def create_app() -> FastAPI:
    """Create and configure the FastAPI modular monolith application."""
    settings = get_settings()

    app = FastAPI(
        title="ShelfSaathi API",
        description="Mobile-first AI operating assistant for kirana stores and small retailers",
        version="0.1.0",
        docs_url="/docs" if settings.APP_ENV != "production" else None,
        redoc_url="/redoc" if settings.APP_ENV != "production" else None,
        lifespan=lifespan,
    )

    # 1. Attach Request ID Middleware
    app.add_middleware(RequestIdMiddleware)

    # 2. Configure CORS
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # 3. Register Standard Error Handlers
    register_error_handlers(app)

    # 4. Operational Endpoints (API.md Section 4.1)
    @app.get("/health", tags=["Operational"])
    async def health_check():
        """Liveness check confirming the backend process is running."""
        return {"status": "ok"}

    @app.get("/ready", tags=["Operational"])
    async def readiness_check():
        """Readiness check confirming dependencies and server readiness."""
        return {"status": "ready"}

    # 5. Mount API v1 Modular Router
    app.include_router(api_v1_router, prefix=settings.API_V1_PREFIX)

    return app


app = create_app()

