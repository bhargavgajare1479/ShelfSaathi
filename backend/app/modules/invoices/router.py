import uuid
from datetime import datetime, timezone
from decimal import Decimal
from io import BytesIO
from typing import Optional

from fastapi import APIRouter, Depends, File, HTTPException, Path, Query, UploadFile
from fastapi.responses import Response
from PIL import Image
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.dependencies import get_current_store, get_request_id, require_store_role
from app.core.errors import ConflictException, NotFoundException, ValidationException
from app.core.security import StoreContext, StoreRole
from app.db.models import Inventory, Invoice, InvoiceLine, Product, StockMovement
from app.db.session import get_db
from app.integrations.storage import storage_service
from app.integrations.vision_provider import get_vision_provider
from app.modules.invoices.matching import match_line_to_catalogue
from app.schemas.common import PaginatedResponse, PaginationMeta, SuccessResponse
from app.schemas.invoices import InvoiceLineResponse, InvoiceLineUpdate, InvoiceResponse

router = APIRouter(prefix="/stores/{store_id}/invoices", tags=["Invoices & Extraction"])
preview_router = APIRouter(prefix="/invoices", tags=["Invoices Preview"])

ALLOWED_MIME_TYPES = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
    "application/pdf": "pdf",
}
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10 MB per DATABASE.md Section 9 & PRD


def _build_line_response(line: InvoiceLine) -> InvoiceLineResponse:
    product_name = line.product.name if line.product else None
    return InvoiceLineResponse(
        id=str(line.id),
        invoice_id=str(line.invoice_id),
        line_number=line.line_number,
        raw_description=line.raw_description,
        product_id=str(line.product_id) if line.product_id else None,
        product_name=product_name,
        quantity=float(line.quantity) if line.quantity is not None else None,
        unit=line.unit,
        unit_cost=float(line.unit_cost) if line.unit_cost is not None else None,
        line_total=float(line.line_total) if line.line_total is not None else None,
        confidence=float(line.confidence) if line.confidence is not None else None,
        review_status=line.review_status,
        created_at=line.created_at,
        updated_at=line.updated_at,
    )


async def _build_invoice_response(invoice: Invoice) -> InvoiceResponse:
    signed_url = await storage_service.get_signed_url(invoice.storage_key)
    lines_sorted = sorted(invoice.lines, key=lambda item: item.line_number)
    return InvoiceResponse(
        id=str(invoice.id),
        store_id=str(invoice.store_id),
        storage_key=invoice.storage_key,
        original_filename=invoice.original_filename,
        mime_type=invoice.mime_type,
        status=invoice.status,
        extraction_provider=invoice.extraction_provider,
        extraction_error_code=invoice.extraction_error_code,
        confirmed_at=invoice.confirmed_at,
        created_at=invoice.created_at,
        updated_at=invoice.updated_at,
        signed_url=signed_url,
        lines=[_build_line_response(line) for line in lines_sorted],
    )


