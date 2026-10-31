import uuid
from datetime import datetime, timezone
from decimal import Decimal
from typing import Optional

from sqlalchemy import (
    CheckConstraint,
    DateTime,
    ForeignKey,
    Integer,
    Numeric,
    String,
    UniqueConstraint,
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class Invoice(Base):
    __tablename__ = "invoices"
    __table_args__ = (
        CheckConstraint(
            "status IN ('uploaded', 'processing', 'review_required', 'confirmed', 'failed')",
            name="ck_invoices_status",
        ),
    )

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    store_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("stores.id", ondelete="CASCADE"), nullable=False, index=True
    )
    storage_key: Mapped[str] = mapped_column(String, unique=True, nullable=False)
    original_filename: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    mime_type: Mapped[str] = mapped_column(String, nullable=False)
    status: Mapped[str] = mapped_column(String, default="uploaded", nullable=False, index=True)
    extraction_provider: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    extraction_error_code: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    confirmed_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    # Relationships
    store = relationship("Store", back_populates="invoices")
    lines = relationship("InvoiceLine", back_populates="invoice", cascade="all, delete-orphan")


class InvoiceLine(Base):
    __tablename__ = "invoice_lines"
    __table_args__ = (
        UniqueConstraint("invoice_id", "line_number", name="uq_invoice_lines_invoice_line_num"),
        CheckConstraint("line_number > 0", name="ck_invoice_lines_line_number_positive"),
        CheckConstraint(
            "review_status IN ('needs_review', 'matched', 'new_product', 'ignored')",
            name="ck_invoice_lines_review_status",
        ),
        CheckConstraint(
            "quantity IS NULL OR quantity > 0", name="ck_invoice_lines_quantity_positive"
        ),
        CheckConstraint(
            "unit_cost IS NULL OR unit_cost >= 0", name="ck_invoice_lines_unit_cost_non_negative"
        ),
        CheckConstraint(
            "line_total IS NULL OR line_total >= 0", name="ck_invoice_lines_line_total_non_negative"
        ),
        CheckConstraint(
            "confidence IS NULL OR (confidence >= 0 AND confidence <= 1)",
            name="ck_invoice_lines_confidence_range",
        ),
    )

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    invoice_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("invoices.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    line_number: Mapped[int] = mapped_column(Integer, nullable=False)
    raw_description: Mapped[str] = mapped_column(String, nullable=False)
    product_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("products.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )
    quantity: Mapped[Optional[Decimal]] = mapped_column(Numeric(14, 3), nullable=True)
    unit: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    unit_cost: Mapped[Optional[Decimal]] = mapped_column(Numeric(14, 2), nullable=True)
    line_total: Mapped[Optional[Decimal]] = mapped_column(Numeric(14, 2), nullable=True)
    confidence: Mapped[Optional[Decimal]] = mapped_column(Numeric(5, 4), nullable=True)
    review_status: Mapped[str] = mapped_column(String, default="needs_review", nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    # Relationships
    invoice = relationship("Invoice", back_populates="lines")
    product = relationship("Product")
