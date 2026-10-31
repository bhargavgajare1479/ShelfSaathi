import uuid
from typing import Optional

from fastapi import APIRouter, Depends, Path, Query, status
from sqlalchemy import or_, select
from sqlalchemy.orm import Session

from app.api.dependencies import get_current_store, get_db, get_request_id, require_store_role
from app.core.errors import ConflictException, NotFoundException
from app.core.security import StoreContext, StoreRole
from app.db.models import Inventory, Product, StockMovement
from app.schemas.catalogue import ProductCreateRequest, ProductResponse, ProductUpdateRequest
from app.schemas.common import PaginatedResponse, PaginationMeta, SuccessResponse

router = APIRouter(prefix="/stores/{store_id}/products", tags=["Catalogue & Products"])
legacy_router = APIRouter(prefix="/products", tags=["Catalogue Legacy"])


def _serialize_product(prod: Product, inv: Optional[Inventory] = None) -> ProductResponse:
    if inv:
        qty = float(inv.quantity_on_hand)
    elif prod.inventory:
        qty = float(prod.inventory.quantity_on_hand)
    else:
        qty = 0.0

    return ProductResponse(
        id=str(prod.id),
        store_id=str(prod.store_id),
        name=prod.name,
        brand=prod.brand,
        barcode=prod.barcode,
        unit=prod.unit,
        pack_size=prod.pack_size,
        quantity_on_hand=qty,
        created_at=prod.created_at,
        updated_at=prod.updated_at,
    )


@router.get("", response_model=PaginatedResponse[ProductResponse])
async def list_products(
    store_id: str = Path(..., description="Store UUID"),
    search: Optional[str] = Query(None, description="Optional search by name, brand, or barcode"),
    limit: int = Query(50, ge=1, le=100),
    context: StoreContext = Depends(get_current_store),
    db: Session = Depends(get_db),
    request_id: str = Depends(get_request_id),
):
    """List and search catalogue products within an authorized store."""
    store_uuid = uuid.UUID(context.store_id)
    inv_match = (Inventory.product_id == Product.id) & (Inventory.store_id == Product.store_id)
    stmt = (
        select(Product, Inventory)
        .outerjoin(Inventory, inv_match)
        .where(Product.store_id == store_uuid)
    )

    if search:
        term = f"%{search.strip()}%"
        stmt = stmt.where(
            or_(
                Product.name.ilike(term),
                Product.brand.ilike(term),
                Product.barcode.ilike(term),
            )
        )

    stmt = stmt.order_by(Product.name.asc()).limit(limit)
    rows = db.execute(stmt).all()
    data = [_serialize_product(p, inv) for p, inv in rows]

    return PaginatedResponse(
        data=data,
        pagination=PaginationMeta(limit=limit, next_cursor=None),
        request_id=request_id,
    )


@router.post(
    "",
    status_code=status.HTTP_201_CREATED,
    response_model=SuccessResponse[ProductResponse],
)
async def create_product(
    store_id: str = Path(..., description="Store UUID"),
    payload: ProductCreateRequest = ...,
    context: StoreContext = Depends(require_store_role(StoreRole.STAFF)),
    db: Session = Depends(get_db),
    request_id: str = Depends(get_request_id),
):
    """Add a new product to the store catalogue with opening inventory level."""
    store_uuid = uuid.UUID(context.store_id)

    if payload.barcode:
        existing = db.scalars(
            select(Product).where(
                Product.store_id == store_uuid,
                Product.barcode == payload.barcode.strip(),
            )
        ).first()
        if existing:
            raise ConflictException(f"Barcode '{payload.barcode}' already exists: {existing.name}")

    new_prod = Product(
        store_id=store_uuid,
        name=payload.name.strip(),
        brand=payload.brand.strip() if payload.brand else None,
        barcode=payload.barcode.strip() if payload.barcode else None,
        unit=payload.unit.strip().lower() if payload.unit else "piece",
        pack_size=payload.pack_size,
    )
    db.add(new_prod)
    db.flush()

    inv = Inventory(
        store_id=store_uuid,
        product_id=new_prod.id,
        quantity_on_hand=payload.initial_stock,
    )
    db.add(inv)

    if payload.initial_stock > 0:
        movement = StockMovement(
            store_id=store_uuid,
            product_id=new_prod.id,
            movement_type="manual_adjustment",
            quantity_delta=payload.initial_stock,
            reference_key=f"opening_stock_{new_prod.id}",
        )
        db.add(movement)

    db.commit()
    db.refresh(new_prod)
    db.refresh(inv)

    return SuccessResponse(data=_serialize_product(new_prod, inv), request_id=request_id)