@router.post("", response_model=SuccessResponse[InvoiceResponse], status_code=201)
async def upload_invoice(
    store_id: str = Path(..., description="Store UUID"),
    file: UploadFile = File(..., description="Invoice image or PDF document"),
    context: StoreContext = Depends(get_current_store),
    db: Session = Depends(get_db),
    request_id: str = Depends(get_request_id),
):
    """
    Upload invoice image, save to private storage, trigger Gemini OCR,
    and execute RapidFuzz catalogue matching.
    Conforms to API.md Section 4.5 and ARCHITECTURE.md Section 9.
    """
    content_type = file.content_type or "image/jpeg"
    if content_type not in ALLOWED_MIME_TYPES:
        raise ValidationException(
            f"Unsupported file type '{content_type}'. Allowed types: JPG, PNG, WebP, PDF"
        )

    file_bytes = await file.read()
    if len(file_bytes) > MAX_FILE_SIZE:
        max_mb = MAX_FILE_SIZE // (1024 * 1024)
        raise ValidationException(f"File size exceeds maximum limit of {max_mb}MB.")
    if len(file_bytes) == 0:
        raise ValidationException("Uploaded file is empty.")

    # Validate image integrity and normalize if image type
    if content_type.startswith("image/"):
        try:
            with Image.open(BytesIO(file_bytes)) as img:
                img.verify()
        except Exception:
            raise ValidationException(
                "The uploaded file is not a valid or readable image."
            ) from None

    extension = ALLOWED_MIME_TYPES.get(content_type, "jpg")
    invoice_uuid = uuid.uuid4()
    storage_key = f"invoices/{context.store_id}/{invoice_uuid.hex}.{extension}"

    # 1. Upload to private storage
    await storage_service.upload_file(file_bytes, storage_key, content_type)

    # 2. Create initial database invoice record in processing state
    store_uuid = uuid.UUID(context.store_id)
    invoice = Invoice(
        id=invoice_uuid,
        store_id=store_uuid,
        storage_key=storage_key,
        original_filename=file.filename,
        mime_type=content_type,
        status="processing",
        extraction_provider="gemini",
    )
    db.add(invoice)
    db.commit()
    db.refresh(invoice)

    # 3. Call AI Vision Provider (Gemini Vision)
    vision_provider = get_vision_provider()
    extraction = await vision_provider.extract_invoice(file_bytes, content_type)

    # 4. Fetch store products for RapidFuzz matching
    catalogue_stmt = select(Product).where(Product.store_id == store_uuid)
    catalogue_products = list(db.scalars(catalogue_stmt).all())

    # 5. Populate extracted lines with RapidFuzz catalogue matches
    if extraction.lines:
        for idx, line_item in enumerate(extraction.lines, start=1):
            match = match_line_to_catalogue(line_item.raw_description, catalogue_products)

            qty = Decimal(str(line_item.quantity)) if line_item.quantity is not None else None
            unit_cost = (
                Decimal(str(line_item.unit_cost)) if line_item.unit_cost is not None else None
            )
            line_total = (
                Decimal(str(line_item.line_total)) if line_item.line_total is not None else None
            )
            if line_total is None and qty is not None and unit_cost is not None:
                line_total = qty * unit_cost

            confidence = Decimal(str(match.confidence or line_item.confidence or 0.85))

            inv_line = InvoiceLine(
                id=uuid.uuid4(),
                invoice_id=invoice.id,
                line_number=idx,
                raw_description=line_item.raw_description,
                product_id=match.product.id if match.product else None,
                quantity=qty,
                unit=line_item.unit,
                unit_cost=unit_cost,
                line_total=line_total,
                confidence=confidence,
                review_status=match.review_status,
            )
            db.add(inv_line)

        invoice.status = "review_required"
        invoice.extraction_error_code = None
    else:
        if extraction.error_code:
            invoice.status = "failed"
            invoice.extraction_error_code = extraction.error_code
        else:
            invoice.status = "review_required"

    db.commit()
    db.refresh(invoice)

    response_data = await _build_invoice_response(invoice)
    return SuccessResponse(data=response_data, request_id=request_id)


@router.get("", response_model=PaginatedResponse[InvoiceResponse])
async def list_invoices(
    store_id: str = Path(..., description="Store UUID"),
    status: Optional[str] = Query(None, description="Filter by invoice status"),
    limit: int = Query(25, ge=1, le=100),
    cursor: Optional[str] = Query(None),
    context: StoreContext = Depends(get_current_store),
    db: Session = Depends(get_db),
    request_id: str = Depends(get_request_id),
):
    """List invoices for the active store."""
    store_uuid = uuid.UUID(context.store_id)
    stmt = select(Invoice).where(Invoice.store_id == store_uuid)
    if status:
        stmt = stmt.where(Invoice.status == status)
    stmt = stmt.order_by(Invoice.created_at.desc()).limit(limit)

    invoices = list(db.scalars(stmt).all())
    data = [await _build_invoice_response(inv) for inv in invoices]
    return PaginatedResponse(
        data=data,
        pagination=PaginationMeta(limit=limit, next_cursor=None),
        request_id=request_id,
    )


