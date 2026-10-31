"""0001_initial_schema

Initial schema migration for ShelfSaathi MVP.
Creates stores, store_members, products, inventory, invoices, invoice_lines,
stock_movements, purchase_order_drafts, purchase_order_lines, and sales_records.
Conforms to docs/DATABASE.md.

Revision ID: 0001_initial_schema
Revises:
Create Date: 2026-10-31 06:00:00.000000 UTC
"""

from collections.abc import Sequence
from typing import Union

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

revision: str = "0001_initial_schema"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # 1. stores
    op.create_table(
        "stores",
        sa.Column(
            "id",
            postgresql.UUID(as_uuid=True),
            primary_key=True,
            server_default=sa.text("gen_random_uuid()"),
        ),
        sa.Column("name", sa.Text(), nullable=False),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
    )

    # 2. store_members
    op.create_table(
        "store_members",
        sa.Column(
            "id",
            postgresql.UUID(as_uuid=True),
            primary_key=True,
            server_default=sa.text("gen_random_uuid()"),
        ),
        sa.Column(
            "store_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("stores.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column("user_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("role", sa.Text(), nullable=False, server_default="staff"),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.UniqueConstraint("store_id", "user_id", name="uq_store_members_store_user"),
        sa.CheckConstraint("role IN ('owner', 'staff')", name="ck_store_members_role"),
    )
    op.create_index("idx_store_members_store_id", "store_members", ["store_id"])
    op.create_index("idx_store_members_user_id", "store_members", ["user_id"])

    # 3. products
    op.create_table(
        "products",
        sa.Column(
            "id",
            postgresql.UUID(as_uuid=True),
            primary_key=True,
            server_default=sa.text("gen_random_uuid()"),
        ),
        sa.Column(
            "store_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("stores.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column("name", sa.Text(), nullable=False),
        sa.Column("brand", sa.Text(), nullable=True),
        sa.Column("barcode", sa.Text(), nullable=True),
        sa.Column("unit", sa.Text(), nullable=False),
        sa.Column("pack_size", sa.Numeric(12, 3), nullable=True),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.UniqueConstraint("store_id", "barcode", name="uq_products_store_barcode"),
        sa.CheckConstraint(
            "pack_size IS NULL OR pack_size > 0", name="ck_products_pack_size_positive"
        ),
    )
    op.create_index("idx_products_store_id", "products", ["store_id"])
    op.create_index("idx_products_barcode", "products", ["barcode"])
    op.create_index("idx_products_name", "products", ["name"])

    # 4. inventory
    op.create_table(
        "inventory",
        sa.Column(
            "id",
            postgresql.UUID(as_uuid=True),
            primary_key=True,
            server_default=sa.text("gen_random_uuid()"),
        ),
        sa.Column(
            "store_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("stores.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column(
            "product_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("products.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column("quantity_on_hand", sa.Numeric(14, 3), server_default="0", nullable=False),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.UniqueConstraint("store_id", "product_id", name="uq_inventory_store_product"),
        sa.CheckConstraint("quantity_on_hand >= 0", name="ck_inventory_quantity_non_negative"),
    )
    op.create_index("idx_inventory_store_id", "inventory", ["store_id"])
    op.create_index("idx_inventory_product_id", "inventory", ["product_id"])

    # 5. invoices
    op.create_table(
        "invoices",
        sa.Column(
            "id",
            postgresql.UUID(as_uuid=True),
            primary_key=True,
            server_default=sa.text("gen_random_uuid()"),
        ),
        sa.Column(
            "store_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("stores.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column("storage_key", sa.Text(), nullable=False, unique=True),
        sa.Column("original_filename", sa.Text(), nullable=True),
        sa.Column("mime_type", sa.Text(), nullable=False),
        sa.Column("status", sa.Text(), server_default="uploaded", nullable=False),
        sa.Column("extraction_provider", sa.Text(), nullable=True),
        sa.Column("extraction_error_code", sa.Text(), nullable=True),
        sa.Column("confirmed_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.CheckConstraint(
            "status IN ('uploaded', 'processing', 'review_required', 'confirmed', 'failed')",
            name="ck_invoices_status",
        ),
    )
    op.create_index("idx_invoices_store_id", "invoices", ["store_id"])
    op.create_index("idx_invoices_status", "invoices", ["status"])

    # 6. invoice_lines
    op.create_table(
        "invoice_lines",
        sa.Column(
            "id",
            postgresql.UUID(as_uuid=True),
            primary_key=True,
            server_default=sa.text("gen_random_uuid()"),
        ),
        sa.Column(
            "invoice_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("invoices.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column("line_number", sa.Integer(), nullable=False),
        sa.Column("raw_description", sa.Text(), nullable=False),
        sa.Column(
            "product_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("products.id", ondelete="SET NULL"),
            nullable=True,
        ),
        sa.Column("quantity", sa.Numeric(14, 3), nullable=True),
        sa.Column("unit", sa.Text(), nullable=True),
        sa.Column("unit_cost", sa.Numeric(14, 2), nullable=True),
        sa.Column("line_total", sa.Numeric(14, 2), nullable=True),
        sa.Column("confidence", sa.Numeric(5, 4), nullable=True),
        sa.Column("review_status", sa.Text(), server_default="needs_review", nullable=False),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.UniqueConstraint("invoice_id", "line_number", name="uq_invoice_lines_invoice_line_num"),
        sa.CheckConstraint("line_number > 0", name="ck_invoice_lines_line_number_positive"),
        sa.CheckConstraint(
            "review_status IN ('needs_review', 'matched', 'new_product', 'ignored')",
            name="ck_invoice_lines_review_status",
        ),
        sa.CheckConstraint(
            "quantity IS NULL OR quantity > 0", name="ck_invoice_lines_quantity_positive"
        ),
        sa.CheckConstraint(
            "unit_cost IS NULL OR unit_cost >= 0", name="ck_invoice_lines_unit_cost_non_negative"
        ),
        sa.CheckConstraint(
            "line_total IS NULL OR line_total >= 0", name="ck_invoice_lines_line_total_non_negative"
        ),
        sa.CheckConstraint(
            "confidence IS NULL OR (confidence >= 0 AND confidence <= 1)",
            name="ck_invoice_lines_confidence_range",
        ),
    )
    op.create_index("idx_invoice_lines_invoice_id", "invoice_lines", ["invoice_id"])
    op.create_index("idx_invoice_lines_product_id", "invoice_lines", ["product_id"])

    # 7. stock_movements
    op.create_table(
        "stock_movements",
        sa.Column(
            "id",
            postgresql.UUID(as_uuid=True),
            primary_key=True,
            server_default=sa.text("gen_random_uuid()"),
        ),
        sa.Column(
            "store_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("stores.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column(
            "product_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("products.id", ondelete="RESTRICT"),
            nullable=False,
        ),
        sa.Column(
            "invoice_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("invoices.id", ondelete="SET NULL"),
            nullable=True,
        ),
        sa.Column(
            "invoice_line_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("invoice_lines.id", ondelete="SET NULL"),
            nullable=True,
        ),
        sa.Column("movement_type", sa.Text(), nullable=False),
        sa.Column("quantity_delta", sa.Numeric(14, 3), nullable=False),
        sa.Column("reference_key", sa.Text(), nullable=True),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.CheckConstraint(
            "movement_type IN ('invoice_restock', 'manual_adjustment')",
            name="ck_stock_movements_type",
        ),
        sa.CheckConstraint("quantity_delta != 0", name="ck_stock_movements_delta_non_zero"),
        sa.UniqueConstraint("invoice_line_id", name="uq_stock_movements_invoice_line"),
    )
    op.create_index("idx_stock_movements_store_id", "stock_movements", ["store_id"])
    op.create_index("idx_stock_movements_product_id", "stock_movements", ["product_id"])
    op.create_index("idx_stock_movements_invoice_id", "stock_movements", ["invoice_id"])

    # 8. purchase_order_drafts
    op.create_table(
        "purchase_order_drafts",
        sa.Column(
            "id",
            postgresql.UUID(as_uuid=True),
            primary_key=True,
            server_default=sa.text("gen_random_uuid()"),
        ),
        sa.Column(
            "store_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("stores.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column("status", sa.Text(), server_default="draft", nullable=False),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.CheckConstraint("status IN ('draft', 'cancelled')", name="ck_po_drafts_status"),
    )
    op.create_index("idx_po_drafts_store_id", "purchase_order_drafts", ["store_id"])

    # 9. purchase_order_lines
    op.create_table(
        "purchase_order_lines",
        sa.Column(
            "id",
            postgresql.UUID(as_uuid=True),
            primary_key=True,
            server_default=sa.text("gen_random_uuid()"),
        ),
        sa.Column(
            "purchase_order_draft_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("purchase_order_drafts.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column(
            "product_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("products.id", ondelete="RESTRICT"),
            nullable=False,
        ),
        sa.Column("quantity", sa.Numeric(14, 3), nullable=False),
        sa.Column("unit_cost", sa.Numeric(14, 2), nullable=True),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.CheckConstraint("quantity > 0", name="ck_po_lines_quantity_positive"),
        sa.CheckConstraint(
            "unit_cost IS NULL OR unit_cost >= 0", name="ck_po_lines_unit_cost_non_negative"
        ),
    )
    op.create_index("idx_po_lines_draft_id", "purchase_order_lines", ["purchase_order_draft_id"])

    # 10. sales_records
    op.create_table(
        "sales_records",
        sa.Column(
            "id",
            postgresql.UUID(as_uuid=True),
            primary_key=True,
            server_default=sa.text("gen_random_uuid()"),
        ),
        sa.Column(
            "store_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("stores.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column(
            "product_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("products.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column("quantity_sold", sa.Numeric(14, 3), nullable=False),
        sa.Column("sold_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("source", sa.Text(), server_default="demo", nullable=False),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.CheckConstraint("quantity_sold > 0", name="ck_sales_records_quantity_sold_positive"),
        sa.CheckConstraint(
            "source IN ('imported', 'manual', 'demo')", name="ck_sales_records_source"
        ),
    )
    op.create_index("idx_sales_records_store_id", "sales_records", ["store_id"])
    op.create_index("idx_sales_records_product_id", "sales_records", ["product_id"])


def downgrade() -> None:
    op.drop_table("sales_records")
    op.drop_table("purchase_order_lines")
    op.drop_table("purchase_order_drafts")
    op.drop_table("stock_movements")
    op.drop_table("invoice_lines")
    op.drop_table("invoices")
    op.drop_table("inventory")
    op.drop_table("products")
    op.drop_table("store_members")
    op.drop_table("stores")
