import uuid
from datetime import datetime, timezone

from sqlalchemy import DateTime, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class Store(Base):
    __tablename__ = "stores"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name: Mapped[str] = mapped_column(String, nullable=False)
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
    members = relationship("StoreMember", back_populates="store", cascade="all, delete-orphan")
    products = relationship("Product", back_populates="store", cascade="all, delete-orphan")
    invoices = relationship("Invoice", back_populates="store", cascade="all, delete-orphan")
    inventory_items = relationship(
        "Inventory", back_populates="store", cascade="all, delete-orphan"
    )
