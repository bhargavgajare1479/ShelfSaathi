from datetime import datetime
from typing import Optional

from pydantic import BaseModel


class InventoryItemResponse(BaseModel):
    id: str
    store_id: str
    product_id: str
    product_name: str
    brand: Optional[str] = None
    barcode: Optional[str] = None
    unit: str
    quantity_on_hand: float
    updated_at: datetime


class StockMovementResponse(BaseModel):
    id: str
    store_id: str
    product_id: str
    product_name: str
    invoice_id: Optional[str] = None
    movement_type: str
    quantity_delta: float
    reference_key: Optional[str] = None
    created_at: datetime

