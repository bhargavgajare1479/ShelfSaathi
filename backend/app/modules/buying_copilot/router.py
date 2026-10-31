import math
import uuid
from decimal import Decimal
from typing import Optional

from fastapi import APIRouter, Depends, Path, Query, status
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.api.dependencies import get_current_store, get_db, get_request_id, require_store_role
from app.core.errors import ValidationException
from app.core.security import StoreContext, StoreRole
from app.db.models import (
    Inventory,
    InvoiceLine,
    Product,
    PurchaseOrderDraft,
    PurchaseOrderLine,
    SalesRecord,
)
from app.schemas.buying_copilot import CreatePODraftFromSuggestionsRequest, ReorderSuggestionItem
from app.schemas.common import SuccessResponse
from app.schemas.purchase_orders import PurchaseOrderDraftResponse, PurchaseOrderLineSchema

router = APIRouter(prefix="/stores/{store_id}/reorder-suggestions", tags=["Buying Copilot"])
legacy_router = APIRouter(prefix="/reorder-suggestions", tags=["Buying Copilot Legacy"])


@router.get("", response_model=SuccessResponse[list[ReorderSuggestionItem]])
async def get_reorder_suggestions(
    store_id: str = Path(..., description="Store UUID"),
    urgency_filter: Optional[str] = Query(
        None, description="Filter by 'critical', 'warning', or 'all'"
    ),
    context: StoreContext = Depends(get_current_store),
    db: Session = Depends(get_db),
    request_id: str = Depends(get_request_id),
):
    """
    Return explainable reorder suggestions based on deterministic stock velocity.
    Conforms to PRD Section 3.4 and Table 3.4.
    """
    store_uuid = uuid.UUID(context.store_id)

    inv_match = (Inventory.product_id == Product.id) & (Inventory.store_id == Product.store_id)
    stmt = (
        select(Product, Inventory)
        .outerjoin(Inventory, inv_match)
        .where(Product.store_id == store_uuid)
    )
    rows = db.execute(stmt).all()

    suggestions: list[ReorderSuggestionItem] = []

    for prod, inv in rows:
        qty = float(inv.quantity_on_hand) if inv else 0.0

        sales_stmt = select(
            func.coalesce(func.sum(SalesRecord.quantity_sold), 0),
            func.count(SalesRecord.id),
        ).where(SalesRecord.store_id == store_uuid, SalesRecord.product_id == prod.id)
        total_sold, sales_count = db.execute(sales_stmt).first()

        cost_stmt = (
            select(InvoiceLine.unit_cost)
            .where(InvoiceLine.product_id == prod.id, InvoiceLine.unit_cost.isnot(None))
            .order_by(InvoiceLine.created_at.desc())
            .limit(1)
        )
        recent_cost = db.scalars(cost_stmt).first()
        est_unit_cost = float(recent_cost) if recent_cost else None

        if sales_count > 0 and float(total_sold) > 0:
            daily_rate = round(float(total_sold) / 30.0, 2)
            data_source = "real_sales"
        else:
            daily_rate = 1.2
            data_source = "sample_baseline"

        safety_days = 5.0
        target_days = 14.0

        if qty <= 0:
            days_remaining = 0.0
            urgency = "critical"
            suggested_qty = math.ceil(target_days * daily_rate)
            explanation = (
                f"Item is completely OUT OF STOCK (0 {prod.unit}). "
                f"Reordering {suggested_qty} {prod.unit} secures a {int(target_days)}-day supply."
            )
        else:
            days_remaining = round(qty / daily_rate, 1)
            if days_remaining <= 2.0:
                urgency = "critical"
                suggested_qty = math.ceil((target_days - days_remaining) * daily_rate)
                explanation = (
                    f"Critically low stock! Current stock ({qty:g} {prod.unit}) covers "
                    f"~{days_remaining} days. Below {int(safety_days)}-day safety threshold. "
                    f"Suggested reorder: {suggested_qty} {prod.unit}."
                )
            elif days_remaining <= safety_days:
                urgency = "warning"
                suggested_qty = math.ceil((target_days - days_remaining) * daily_rate)
                explanation = (
                    f"Current stock ({qty:g} {prod.unit}) covers ~{days_remaining} days. "
                    f"Approaching {int(safety_days)}-day safety threshold. "
                    f"Recommended restock: {suggested_qty} {prod.unit}."
                )
            else:
                urgency = "healthy"
                suggested_qty = 0.0
                explanation = (
                    f"Stock is healthy ({qty:g} {prod.unit}, ~{days_remaining} days remaining). "
                    f"No immediate reorder necessary."
                )

        if urgency_filter and urgency_filter != "all" and urgency != urgency_filter:
            continue

        est_total = (
            round(suggested_qty * est_unit_cost, 2)
            if est_unit_cost and suggested_qty > 0
            else None
        )

        suggestions.append(
            ReorderSuggestionItem(
                product_id=str(prod.id),
                product_name=prod.name,
                brand=prod.brand,
                barcode=prod.barcode,
                unit=prod.unit,
                quantity_on_hand=qty,
                daily_sales_rate=daily_rate,
                days_of_stock_remaining=days_remaining,
                reorder_threshold_days=safety_days,
                suggested_reorder_quantity=suggested_qty,
                estimated_unit_cost=est_unit_cost,
                estimated_total_cost=est_total,
                urgency=urgency,
                explanation=explanation,
                data_source=data_source,
            )
        )

    urgency_order = {"critical": 0, "warning": 1, "healthy": 2}
    suggestions.sort(key=lambda s: (urgency_order.get(s.urgency, 3), s.days_of_stock_remaining))

    return SuccessResponse(data=suggestions, request_id=request_id)


