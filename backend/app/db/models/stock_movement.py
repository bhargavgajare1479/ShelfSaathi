import uuid
from datetime import datetime, timezone
from decimal import Decimal
from typing import Optional

from sqlalchemy import CheckConstraint, DateTime, ForeignKey, Numeric, String, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class StockMovement(Base):
    __tablename__ = "stock_movements"
    __table_args__ = (
        CheckConstraint(
            "movement_type IN ('invoice_restock', 'manual_adjustment')",
            name="ck_stock_movements_type",
        ),
        CheckConstraint("quantity_delta != 0", name="ck_stock_movements_delta_non_zero"),
        UniqueConstraint("invoice_line_id", name="uq_stock_movements_invoice_line"),
    )

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    store_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("stores.id", ondelete="CASCADE"), nullable=False, index=True
    )
    product_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("products.id", ondelete="RESTRICT"),
        nullable=False,
        index=True,
    )
    invoice_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("invoices.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )
    invoice_line_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("invoice_lines.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )
    movement_type: Mapped[str] = mapped_column(String, nullable=False)
    quantity_delta: Mapped[Decimal] = mapped_column(Numeric(14, 3), nullable=False)
    reference_key: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    # Relationships
    store = relationship("Store")
    product = relationship("Product", back_populates="stock_movements")
    invoice = relationship("Invoice")
    invoice_line = relationship("InvoiceLine")
