from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field


class InvoiceLineResponse(BaseModel):
    id: str
    invoice_id: str
    line_number: int
    raw_description: str
    product_id: Optional[str] = None
    product_name: Optional[str] = None
    quantity: Optional[float] = None
    unit: Optional[str] = None
    unit_cost: Optional[float] = None
    line_total: Optional[float] = None
    confidence: Optional[float] = None
    review_status: str = Field(
        default="needs_review",
        description="Review state: needs_review, matched, new_product, ignored",
    )
    created_at: datetime
    updated_at: datetime


class InvoiceResponse(BaseModel):
    id: str
    store_id: str
    storage_key: str
    original_filename: Optional[str] = None
    mime_type: str
    status: str
    extraction_provider: Optional[str] = None
    extraction_error_code: Optional[str] = None
    confirmed_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime
    signed_url: Optional[str] = None
    lines: list[InvoiceLineResponse] = Field(default_factory=list)


class InvoiceLineUpdate(BaseModel):
    raw_description: Optional[str] = None
    quantity: Optional[float] = None
    unit: Optional[str] = None
    unit_cost: Optional[float] = None
    line_total: Optional[float] = None
    product_id: Optional[str] = None
    review_status: Optional[str] = Field(
        default=None,
        description="Review state: needs_review, matched, new_product, ignored",
    )