@router.post(
    "/create-po",
    status_code=status.HTTP_201_CREATED,
    response_model=SuccessResponse[PurchaseOrderDraftResponse],
)
async def create_po_from_suggestions(
    store_id: str = Path(..., description="Store UUID"),
    payload: CreatePODraftFromSuggestionsRequest = ...,
    context: StoreContext = Depends(require_store_role(StoreRole.STAFF)),
    db: Session = Depends(get_db),
    request_id: str = Depends(get_request_id),
):
    """
    Generate an editable Purchase Order Draft directly from approved suggestions.
    Conforms to PRD Section 4.5.
    """
    store_uuid = uuid.UUID(context.store_id)

    if not payload.items:
        raise ValidationException("At least one product item must be selected to create a draft")

    draft = PurchaseOrderDraft(
        store_id=store_uuid,
        status="draft",
    )
    db.add(draft)
    db.flush()

    total_amount = 0.0
    lines_data = []

    for item in payload.items:
        p_uuid = uuid.UUID(item["product_id"])
        prod = db.scalars(
            select(Product).where(Product.store_id == store_uuid, Product.id == p_uuid)
        ).first()
        if not prod:
            continue

        raw_qty = float(item.get("quantity", 1))
        if raw_qty <= 0:
            continue

        raw_cost = item.get("unit_cost")
        unit_cost_dec = Decimal(str(raw_cost)) if raw_cost is not None else None

        line = PurchaseOrderLine(
            purchase_order_draft_id=draft.id,
            product_id=prod.id,
            quantity=Decimal(str(raw_qty)),
            unit_cost=unit_cost_dec,
        )
        db.add(line)
        db.flush()

        line_tot = float(unit_cost_dec * Decimal(str(raw_qty))) if unit_cost_dec else None
        if line_tot:
            total_amount += line_tot

        lines_data.append(
            PurchaseOrderLineSchema(
                id=str(line.id),
                product_id=str(prod.id),
                product_name=prod.name,
                brand=prod.brand,
                barcode=prod.barcode,
                unit=prod.unit,
                quantity=raw_qty,
                unit_cost=float(unit_cost_dec) if unit_cost_dec is not None else None,
                line_total=line_tot,
            )
        )

    db.commit()
    db.refresh(draft)

    return SuccessResponse(
        data=PurchaseOrderDraftResponse(
            id=str(draft.id),
            store_id=str(draft.store_id),
            status=draft.status,
            total_items=len(lines_data),
            total_estimated_amount=round(total_amount, 2) if total_amount > 0 else None,
            lines=lines_data,
            created_at=draft.created_at,
            updated_at=draft.updated_at,
        ),
        request_id=request_id,
    )
