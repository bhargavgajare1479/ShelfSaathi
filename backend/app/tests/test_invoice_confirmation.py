import uuid
from decimal import Decimal

import pytest
from httpx import AsyncClient
from sqlalchemy import select

from app.db.models import (
    Inventory,
    Invoice,
    InvoiceLine,
    Product,
    StockMovement,
    Store,
    StoreMember,
)
from app.tests.conftest import TestingSessionLocal
from app.tests.test_store_roles import create_test_token


@pytest.mark.asyncio
async def test_confirm_invoice_atomic_stock_update(client: AsyncClient):
    """
    Test atomic invoice confirmation:
    - Restocks matched existing product
    - Auto-creates new catalogue product for 'new_product' line
    - Generates audit stock movements
    - Updates invoice status to 'confirmed'
    """
    owner_user_id = str(uuid.uuid4())
    store_id = str(uuid.uuid4())
    store_uuid = uuid.UUID(store_id)
    owner_token = create_test_token(user_id=owner_user_id)

    db = TestingSessionLocal()
    # 1. Create Store & Owner Membership
    store = Store(id=store_uuid, name="Gupta Retail")
    db.add(store)
    db.add(StoreMember(store_id=store_uuid, user_id=uuid.UUID(owner_user_id), role="owner"))

    # 2. Existing Product with initial inventory
    prod1 = Product(
        id=uuid.uuid4(),
        store_id=store_uuid,
        name="Tata Salt Iodized 1kg",
        unit="pack",
    )
    db.add(prod1)
    db.add(Inventory(store_id=store_uuid, product_id=prod1.id, quantity_on_hand=Decimal("10.000")))

    # 3. Invoice with 2 lines (1 matched, 1 new product)
    inv = Invoice(
        id=uuid.uuid4(),
        store_id=store_uuid,
        storage_key=f"invoices/{store_id}/inv1.png",
        mime_type="image/png",
        status="review_required",
    )
    db.add(inv)
    db.flush()

    inv_id = str(inv.id)
    prod1_id = prod1.id

    line1 = InvoiceLine(
        id=uuid.uuid4(),
        invoice_id=inv.id,
        line_number=1,
        raw_description="Tata Salt 1kg",
        product_id=prod1.id,
        quantity=Decimal("20.000"),
        unit="pack",
        unit_cost=Decimal("24.00"),
        line_total=Decimal("480.00"),
        review_status="matched",
    )
    line2 = InvoiceLine(
        id=uuid.uuid4(),
        invoice_id=inv.id,
        line_number=2,
        raw_description="Aashirvaad Ghee 500ml",
        product_id=None,
        quantity=Decimal("5.000"),
        unit="jar",
        unit_cost=Decimal("310.00"),
        line_total=Decimal("1550.00"),
        review_status="new_product",
    )
    db.add_all([line1, line2])
    db.commit()
    db.close()

    # 4. Confirm invoice via API
    res = await client.post(
        f"/api/v1/stores/{store_id}/invoices/{inv_id}/confirm",
        headers={"Authorization": f"Bearer {owner_token}"},
    )
    assert res.status_code == 200
    data = res.json()["data"]
    assert data["status"] == "confirmed"
    assert data["confirmed_at"] is not None

    # 5. Verify database inventory updates and movements
    db_verify = TestingSessionLocal()
    # Check Prod1 inventory: initial 10 + 20 restocked = 30
    inv1 = db_verify.scalars(
        select(Inventory).where(Inventory.store_id == store_uuid, Inventory.product_id == prod1_id)
    ).first()
    assert inv1 is not None
    assert float(inv1.quantity_on_hand) == 30.0

    # Check new product created and inventory initialized to 5
    prod2 = db_verify.scalars(
        select(Product).where(
            Product.store_id == store_uuid, Product.name == "Aashirvaad Ghee 500ml"
        )
    ).first()
    assert prod2 is not None
    inv2 = db_verify.scalars(
        select(Inventory).where(Inventory.store_id == store_uuid, Inventory.product_id == prod2.id)
    ).first()
    assert inv2 is not None
    assert float(inv2.quantity_on_hand) == 5.0

    # Check stock movements audit records
    movements = list(
        db_verify.scalars(
            select(StockMovement).where(StockMovement.invoice_id == uuid.UUID(inv_id))
        ).all()
    )
    assert len(movements) == 2
    assert all(m.movement_type == "invoice_restock" for m in movements)
    db_verify.close()