@router.get("/{invoice_id}", response_model=SuccessResponse[InvoiceResponse])
async def get_invoice(
    store_id: str = Path(..., description="Store UUID"),
    invoice_id: str = Path(..., description="Invoice UUID"),
    context: StoreContext = Depends(get_current_store),
    db: Session = Depends(get_db),
    request_id: str = Depends(get_request_id),
):
    """Retrieve an invoice and its line items."""
    try:
        inv_uuid = uuid.UUID(invoice_id)
        store_uuid = uuid.UUID(context.store_id)
    except ValueError:
        raise NotFoundException("Invoice not found") from None

    stmt = select(Invoice).where(Invoice.id == inv_uuid, Invoice.store_id == store_uuid)
    invoice = db.scalars(stmt).first()
    if not invoice:
        raise NotFoundException("Invoice not found")

    response_data = await _build_invoice_response(invoice)
    return SuccessResponse(data=response_data, request_id=request_id)


@router.get("/{invoice_id}/lines", response_model=SuccessResponse[list[InvoiceLineResponse]])
async def get_invoice_lines(
    store_id: str = Path(..., description="Store UUID"),
    invoice_id: str = Path(..., description="Invoice UUID"),
    context: StoreContext = Depends(get_current_store),
    db: Session = Depends(get_db),
    request_id: str = Depends(get_request_id),
):
    """Retrieve line items for an invoice in source order."""
    try:
        inv_uuid = uuid.UUID(invoice_id)
        store_uuid = uuid.UUID(context.store_id)
    except ValueError:
        raise NotFoundException("Invoice not found") from None

    stmt = (
        select(InvoiceLine)
        .join(Invoice, Invoice.id == InvoiceLine.invoice_id)
        .where(Invoice.id == inv_uuid, Invoice.store_id == store_uuid)
        .order_by(InvoiceLine.line_number.asc())
    )
    lines = list(db.scalars(stmt).all())
    data = [_build_line_response(line) for line in lines]
    return SuccessResponse(data=data, request_id=request_id)


@router.patch("/{invoice_id}/lines/{line_id}", response_model=SuccessResponse[InvoiceLineResponse])
async def update_invoice_line(
    store_id: str = Path(..., description="Store UUID"),
    invoice_id: str = Path(..., description="Invoice UUID"),
    line_id: str = Path(..., description="Invoice Line UUID"),
    payload: InvoiceLineUpdate = ...,
    context: StoreContext = Depends(get_current_store),
    db: Session = Depends(get_db),
    request_id: str = Depends(get_request_id),
):
    """
    Update or correct an invoice line item during human merchant review.
    Conforms to API.md Section 4.5.
    """
    try:
        inv_uuid = uuid.UUID(invoice_id)
        l_uuid = uuid.UUID(line_id)
        store_uuid = uuid.UUID(context.store_id)
    except ValueError:
        raise NotFoundException("Invoice line not found") from None

    stmt = (
        select(InvoiceLine)
        .join(Invoice, Invoice.id == InvoiceLine.invoice_id)
        .where(
            InvoiceLine.id == l_uuid,
            Invoice.id == inv_uuid,
            Invoice.store_id == store_uuid,
        )
    )
    line = db.scalars(stmt).first()
    if not line:
        raise NotFoundException("Invoice line not found")

    if line.invoice.status == "confirmed":
        raise ConflictException("Cannot edit line items of an already confirmed invoice.")

    # Validate referenced product belongs to the same store
    if payload.product_id:
        try:
            prod_uuid = uuid.UUID(payload.product_id)
            prod = db.scalars(
                select(Product).where(Product.id == prod_uuid, Product.store_id == store_uuid)
            ).first()
            if not prod:
                raise ValidationException(
                    "Selected catalogue product does not belong to this store."
                )
            line.product_id = prod_uuid
        except ValueError:
            raise ValidationException("Invalid product UUID format") from None
    elif payload.product_id is not None and payload.product_id == "":
        line.product_id = None

    if payload.raw_description is not None:
        line.raw_description = payload.raw_description.strip()
    if payload.quantity is not None:
        if payload.quantity <= 0:
            raise ValidationException("Quantity must be greater than zero.")
        line.quantity = Decimal(str(payload.quantity))
    if payload.unit is not None:
        line.unit = payload.unit.strip() or None
    if payload.unit_cost is not None:
        if payload.unit_cost < 0:
            raise ValidationException("Unit cost must be non-negative.")
        line.unit_cost = Decimal(str(payload.unit_cost))
    if payload.line_total is not None:
        if payload.line_total < 0:
            raise ValidationException("Line total must be non-negative.")
        line.line_total = Decimal(str(payload.line_total))
    elif payload.quantity is not None and payload.unit_cost is not None:
        line.line_total = line.quantity * line.unit_cost

    if payload.review_status is not None:
        valid_statuses = ("needs_review", "matched", "new_product", "ignored")
        if payload.review_status not in valid_statuses:
            raise ValidationException(f"Invalid review_status. Allowed: {valid_statuses}")
        line.review_status = payload.review_status

    db.commit()
    db.refresh(line)
    return SuccessResponse(data=_build_line_response(line), request_id=request_id)


