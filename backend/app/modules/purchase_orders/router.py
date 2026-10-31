import uuid

from fastapi import APIRouter, Depends, Path, Query, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.dependencies import get_current_store, get_db, get_request_id, require_store_role
from app.core.errors import NotFoundException, ValidationException
from app.core.security import StoreContext, StoreRole
from app.db.models import Product, PurchaseOrderDraft, PurchaseOrderLine
from app.schemas.common import PaginatedResponse, PaginationMeta, SuccessResponse
from app.schemas.purchase_orders import (
    CreatePurchaseOrderDraftRequest,
    PurchaseOrderDraftResponse,
    PurchaseOrderLineSchema,
    UpdatePurchaseOrderDraftRequest,
)

router = APIRouter(prefix="/stores/{store_id}/purchase-orders", tags=["Purchase Orders"])
legacy_router = APIRouter(prefix="/purchase-order-drafts", tags=["Purchase Orders Legacy"])


def _serialize_draft(draft: PurchaseOrderDraft) -> PurchaseOrderDraftResponse:
    lines_data = []
    total_amount = 0.0

    for line in draft.lines:
        prod = line.product
        q = float(line.quantity)
        c = float(line.unit_cost) if line.unit_cost is not None else None
        tot = round(q * c, 2) if c is not None else None
        if tot:
            total_amount += tot

        lines_data.append(
            PurchaseOrderLineSchema(
                id=str(line.id),
                product_id=str(line.product_id),
                product_name=prod.name if prod else "Unknown Item",
                brand=prod.brand if prod else None,
                barcode=prod.barcode if prod else None,
                unit=prod.unit if prod else "piece",
                quantity=q,
                unit_cost=c,
                line_total=tot,
            )
        )

    return PurchaseOrderDraftResponse(
        id=str(draft.id),
        store_id=str(draft.store_id),
        status=draft.status,
        total_items=len(lines_data),
        total_estimated_amount=round(total_amount, 2) if total_amount > 0 else None,
        lines=lines_data,
        created_at=draft.created_at,
        updated_at=draft.updated_at,
    )


@router.get("", response_model=PaginatedResponse[PurchaseOrderDraftResponse])
async def list_purchase_orders(
    store_id: str = Path(..., description="Store UUID"),
    limit: int = Query(25, ge=1, le=100),
    context: StoreContext = Depends(get_current_store),
    db: Session = Depends(get_db),
    request_id: str = Depends(get_request_id),
):
    """List purchase order drafts for an authorized store."""
    store_uuid = uuid.UUID(context.store_id)
    stmt = (
        select(PurchaseOrderDraft)
        .where(PurchaseOrderDraft.store_id == store_uuid)
        .order_by(PurchaseOrderDraft.created_at.desc())
        .limit(limit)
    )
    drafts = list(db.scalars(stmt).all())
    data = [_serialize_draft(d) for d in drafts]

    return PaginatedResponse(
        data=data,
        pagination=PaginationMeta(limit=limit, next_cursor=None),
        request_id=request_id,
    )


@router.post(
    "",
    status_code=status.HTTP_201_CREATED,
    response_model=SuccessResponse[PurchaseOrderDraftResponse],
)
async def create_purchase_order(
    store_id: str = Path(..., description="Store UUID"),
    payload: CreatePurchaseOrderDraftRequest = ...,
    context: StoreContext = Depends(require_store_role(StoreRole.STAFF)),
    db: Session = Depends(get_db),
    request_id: str = Depends(get_request_id),
):
    """Create a new editable purchase order draft."""
    store_uuid = uuid.UUID(context.store_id)

    draft = PurchaseOrderDraft(
        store_id=store_uuid,
        status="draft",
    )
    db.add(draft)
    db.flush()

    for item in payload.lines:
        p_uuid = uuid.UUID(item.product_id)
        prod = db.scalars(
            select(Product).where(Product.store_id == store_uuid, Product.id == p_uuid)
        ).first()
        if not prod:
            continue

        line = PurchaseOrderLine(
            purchase_order_draft_id=draft.id,
            product_id=prod.id,
            quantity=item.quantity,
            unit_cost=item.unit_cost,
        )
        db.add(line)

    db.commit()
    db.refresh(draft)

    return SuccessResponse(data=_serialize_draft(draft), request_id=request_id)


