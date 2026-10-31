import uuid
from typing import Optional

from fastapi import APIRouter, Depends, Path, Query
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.dependencies import get_current_store, get_request_id
from app.core.errors import NotFoundException
from app.core.security import StoreContext
from app.db.models import Inventory, Product, StockMovement
from app.db.session import get_db
from app.schemas.common import PaginatedResponse, PaginationMeta, SuccessResponse
from app.schemas.inventory import InventoryItemResponse, StockMovementResponse

router = APIRouter(prefix="/stores/{store_id}/inventory", tags=["Inventory & Movements"])
legacy_router = APIRouter(prefix="/inventory", tags=["Inventory Legacy"])


def _build_inventory_item(inv: Inventory) -> InventoryItemResponse:
    prod = inv.product
    return InventoryItemResponse(
        id=str(inv.id),
        store_id=str(inv.store_id),
        product_id=str(inv.product_id),
        product_name=prod.name if prod else "Unknown Product",
        brand=prod.brand if prod else None,
        barcode=prod.barcode if prod else None,
        unit=prod.unit if prod else "piece",
        quantity_on_hand=float(inv.quantity_on_hand),
        updated_at=inv.updated_at,
    )


@router.get("", response_model=PaginatedResponse[InventoryItemResponse])
async def list_store_inventory(
    store_id: str = Path(..., description="Store UUID"),
    q: Optional[str] = Query(None, description="Search by product name"),
    limit: int = Query(25, ge=1, le=100),
    cursor: Optional[str] = Query(None),
    context: StoreContext = Depends(get_current_store),
    db: Session = Depends(get_db),
    request_id: str = Depends(get_request_id),
):
    """
    List current on-hand inventory levels for store products.
    Conforms to API.md Section 4.4 and ARCHITECTURE.md Section 10.
    """
    store_uuid = uuid.UUID(context.store_id)
    stmt = (
        select(Inventory)
        .join(Product, Product.id == Inventory.product_id)
        .where(Inventory.store_id == store_uuid)
    )

    if q:
        stmt = stmt.where(Product.name.ilike(f"%{q.strip()}%"))

    stmt = stmt.order_by(Product.name.asc()).limit(limit)
    items = list(db.scalars(stmt).all())
    data = [_build_inventory_item(item) for item in items]

    return PaginatedResponse(
        data=data,
        pagination=PaginationMeta(limit=limit, next_cursor=None),
        request_id=request_id,
    )


@router.get("/{product_id}", response_model=SuccessResponse[InventoryItemResponse])
async def get_product_inventory(
    store_id: str = Path(..., description="Store UUID"),
    product_id: str = Path(..., description="Product UUID"),
    context: StoreContext = Depends(get_current_store),
    db: Session = Depends(get_db),
    request_id: str = Depends(get_request_id),
):
    """Read current stock level for a specific product."""
    try:
        p_uuid = uuid.UUID(product_id)
        store_uuid = uuid.UUID(context.store_id)
    except ValueError:
        raise NotFoundException("Product not found") from None

    stmt = select(Inventory).where(
        Inventory.store_id == store_uuid,
        Inventory.product_id == p_uuid,
    )
    inv = db.scalars(stmt).first()
    if not inv:
        raise NotFoundException("Inventory record not found for product")

    return SuccessResponse(data=_build_inventory_item(inv), request_id=request_id)


@router.get("/{product_id}/movements", response_model=SuccessResponse[list[StockMovementResponse]])
async def get_product_stock_movements(
    store_id: str = Path(..., description="Store UUID"),
    product_id: str = Path(..., description="Product UUID"),
    context: StoreContext = Depends(get_current_store),
    db: Session = Depends(get_db),
    request_id: str = Depends(get_request_id),
):
    """Read audit trail of stock movements affecting a product."""
    try:
        p_uuid = uuid.UUID(product_id)
        store_uuid = uuid.UUID(context.store_id)
    except ValueError:
        raise NotFoundException("Product not found") from None

    stmt = (
        select(StockMovement)
        .where(StockMovement.store_id == store_uuid, StockMovement.product_id == p_uuid)
        .order_by(StockMovement.created_at.desc())
    )
    movements = list(db.scalars(stmt).all())
    data = [
        StockMovementResponse(
            id=str(m.id),
            store_id=str(m.store_id),
            product_id=str(m.product_id),
            product_name=m.product.name if m.product else "Unknown",
            invoice_id=str(m.invoice_id) if m.invoice_id else None,
            movement_type=m.movement_type,
            quantity_delta=float(m.quantity_delta),
            reference_key=m.reference_key,
            created_at=m.created_at,
        )
        for m in movements
    ]
    return SuccessResponse(data=data, request_id=request_id)