@router.post("/{invoice_id}/process", response_model=SuccessResponse[InvoiceResponse])
async def reprocess_invoice(
    store_id: str = Path(..., description="Store UUID"),
    invoice_id: str = Path(..., description="Invoice UUID"),
    context: StoreContext = Depends(get_current_store),
    db: Session = Depends(get_db),
    request_id: str = Depends(get_request_id),
):
    """Re-trigger or retry AI extraction for an invoice."""
    try:
        inv_uuid = uuid.UUID(invoice_id)
        store_uuid = uuid.UUID(context.store_id)
    except ValueError:
        raise NotFoundException("Invoice not found") from None

    stmt = select(Invoice).where(Invoice.id == inv_uuid, Invoice.store_id == store_uuid)
    invoice = db.scalars(stmt).first()
    if not invoice:
        raise NotFoundException("Invoice not found")

    if invoice.status == "confirmed":
        raise ConflictException("Cannot re-process an already confirmed invoice.")

    file_bytes = await storage_service.get_file_bytes(invoice.storage_key)
    if not file_bytes:
        raise HTTPException(
            status_code=400,
            detail="Invoice file bytes could not be retrieved from storage.",
        )

    vision_provider = get_vision_provider()
    extraction = await vision_provider.extract_invoice(file_bytes, invoice.mime_type)

    catalogue_stmt = select(Product).where(Product.store_id == store_uuid)
    catalogue_products = list(db.scalars(catalogue_stmt).all())

    # Clear existing lines for clean reprocessing
    for old_line in list(invoice.lines):
        db.delete(old_line)
    db.flush()

    if extraction.lines:
        for idx, line_item in enumerate(extraction.lines, start=1):
            match = match_line_to_catalogue(line_item.raw_description, catalogue_products)
            qty = Decimal(str(line_item.quantity)) if line_item.quantity is not None else None
            unit_cost = (
                Decimal(str(line_item.unit_cost)) if line_item.unit_cost is not None else None
            )
            line_total = (
                Decimal(str(line_item.line_total)) if line_item.line_total is not None else None
            )
            if line_total is None and qty is not None and unit_cost is not None:
                line_total = qty * unit_cost

            inv_line = InvoiceLine(
                id=uuid.uuid4(),
                invoice_id=invoice.id,
                line_number=idx,
                raw_description=line_item.raw_description,
                product_id=match.product.id if match.product else None,
                quantity=qty,
                unit=line_item.unit,
                unit_cost=unit_cost,
                line_total=line_total,
                confidence=Decimal(str(match.confidence or 0.85)),
                review_status=match.review_status,
            )
            db.add(inv_line)

        invoice.status = "review_required"
        invoice.extraction_error_code = None
    else:
        invoice.status = "failed"
        invoice.extraction_error_code = extraction.error_code or "EMPTY_EXTRACTION"

    db.commit()
    db.refresh(invoice)
    response_data = await _build_invoice_response(invoice)
    return SuccessResponse(data=response_data, request_id=request_id)


