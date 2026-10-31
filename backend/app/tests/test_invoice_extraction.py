import uuid
from io import BytesIO

import pytest
from httpx import AsyncClient
from PIL import Image

from app.db.models import Product, Store
from app.modules.invoices.matching import match_line_to_catalogue
from app.tests.conftest import TestingSessionLocal
from app.tests.test_store_roles import create_test_token


def create_sample_png() -> bytes:
    """Generate minimal valid PNG image bytes for upload testing."""
    img = Image.new("RGB", (100, 100), color=(255, 255, 255))
    buf = BytesIO()
    img.save(buf, format="PNG")
    return buf.getvalue()


def test_rapidfuzz_catalogue_matching():
    """Verify deterministic catalogue matching pipeline with RapidFuzz."""
    store_id = uuid.uuid4()
    p1 = Product(
        id=uuid.uuid4(),
        store_id=store_id,
        name="Aashirvaad Superior MP Atta 10kg",
        brand="Aashirvaad",
        barcode="8901030383748",
        unit="pack",
    )
    p2 = Product(
        id=uuid.uuid4(),
        store_id=store_id,
        name="Fortune Sunlite Refined Sunflower Oil 1L",
        brand="Fortune",
        barcode="8906007280014",
        unit="bottle",
    )
    p3 = Product(
        id=uuid.uuid4(),
        store_id=store_id,
        name="Tata Salt Iodized 1kg",
        brand="Tata",
        barcode="8901725181222",
        unit="pack",
    )
    catalogue = [p1, p2, p3]

    # 1. Exact barcode match
    m_bc = match_line_to_catalogue("Refined Oil 8906007280014 pouch", catalogue)
    assert m_bc.product == p2
    assert m_bc.confidence == 1.0
    assert m_bc.review_status == "matched"
    assert m_bc.match_type == "exact_barcode"

    # 2. Exact name match
    m_exact = match_line_to_catalogue("tata salt iodized 1kg", catalogue)
    assert m_exact.product == p3
    assert m_exact.confidence == 1.0
    assert m_exact.review_status == "matched"

    # 3. Fuzzy high confidence match
    m_fuzzy = match_line_to_catalogue("Aashirvaad Atta 10 kg MRP 420", catalogue)
    assert m_fuzzy.product == p1
    assert m_fuzzy.confidence >= 0.75
    assert m_fuzzy.review_status == "matched"

    # 4. Unknown product
    m_new = match_line_to_catalogue("Colgate MaxFresh Blue Gel Toothpaste 150g", catalogue)
    assert m_new.product is None
    assert m_new.review_status == "new_product"


@pytest.mark.asyncio
async def test_upload_invoice_intake(client: AsyncClient):
    """Test invoice intake, storage key assignment, and extraction response."""
    store_id = str(uuid.uuid4())
    store_uuid = uuid.UUID(store_id)
    token = create_test_token()
    image_bytes = create_sample_png()

    db = TestingSessionLocal()
    db.add(Store(id=store_uuid, name="Gupta Kirana Store"))
    db.commit()
    db.close()

    files = {"file": ("test_invoice.png", image_bytes, "image/png")}
    response = await client.post(
        f"/api/v1/stores/{store_id}/invoices",
        files=files,
        headers={"Authorization": f"Bearer {token}"},
    )

    assert response.status_code == 201
    data = response.json()["data"]
    assert data["store_id"] == store_id
    assert data["status"] == "review_required"
    assert "storage_key" in data
    assert data["storage_key"].startswith(f"invoices/{store_id}/")
    assert len(data["lines"]) > 0
    assert "signed_url" in data


@pytest.mark.asyncio
async def test_upload_invalid_file_rejected(client: AsyncClient):
    """Test non-allowed file type upload is rejected with validation error."""
    store_id = str(uuid.uuid4())
    token = create_test_token()

    files = {"file": ("bad_script.sh", b"#!/bin/bash\necho bad", "text/x-shellscript")}
    response = await client.post(
        f"/api/v1/stores/{store_id}/invoices",
        files=files,
        headers={"Authorization": f"Bearer {token}"},
    )

    assert response.status_code == 422
    assert response.json()["error"]["code"] == "VALIDATION_ERROR"


@pytest.mark.asyncio
async def test_list_and_update_invoice_lines(client: AsyncClient):
    """Test listing invoices and updating an extracted line item."""
    store_id = str(uuid.uuid4())
    store_uuid = uuid.UUID(store_id)
    token = create_test_token()
    image_bytes = create_sample_png()

    db = TestingSessionLocal()
    db.add(Store(id=store_uuid, name="Gupta Kirana Store"))
    db.commit()
    db.close()

    # 1. Upload invoice
    upload_res = await client.post(
        f"/api/v1/stores/{store_id}/invoices",
        files={"file": ("bill.png", image_bytes, "image/png")},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert upload_res.status_code == 201
    invoice = upload_res.json()["data"]
    invoice_id = invoice["id"]
    line = invoice["lines"][0]
    line_id = line["id"]

    # 2. Get invoice details
    get_res = await client.get(
        f"/api/v1/stores/{store_id}/invoices/{invoice_id}",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert get_res.status_code == 200
    assert get_res.json()["data"]["id"] == invoice_id

    # 3. Patch line item
    patch_res = await client.patch(
        f"/api/v1/stores/{store_id}/invoices/{invoice_id}/lines/{line_id}",
        json={"quantity": 15.0, "unit_cost": 42.5, "review_status": "matched"},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert patch_res.status_code == 200
    patched_line = patch_res.json()["data"]
    assert patched_line["quantity"] == 15.0
    assert patched_line["unit_cost"] == 42.5
    assert patched_line["line_total"] == 15.0 * 42.5
    assert patched_line["review_status"] == "matched"