@router.get("/{product_id}", response_model=SuccessResponse[ProductResponse])
async def get_product(
    store_id: str = Path(..., description="Store UUID"),
    product_id: str = Path(..., description="Product UUID"),
    context: StoreContext = Depends(get_current_store),
    db: Session = Depends(get_db),
    request_id: str = Depends(get_request_id),
):
    """Retrieve details and stock level for a catalogue product."""
    try:
        p_uuid = uuid.UUID(product_id)
        store_uuid = uuid.UUID(context.store_id)
    except ValueError:
        raise NotFoundException("Product not found") from None

    inv_match = (Inventory.product_id == Product.id) & (Inventory.store_id == Product.store_id)
    row = db.execute(
        select(Product, Inventory)
        .outerjoin(Inventory, inv_match)
        .where(Product.store_id == store_uuid, Product.id == p_uuid)
    ).first()

    if not row:
        raise NotFoundException("Product not found in this store")

    prod, inv = row
    return SuccessResponse(data=_serialize_product(prod, inv), request_id=request_id)


@router.patch("/{product_id}", response_model=SuccessResponse[ProductResponse])
async def update_product(
    store_id: str = Path(..., description="Store UUID"),
    product_id: str = Path(..., description="Product UUID"),
    payload: ProductUpdateRequest = ...,
    context: StoreContext = Depends(require_store_role(StoreRole.STAFF)),
    db: Session = Depends(get_db),
    request_id: str = Depends(get_request_id),
):
    """Update catalogue product attributes."""
    try:
        p_uuid = uuid.UUID(product_id)
        store_uuid = uuid.UUID(context.store_id)
    except ValueError:
        raise NotFoundException("Product not found") from None

    prod = db.scalars(
        select(Product).where(Product.store_id == store_uuid, Product.id == p_uuid)
    ).first()
    if not prod:
        raise NotFoundException("Product not found")

    if payload.barcode is not None and payload.barcode.strip() != (prod.barcode or ""):
        existing = db.scalars(
            select(Product).where(
                Product.store_id == store_uuid,
                Product.barcode == payload.barcode.strip(),
                Product.id != p_uuid,
            )
        ).first()
        if existing:
            raise ConflictException(f"Barcode '{payload.barcode}' is in use by {existing.name}")
        prod.barcode = payload.barcode.strip() if payload.barcode.strip() else None

    if payload.name is not None:
        prod.name = payload.name.strip()
    if payload.brand is not None:
        prod.brand = payload.brand.strip() if payload.brand.strip() else None
    if payload.unit is not None:
        prod.unit = payload.unit.strip().lower()
    if payload.pack_size is not None:
        prod.pack_size = payload.pack_size

    db.commit()
    db.refresh(prod)

    inv = db.scalars(
        select(Inventory).where(Inventory.store_id == store_uuid, Inventory.product_id == p_uuid)
    ).first()

    return SuccessResponse(data=_serialize_product(prod, inv), request_id=request_id)


@router.delete("/{product_id}", response_model=SuccessResponse[dict])
async def delete_product(
    store_id: str = Path(..., description="Store UUID"),
    product_id: str = Path(..., description="Product UUID"),
    context: StoreContext = Depends(require_store_role(StoreRole.OWNER)),
    db: Session = Depends(get_db),
    request_id: str = Depends(get_request_id),
):
    """Delete a product from the catalogue. Restricted to Store Owners."""
    try:
        p_uuid = uuid.UUID(product_id)
        store_uuid = uuid.UUID(context.store_id)
    except ValueError:
        raise NotFoundException("Product not found") from None

    prod = db.scalars(
        select(Product).where(Product.store_id == store_uuid, Product.id == p_uuid)
    ).first()
    if not prod:
        raise NotFoundException("Product not found")

    db.delete(prod)
    db.commit()

    return SuccessResponse(data={"deleted": True, "product_id": product_id}, request_id=request_id)
