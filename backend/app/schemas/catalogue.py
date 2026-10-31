from datetime import datetime
from decimal import Decimal
from typing import Optional

from pydantic import BaseModel, Field


class ProductBase(BaseModel):
    name: str = Field(min_length=1, max_length=200, description="Product title")
    brand: Optional[str] = Field(None, max_length=100, description="Brand name")
    barcode: Optional[str] = Field(None, max_length=50, description="Barcode")
    unit: str = Field(default="piece", max_length=30, description="Base stock unit")
    pack_size: Optional[Decimal] = Field(None, gt=0, description="Pack quantity")


class ProductCreateRequest(ProductBase):
    initial_stock: Decimal = Field(
        default=Decimal("0.0"),
        ge=0,
        description="Optional opening stock quantity",
    )


class ProductUpdateRequest(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=200)
    brand: Optional[str] = Field(None, max_length=100)
    barcode: Optional[str] = Field(None, max_length=50)
    unit: Optional[str] = Field(None, max_length=30)
    pack_size: Optional[Decimal] = Field(None, gt=0)


class ProductResponse(ProductBase):
    id: str
    store_id: str
    quantity_on_hand: float = 0.0
    created_at: datetime
    updated_at: datetime
