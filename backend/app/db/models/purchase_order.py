import uuid
from datetime import datetime, timezone
from decimal import Decimal
from typing import Optional

from sqlalchemy import CheckConstraint, DateTime, ForeignKey, Numeric, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class PurchaseOrderDraft(Base):
    __tablename__ = "purchase_order_drafts"
    __table_args__ = (
        CheckConstraint("status IN ('draft', 'cancelled')", name="ck_po_drafts_status"),
    )

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    store_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("stores.id", ondelete="CASCADE"), nullable=False, index=True
    )
    status: Mapped[str] = mapped_column(String, default="draft", nullable=False, index=True)
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
    store = relationship("Store")
    lines = relationship("PurchaseOrderLine", back_populates="draft", cascade="all, delete-orphan")


class PurchaseOrderLine(Base):
    __tablename__ = "purchase_order_lines"
    __table_args__ = (
        CheckConstraint("quantity > 0", name="ck_po_lines_quantity_positive"),
        CheckConstraint(
            "unit_cost IS NULL OR unit_cost >= 0", name="ck_po_lines_unit_cost_non_negative"
        ),
    )

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    purchase_order_draft_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("purchase_order_drafts.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    product_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("products.id", ondelete="RESTRICT"),
        nullable=False,
        index=True,
    )
    quantity: Mapped[Decimal] = mapped_column(Numeric(14, 3), nullable=False)
    unit_cost: Mapped[Optional[Decimal]] = mapped_column(Numeric(14, 2), nullable=True)
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
    draft = relationship("PurchaseOrderDraft", back_populates="lines")
    product = relationship("Product")
