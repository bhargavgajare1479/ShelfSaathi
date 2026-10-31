from datetime import datetime
from decimal import Decimal
from typing import Optional

from pydantic import BaseModel, Field


class PurchaseOrderLineSchema(BaseModel):
    id: str
    product_id: str
    product_name: str
    brand: Optional[str] = None
    barcode: Optional[str] = None
    unit: str = "piece"
    quantity: float
    unit_cost: Optional[float] = None
    line_total: Optional[float] = None


class PurchaseOrderDraftResponse(BaseModel):
    id: str
    store_id: str
    status: str
    total_items: int
    total_estimated_amount: Optional[float] = None
    lines: list[PurchaseOrderLineSchema] = []
    created_at: datetime
    updated_at: datetime


class CreatePurchaseOrderLineRequest(BaseModel):
    product_id: str
    quantity: Decimal = Field(gt=0)
    unit_cost: Optional[Decimal] = Field(None, ge=0)


class CreatePurchaseOrderDraftRequest(BaseModel):
    lines: list[CreatePurchaseOrderLineRequest] = []


class UpdatePurchaseOrderDraftRequest(BaseModel):
    status: Optional[str] = Field(None, description="'draft' or 'cancelled'")
    lines: Optional[list[CreatePurchaseOrderLineRequest]] = None

