import pytest
from httpx import AsyncClient

from app.tests.test_store_roles import create_test_token


@pytest.mark.asyncio
async def test_catalogue_crud_flow(client: AsyncClient):
    token = create_test_token()

    # 1. Create a store first
    store_resp = await client.post(
        "/api/v1/stores",
        headers={"Authorization": f"Bearer {token}"},
        json={"name": "Catalogue Test Store"},
    )
    assert store_resp.status_code == 201
    store_id = store_resp.json()["data"]["id"]

    # 2. Create product in catalogue with opening stock
    prod_resp = await client.post(
        f"/api/v1/stores/{store_id}/products",
        headers={"Authorization": f"Bearer {token}"},
        json={
            "name": "Tata Salt 1kg",
            "brand": "Tata",
            "barcode": "8901030000001",
            "unit": "packet",
            "pack_size": 1.0,
            "initial_stock": 25.0,
        },
    )
    assert prod_resp.status_code == 201
    prod_data = prod_resp.json()["data"]
    prod_id = prod_data["id"]
    assert prod_data["name"] == "Tata Salt 1kg"
    assert prod_data["quantity_on_hand"] == 25.0

    # 3. List products and search
    list_resp = await client.get(
        f"/api/v1/stores/{store_id}/products?search=Tata",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert list_resp.status_code == 200
    assert len(list_resp.json()["data"]) >= 1
    assert list_resp.json()["data"][0]["name"] == "Tata Salt 1kg"

    # 4. Update product
    patch_resp = await client.patch(
        f"/api/v1/stores/{store_id}/products/{prod_id}",
        headers={"Authorization": f"Bearer {token}"},
        json={"name": "Tata Salt Iodized 1kg", "brand": "Tata Consumer"},
    )
    assert patch_resp.status_code == 200
    assert patch_resp.json()["data"]["name"] == "Tata Salt Iodized 1kg"

    # 5. Get product details
    get_resp = await client.get(
        f"/api/v1/stores/{store_id}/products/{prod_id}",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert get_resp.status_code == 200
    assert get_resp.json()["data"]["brand"] == "Tata Consumer"

    # 6. Delete product
    del_resp = await client.delete(
        f"/api/v1/stores/{store_id}/products/{prod_id}",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert del_resp.status_code == 200
    assert del_resp.json()["data"]["deleted"] is True