@router.post("/{invoice_id}/confirm", response_model=SuccessResponse[InvoiceResponse])
async def confirm_invoice(
    store_id: str = Path(..., description="Store UUID"),
    invoice_id: str = Path(..., description="Invoice UUID"),
    context: StoreContext = Depends(require_store_role(StoreRole.OWNER)),
    db: Session = Depends(get_db),
    request_id: str = Depends(get_request_id),
):
    """
    Confirm reviewed invoice and atomically apply stock movements to inventory.
    Requires Store Owner role per PRD Table 3.3 and API.md Section 2.3.
    Conforms to API.md Section 4.5 and DATABASE.md Section 6.
    """
    try:
        inv_uuid = uuid.UUID(invoice_id)
        store_uuid = uuid.UUID(context.store_id)
    except ValueError:
        raise NotFoundException("Invoice not found") from None

    stmt = select(Invoice).where(Invoice.id == inv_uuid, Invoice.store_id == store_uuid)
    invoice = db.scalars(stmt).first()
    if not invoice:
        raise NotFoundException("Invoice not found")

    # Idempotent return: if already confirmed, do not apply stock twice
    if invoice.status == "confirmed":
        response_data = await _build_invoice_response(invoice)
        return SuccessResponse(data=response_data, request_id=request_id)

    if not invoice.lines:
        raise ValidationException("Cannot confirm an invoice with zero line items.")

    now_utc = datetime.now(timezone.utc)

    # Process all lines atomically
    for line in invoice.lines:
        if line.review_status == "ignored":
            continue

        # If flagged as new product or missing product_id, auto-create catalogue product
        if line.review_status == "new_product" or not line.product_id:
            new_prod = Product(
                id=uuid.uuid4(),
                store_id=store_uuid,
                name=line.raw_description.strip(),
                unit=line.unit.strip() if line.unit else "piece",
            )
            db.add(new_prod)
            db.flush()
            line.product_id = new_prod.id
            line.review_status = "matched"

        if line.quantity is None or line.quantity <= 0:
            raise ValidationException(
                f"Line #{line.line_number} '{line.raw_description}' requires a positive quantity."
            )

        # Update or create Inventory record
        inv_stmt = select(Inventory).where(
            Inventory.store_id == store_uuid,
            Inventory.product_id == line.product_id,
        )
        inv_record = db.scalars(inv_stmt).first()
        qty_delta = Decimal(str(line.quantity))

        if not inv_record:
            inv_record = Inventory(
                id=uuid.uuid4(),
                store_id=store_uuid,
                product_id=line.product_id,
                quantity_on_hand=qty_delta,
                updated_at=now_utc,
            )
            db.add(inv_record)
        else:
            inv_record.quantity_on_hand += qty_delta
            inv_record.updated_at = now_utc

        # Record audit stock movement (uq_stock_movements_invoice_line prevents duplicates)
        movement = StockMovement(
            id=uuid.uuid4(),
            store_id=store_uuid,
            product_id=line.product_id,
            invoice_id=invoice.id,
            invoice_line_id=line.id,
            movement_type="invoice_restock",
            quantity_delta=qty_delta,
            reference_key=f"inv_{invoice.id}_line_{line.line_number}",
            created_at=now_utc,
        )
        db.add(movement)

    invoice.status = "confirmed"
    invoice.confirmed_at = now_utc
    invoice.updated_at = now_utc

    db.commit()
    db.refresh(invoice)

    response_data = await _build_invoice_response(invoice)
    return SuccessResponse(data=response_data, request_id=request_id)


@preview_router.get("/preview/{storage_key:path}")
async def preview_stored_file(storage_key: str):
    """Local development preview endpoint for uploaded files."""
    file_bytes = await storage_service.get_file_bytes(storage_key)
    if not file_bytes:
        raise NotFoundException("File preview not found")

    ext = storage_key.split(".")[-1].lower()
    media_map = {
        "jpg": "image/jpeg",
        "jpeg": "image/jpeg",
        "png": "image/png",
        "webp": "image/webp",
        "pdf": "application/pdf",
    }
    media_type = media_map.get(ext, "application/octet-stream")
    return Response(content=file_bytes, media_type=media_type)
