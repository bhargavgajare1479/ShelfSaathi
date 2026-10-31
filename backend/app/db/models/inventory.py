import uuid
from datetime import datetime, timezone
from decimal import Decimal

from sqlalchemy import CheckConstraint, DateTime, ForeignKey, Numeric, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class Inventory(Base):
    __tablename__ = "inventory"
    __table_args__ = (
        UniqueConstraint("store_id", "product_id", name="uq_inventory_store_product"),
        CheckConstraint("quantity_on_hand >= 0", name="ck_inventory_quantity_non_negative"),
    )

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    store_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("stores.id", ondelete="CASCADE"), nullable=False, index=True
    )
    product_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("products.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    quantity_on_hand: Mapped[Decimal] = mapped_column(
        Numeric(14, 3), default=Decimal("0.000"), nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    # Relationships
    store = relationship("Store", back_populates="inventory_items")
    product = relationship("Product", back_populates="inventory")