@router.get("/{draft_id}", response_model=SuccessResponse[PurchaseOrderDraftResponse])
async def get_purchase_order(
    store_id: str = Path(..., description="Store UUID"),
    draft_id: str = Path(..., description="Draft UUID"),
    context: StoreContext = Depends(get_current_store),
    db: Session = Depends(get_db),
    request_id: str = Depends(get_request_id),
):
    """Retrieve full details of a purchase order draft."""
    try:
        d_uuid = uuid.UUID(draft_id)
        store_uuid = uuid.UUID(context.store_id)
    except ValueError:
        raise NotFoundException("Purchase order draft not found") from None

    draft = db.scalars(
        select(PurchaseOrderDraft).where(
            PurchaseOrderDraft.store_id == store_uuid, PurchaseOrderDraft.id == d_uuid
        )
    ).first()
    if not draft:
        raise NotFoundException("Purchase order draft not found")

    return SuccessResponse(data=_serialize_draft(draft), request_id=request_id)


@router.patch("/{draft_id}", response_model=SuccessResponse[PurchaseOrderDraftResponse])
async def update_purchase_order(
    store_id: str = Path(..., description="Store UUID"),
    draft_id: str = Path(..., description="Draft UUID"),
    payload: UpdatePurchaseOrderDraftRequest = ...,
    context: StoreContext = Depends(require_store_role(StoreRole.STAFF)),
    db: Session = Depends(get_db),
    request_id: str = Depends(get_request_id),
):
    """Update status or lines in an existing purchase order draft."""
    try:
        d_uuid = uuid.UUID(draft_id)
        store_uuid = uuid.UUID(context.store_id)
    except ValueError:
        raise NotFoundException("Purchase order draft not found") from None

    draft = db.scalars(
        select(PurchaseOrderDraft).where(
            PurchaseOrderDraft.store_id == store_uuid, PurchaseOrderDraft.id == d_uuid
        )
    ).first()
    if not draft:
        raise NotFoundException("Purchase order draft not found")

    if payload.status:
        if payload.status not in ["draft", "cancelled"]:
            raise ValidationException("Status must be 'draft' or 'cancelled'")
        draft.status = payload.status

    if payload.lines is not None:
        # Replace existing lines with updated lines
        draft.lines.clear()
        db.flush()

        for item in payload.lines:
            p_uuid = uuid.UUID(item.product_id)
            prod = db.scalars(
                select(Product).where(Product.store_id == store_uuid, Product.id == p_uuid)
            ).first()
            if not prod:
                continue

            line = PurchaseOrderLine(
                purchase_order_draft_id=draft.id,
                product_id=prod.id,
                quantity=item.quantity,
                unit_cost=item.unit_cost,
            )
            db.add(line)

    db.commit()
    db.refresh(draft)

    return SuccessResponse(data=_serialize_draft(draft), request_id=request_id)


@router.delete("/{draft_id}", response_model=SuccessResponse[dict])
async def delete_purchase_order(
    store_id: str = Path(..., description="Store UUID"),
    draft_id: str = Path(..., description="Draft UUID"),
    context: StoreContext = Depends(require_store_role(StoreRole.OWNER)),
    db: Session = Depends(get_db),
    request_id: str = Depends(get_request_id),
):
    """Delete a purchase order draft. Restricted to Store Owners."""
    try:
        d_uuid = uuid.UUID(draft_id)
        store_uuid = uuid.UUID(context.store_id)
    except ValueError:
        raise NotFoundException("Purchase order draft not found") from None

    draft = db.scalars(
        select(PurchaseOrderDraft).where(
            PurchaseOrderDraft.store_id == store_uuid, PurchaseOrderDraft.id == d_uuid
        )
    ).first()
    if not draft:
        raise NotFoundException("Purchase order draft not found")

    db.delete(draft)
    db.commit()

    return SuccessResponse(data={"deleted": True, "draft_id": draft_id}, request_id=request_id)