@pytest.mark.asyncio
async def test_confirm_invoice_staff_forbidden(client: AsyncClient):
    """Test staff role cannot confirm invoice (Owner permission required)."""
    staff_user_id = str(uuid.uuid4())
    store_id = str(uuid.uuid4())
    store_uuid = uuid.UUID(store_id)
    staff_token = create_test_token(user_id=staff_user_id)

    db = TestingSessionLocal()
    store = Store(id=store_uuid, name="Gupta Retail")
    db.add(store)
    db.add(StoreMember(store_id=store_uuid, user_id=uuid.UUID(staff_user_id), role="staff"))

    inv = Invoice(
        id=uuid.uuid4(),
        store_id=store_uuid,
        storage_key=f"invoices/{store_id}/inv_staff.png",
        mime_type="image/png",
        status="review_required",
    )
    db.add(inv)
    db.flush()
    inv_id = str(inv.id)
    db.commit()
    db.close()

    res = await client.post(
        f"/api/v1/stores/{store_id}/invoices/{inv_id}/confirm",
        headers={"Authorization": f"Bearer {staff_token}"},
    )
    assert res.status_code == 403
    assert res.json()["error"]["code"] == "FORBIDDEN"


@pytest.mark.asyncio
async def test_confirm_invoice_idempotent(client: AsyncClient):
    """Test confirming an already confirmed invoice does not re-apply stock."""
    owner_user_id = str(uuid.uuid4())
    store_id = str(uuid.uuid4())
    store_uuid = uuid.UUID(store_id)
    owner_token = create_test_token(user_id=owner_user_id)

    db = TestingSessionLocal()
    store = Store(id=store_uuid, name="Gupta Retail")
    db.add(store)
    db.add(StoreMember(store_id=store_uuid, user_id=uuid.UUID(owner_user_id), role="owner"))

    prod = Product(id=uuid.uuid4(), store_id=store_uuid, name="Parle-G 800g", unit="pack")
    db.add(prod)
    db.add(Inventory(store_id=store_uuid, product_id=prod.id, quantity_on_hand=Decimal("5.000")))

    inv = Invoice(
        id=uuid.uuid4(),
        store_id=store_uuid,
        storage_key=f"invoices/{store_id}/inv_idem.png",
        mime_type="image/png",
        status="review_required",
    )
    db.add(inv)
    db.flush()

    inv_id = str(inv.id)
    prod_id = prod.id

    line = InvoiceLine(
        id=uuid.uuid4(),
        invoice_id=inv.id,
        line_number=1,
        raw_description="Parle-G 800g",
        product_id=prod.id,
        quantity=Decimal("10.000"),
        unit="pack",
        review_status="matched",
    )
    db.add(line)
    db.commit()
    db.close()

    # First confirmation
    res1 = await client.post(
        f"/api/v1/stores/{store_id}/invoices/{inv_id}/confirm",
        headers={"Authorization": f"Bearer {owner_token}"},
    )
    assert res1.status_code == 200

    # Second confirmation (should be idempotent)
    res2 = await client.post(
        f"/api/v1/stores/{store_id}/invoices/{inv_id}/confirm",
        headers={"Authorization": f"Bearer {owner_token}"},
    )
    assert res2.status_code == 200

    # Verify inventory is 5 + 10 = 15 (not doubled to 25)
    db_verify = TestingSessionLocal()
    inv_rec = db_verify.scalars(
        select(Inventory).where(Inventory.store_id == store_uuid, Inventory.product_id == prod_id)
    ).first()
    assert float(inv_rec.quantity_on_hand) == 15.0
    db_verify.close()
