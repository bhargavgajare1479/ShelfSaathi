import uuid
from decimal import Decimal

import pytest
from httpx import AsyncClient

from app.db.models import Inventory, Product, StockMovement, Store
from app.tests.conftest import TestingSessionLocal
from app.tests.test_store_roles import create_test_token


@pytest.mark.asyncio
async def test_list_inventory_and_movements(client: AsyncClient):
    """Test inventory balances query and stock movements audit endpoint."""
    store_id = str(uuid.uuid4())
    store_uuid = uuid.UUID(store_id)
    token = create_test_token()

    db = TestingSessionLocal()
    store = Store(id=store_uuid, name="Gupta Supermarket")
    db.add(store)

    prod = Product(
        id=uuid.uuid4(),
        store_id=store_uuid,
        name="Fortune Sunflower Oil 1L",
        brand="Fortune",
        barcode="8906007280014",
        unit="bottle",
    )
    db.add(prod)
    db.add(
        Inventory(
            store_id=store_uuid,
            product_id=prod.id,
            quantity_on_hand=Decimal("24.000"),
        )
    )
    db.add(
        StockMovement(
            id=uuid.uuid4(),
            store_id=store_uuid,
            product_id=prod.id,
            movement_type="invoice_restock",
            quantity_delta=Decimal("24.000"),
            reference_key="inv_test_line_1",
        )
    )
    prod_id = str(prod.id)
    db.commit()
    db.close()

    # 1. List inventory
    res = await client.get(
        f"/api/v1/stores/{store_id}/inventory",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert res.status_code == 200
    items = res.json()["data"]
    assert len(items) == 1
    assert items[0]["product_name"] == "Fortune Sunflower Oil 1L"
    assert items[0]["quantity_on_hand"] == 24.0

    # 2. Get movements
    mov_res = await client.get(
        f"/api/v1/stores/{store_id}/inventory/{prod_id}/movements",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert mov_res.status_code == 200
    movements = mov_res.json()["data"]
    assert len(movements) == 1
    assert movements[0]["movement_type"] == "invoice_restock"
    assert movements[0]["quantity_delta"] == 24.0
