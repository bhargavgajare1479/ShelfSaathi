import pytest
from httpx import AsyncClient

from app.tests.test_store_roles import create_test_token


@pytest.mark.asyncio
async def test_barcode_lookup_and_generation(client: AsyncClient):
    token = create_test_token()

    # Create store
    store_resp = await client.post(
        "/api/v1/stores",
        headers={"Authorization": f"Bearer {token}"},
        json={"name": "Barcode Store"},
    )
    store_id = store_resp.json()["data"]["id"]

    # 1. Lookup barcode not in catalogue
    missing_resp = await client.get(
        f"/api/v1/stores/{store_id}/barcodes/lookup?barcode=999999999999",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert missing_resp.status_code == 200
    assert missing_resp.json()["data"]["found_in_catalogue"] is False

    # 2. Generate custom barcode
    gen_resp = await client.post(
        f"/api/v1/stores/{store_id}/barcodes/generate",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert gen_resp.status_code == 200
    gen_barcode = gen_resp.json()["data"]["barcode"]
    assert gen_barcode.startswith("20")

    # 3. Register product with this generated barcode
    await client.post(
        f"/api/v1/stores/{store_id}/products",
        headers={"Authorization": f"Bearer {token}"},
        json={
            "name": "Loose Basmati Rice 1kg",
            "barcode": gen_barcode,
            "unit": "kg",
            "initial_stock": 10.0,
        },
    )

    # 4. Lookup barcode again - now found!
    found_resp = await client.get(
        f"/api/v1/stores/{store_id}/barcodes/lookup?barcode={gen_barcode}",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert found_resp.status_code == 200
    assert found_resp.json()["data"]["found_in_catalogue"] is True
    assert found_resp.json()["data"]["product"]["name"] == "Loose Basmati Rice 1kg"
    assert found_resp.json()["data"]["product"]["quantity_on_hand"] == 10.0

