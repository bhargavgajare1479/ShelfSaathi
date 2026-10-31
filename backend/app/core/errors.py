import uuid
from typing import Optional

from fastapi import FastAPI, Request, status
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware

from app.core.logging import logger
from app.schemas.common import ErrorDetail, ErrorPayload, ErrorResponse


class AppException(Exception):
    """Base application exception with status code and machine-readable error code."""

    def __init__(
        self,
        code: str,
        message: str,
        status_code: int = status.HTTP_400_BAD_REQUEST,
        details: Optional[list[ErrorDetail]] = None,
    ):
        super().__init__(message)
        self.code = code
        self.message = message
        self.status_code = status_code
        self.details = details


class NotFoundException(AppException):
    def __init__(
        self,
        message: str = "Resource not found",
        details: Optional[list[ErrorDetail]] = None,
    ):
        super().__init__(
            code="NOT_FOUND",
            message=message,
            status_code=status.HTTP_404_NOT_FOUND,
            details=details,
        )


class UnauthorizedException(AppException):
    def __init__(self, message: str = "Missing or invalid authentication token"):
        super().__init__(
            code="UNAUTHORIZED",
            message=message,
            status_code=status.HTTP_401_UNAUTHORIZED,
        )


class ForbiddenException(AppException):
    def __init__(self, message: str = "You do not have permission to access this resource"):
        super().__init__(
            code="FORBIDDEN",
            message=message,
            status_code=status.HTTP_403_FORBIDDEN,
        )


class ConflictException(AppException):
    def __init__(self, message: str = "The operation conflicts with current resource state"):
        super().__init__(
            code="CONFLICT",
            message=message,
            status_code=status.HTTP_409_CONFLICT,
        )


class RequestIdMiddleware(BaseHTTPMiddleware):
    """Middleware attaching request_id to request state and response headers."""

    async def dispatch(self, request: Request, call_next):
        request_id = request.headers.get("X-Request-ID") or f"req_{uuid.uuid4().hex[:12]}"
        request.state.request_id = request_id

        response = await call_next(request)
        response.headers["X-Request-ID"] = request_id
        return response


def register_error_handlers(app: FastAPI) -> None:
    """Register custom exception handlers with FastAPI application."""

    @app.exception_handler(AppException)
    async def app_exception_handler(request: Request, exc: AppException):
        request_id = getattr(request.state, "request_id", f"req_{uuid.uuid4().hex[:12]}")
        error_resp = ErrorResponse(
            error=ErrorPayload(
                code=exc.code,
                message=exc.message,
                details=exc.details,
            ),
            request_id=request_id,
        )
        return JSONResponse(
            status_code=exc.status_code,
            content=error_resp.model_dump(),
        )

    @app.exception_handler(RequestValidationError)
    async def validation_exception_handler(request: Request, exc: RequestValidationError):
        request_id = getattr(request.state, "request_id", f"req_{uuid.uuid4().hex[:12]}")
        details = [
            ErrorDetail(
                field=".".join(str(loc) for loc in err["loc"] if loc != "body"),
                issue=err["msg"],
            )
            for err in exc.errors()
        ]
        error_resp = ErrorResponse(
            error=ErrorPayload(
                code="VALIDATION_ERROR",
                message="The request contains invalid fields.",
                details=details,
            ),
            request_id=request_id,
        )
        return JSONResponse(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            content=error_resp.model_dump(),
        )

    @app.exception_handler(Exception)
    async def unhandled_exception_handler(request: Request, exc: Exception):
        request_id = getattr(request.state, "request_id", f"req_{uuid.uuid4().hex[:12]}")
        logger.exception("Unhandled server error: %s [request_id=%s]", str(exc), request_id)
        error_resp = ErrorResponse(
            error=ErrorPayload(
                code="INTERNAL_SERVER_ERROR",
                message="An unexpected server error occurred. Please try again later.",
            ),
            request_id=request_id,
        )
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content=error_resp.model_dump(),
        )
