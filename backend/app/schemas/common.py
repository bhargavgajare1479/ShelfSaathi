from typing import Generic, Optional, TypeVar

from pydantic import BaseModel, Field

DataT = TypeVar("DataT")


class PaginationMeta(BaseModel):
    limit: int = Field(default=25, description="Number of items returned")
    next_cursor: Optional[str] = Field(default=None, description="Cursor for next page")


class SuccessResponse(BaseModel, Generic[DataT]):
    """Standard single-resource response envelope."""

    data: DataT
    request_id: str = Field(description="Unique request correlation identifier")


class PaginatedResponse(BaseModel, Generic[DataT]):
    """Standard paginated collection response envelope."""

    data: list[DataT]
    pagination: PaginationMeta
    request_id: str = Field(description="Unique request correlation identifier")


class ErrorDetail(BaseModel):
    field: Optional[str] = Field(default=None, description="Field name with validation error")
    issue: str = Field(description="Machine-readable issue identifier")


class ErrorPayload(BaseModel):
    code: str = Field(description="Machine-readable error code")
    message: str = Field(description="Safe human-readable error description")
    details: Optional[list[ErrorDetail]] = Field(
        default=None,
        description="Optional field-level validation details",
    )


class ErrorResponse(BaseModel):
    """Standard error response envelope conforming to API.md."""

    error: ErrorPayload
    request_id: str = Field(description="Unique request correlation identifier")
