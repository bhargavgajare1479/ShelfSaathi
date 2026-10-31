from typing import Optional

from pydantic import BaseModel, Field


class ReorderSuggestionItem(BaseModel):
    product_id: str
    product_name: str
    brand: Optional[str] = None
    barcode: Optional[str] = None
    unit: str = "piece"
    quantity_on_hand: float
    daily_sales_rate: float
    days_of_stock_remaining: float
    reorder_threshold_days: float = 5.0
    suggested_reorder_quantity: float
    estimated_unit_cost: Optional[float] = None
    estimated_total_cost: Optional[float] = None
    urgency: str = Field(..., description="'critical', 'warning', or 'healthy'")
    explanation: str
    data_source: str = Field(
        default="sample_baseline",
        description="'real_sales' or 'sample_baseline'",
    )


class CreatePODraftFromSuggestionsRequest(BaseModel):
    items: list[dict] = Field(
        ...,
        description="List of items: [{'product_id': '...', 'quantity': 10.0, 'unit_cost': 55.0}]",
    )
