import pytest
from httpx import AsyncClient

from app.tests.test_store_roles import create_test_token


@pytest.mark.asyncio
async def test_reorder_suggestions_and_po_creation(client: AsyncClient):
    token = create_test_token()

    # Create store
    store_resp = await client.post(
        "/api/v1/stores",
        headers={"Authorization": f"Bearer {token}"},
        json={"name": "Copilot Store"},
    )
    store_id = store_resp.json()["data"]["id"]

    # Add critically low product (0 stock)
    prod1_resp = await client.post(
        f"/api/v1/stores/{store_id}/products",
        headers={"Authorization": f"Bearer {token}"},
        json={"name": "Aashirvaad Atta 5kg", "unit": "packet", "initial_stock": 0.0},
    )
    prod1_id = prod1_resp.json()["data"]["id"]

    # Add healthy product (50 stock)
    await client.post(
        f"/api/v1/stores/{store_id}/products",
        headers={"Authorization": f"Bearer {token}"},
        json={"name": "Parle-G 100g", "unit": "packet", "initial_stock": 50.0},
    )

    # 1. Fetch suggestions
    sug_resp = await client.get(
        f"/api/v1/stores/{store_id}/reorder-suggestions",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert sug_resp.status_code == 200
    suggestions = sug_resp.json()["data"]
    assert len(suggestions) >= 2

    # Verify critical urgency for 0 stock item
    critical_item = next(s for s in suggestions if s["product_id"] == prod1_id)
    assert critical_item["urgency"] == "critical"
    assert critical_item["days_of_stock_remaining"] == 0.0
    assert critical_item["suggested_reorder_quantity"] > 0
    assert "OUT OF STOCK" in critical_item["explanation"]

    # 2. Convert to Purchase Order Draft
    po_resp = await client.post(
        f"/api/v1/stores/{store_id}/reorder-suggestions/create-po",
        headers={"Authorization": f"Bearer {token}"},
        json={
            "items": [
                {
                    "product_id": prod1_id,
                    "quantity": critical_item["suggested_reorder_quantity"],
                    "unit_cost": 210.0,
                }
            ]
        },
    )
    assert po_resp.status_code == 201
    po_data = po_resp.json()["data"]
    assert po_data["status"] == "draft"
    assert po_data["total_items"] == 1
    assert len(po_data["lines"]) == 1
    assert po_data["lines"][0]["product_name"] == "Aashirvaad Atta 5kg"
    assert po_data["lines"][0]["quantity"] == critical_item["suggested_reorder_quantity"]

    draft_id = po_data["id"]

    # 3. Retrieve PO draft list
    list_po_resp = await client.get(
        f"/api/v1/stores/{store_id}/purchase-orders",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert list_po_resp.status_code == 200
    assert len(list_po_resp.json()["data"]) >= 1

    # 4. Cancel PO draft
    patch_po = await client.patch(
        f"/api/v1/stores/{store_id}/purchase-orders/{draft_id}",
        headers={"Authorization": f"Bearer {token}"},
        json={"status": "cancelled"},
    )
    assert patch_po.status_code == 200
    assert patch_po.json()["data"]["status"] == "cancelled"

