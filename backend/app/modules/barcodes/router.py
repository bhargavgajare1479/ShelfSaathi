import random
import time
import uuid

from fastapi import APIRouter, Depends, Path, Query
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.dependencies import get_current_store, get_db, get_request_id
from app.core.security import StoreContext
from app.db.models import Inventory, Product
from app.integrations.open_food_facts import open_food_facts_client
from app.schemas.common import SuccessResponse

router = APIRouter(prefix="/stores/{store_id}/barcodes", tags=["Barcodes & Labels"])
legacy_router = APIRouter(prefix="/barcodes", tags=["Barcodes Legacy"])


def _generate_unique_barcode(store_uuid: uuid.UUID, db: Session) -> str:
    """Generate an internal store barcode (Code128 compatible prefix '20...')."""
    for _ in range(20):
        ts_part = str(int(time.time()))[-6:]
        rand_part = f"{random.randint(1000, 9999)}"
        candidate = f"20{ts_part}{rand_part}"

        existing = db.scalars(
            select(Product.id).where(Product.store_id == store_uuid, Product.barcode == candidate)
        ).first()
        if not existing:
            return candidate

    return f"20{uuid.uuid4().int % 10000000000:010d}"


@router.get("/lookup", response_model=SuccessResponse[dict])
async def lookup_barcode(
    store_id: str = Path(..., description="Store UUID"),
    barcode: str = Query(..., min_length=1, max_length=50, description="Barcode string"),
    context: StoreContext = Depends(get_current_store),
    db: Session = Depends(get_db),
    request_id: str = Depends(get_request_id),
):
    """
    Look up a product in the store catalogue by barcode.
    Returns product details and on-hand stock if found.
    """
    store_uuid = uuid.UUID(context.store_id)
    clean_barcode = barcode.strip()

    inv_match = (Inventory.product_id == Product.id) & (Inventory.store_id == Product.store_id)
    row = db.execute(
        select(Product, Inventory)
        .outerjoin(Inventory, inv_match)
        .where(Product.store_id == store_uuid, Product.barcode == clean_barcode)
    ).first()

    if row:
        prod, inv = row
        qty = float(inv.quantity_on_hand) if inv else 0.0
        product_data = {
            "id": str(prod.id),
            "store_id": str(prod.store_id),
            "name": prod.name,
            "brand": prod.brand,
            "barcode": prod.barcode,
            "unit": prod.unit,
            "pack_size": float(prod.pack_size) if prod.pack_size is not None else None,
            "quantity_on_hand": qty,
        }
        return SuccessResponse(
            data={
                "barcode": clean_barcode,
                "found_in_catalogue": True,
                "product": product_data,
            },
            request_id=request_id,
        )

    # If not found in catalogue, attempt external lookup via Open Food Facts
    ext_product = await open_food_facts_client.lookup(clean_barcode)

    return SuccessResponse(
        data={
            "barcode": clean_barcode,
            "found_in_catalogue": False,
            "product": None,
            "external_product": ext_product,
            "suggested_action": "register_new_product",
        },
        request_id=request_id,
    )


@router.post("/generate", response_model=SuccessResponse[dict])
async def generate_barcode(
    store_id: str = Path(..., description="Store UUID"),
    context: StoreContext = Depends(get_current_store),
    db: Session = Depends(get_db),
    request_id: str = Depends(get_request_id),
):
    """Generate a unique store-scoped barcode for unbarcoded kirana products."""
    store_uuid = uuid.UUID(context.store_id)
    new_barcode = _generate_unique_barcode(store_uuid, db)
    return SuccessResponse(
        data={"barcode": new_barcode, "format": "CODE128"},
        request_id=request_id,
    )
