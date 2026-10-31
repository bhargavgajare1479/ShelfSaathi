import jwt
import pytest
from httpx import AsyncClient

from app.db.models import (
    Inventory,
    Invoice,
    InvoiceLine,
    Product,
    PurchaseOrderDraft,
    PurchaseOrderLine,
    SalesRecord,
    StockMovement,
    Store,
    StoreMember,
)


def create_test_token(
    user_id: str = "11111111-1111-1111-1111-111111111111",
    email: str = "test@kirana.store",
):
    from app.core.config import get_settings
    secret = get_settings().SUPABASE_JWT_SECRET or "a-secret-key-that-is-at-least-32-bytes-long"
    claims = {"sub": user_id, "email": email, "role": "authenticated"}
    return jwt.encode(claims, secret, algorithm="HS256")


def test_models_metadata_registered():
    """Verify that all core entities from DATABASE.md are defined in SQLAlchemy metadata."""
    models = [
        Store,
        StoreMember,
        Product,
        Inventory,
        Invoice,
        InvoiceLine,
        StockMovement,
        PurchaseOrderDraft,
        PurchaseOrderLine,
        SalesRecord,
    ]
    registered_tables = {table.name for table in Store.metadata.tables.values()}
    for model in models:
        assert model.__tablename__ in registered_tables, f"Missing table: {model.__tablename__}"


@pytest.mark.asyncio
async def test_store_members_unauthorized(client: AsyncClient):
    """Test accessing store members without authentication token fails."""
    store_id = "00000000-0000-0000-0000-000000000001"
    response = await client.get(f"/api/v1/stores/{store_id}/members")
    assert response.status_code == 401
    assert response.json()["error"]["code"] == "UNAUTHORIZED"


@pytest.mark.asyncio
async def test_get_me_authenticated(client: AsyncClient):
    """Test /api/v1/me returns user details and store memberships when authenticated."""
    token = create_test_token()
    response = await client.get("/api/v1/me", headers={"Authorization": f"Bearer {token}"})
    assert response.status_code == 200
    data = response.json()["data"]
    assert data["email"] == "test@kirana.store"
    assert "stores" in data
    assert isinstance(data["stores"], list)


@pytest.mark.asyncio
async def test_list_stores_authenticated(client: AsyncClient):
    """Test /api/v1/stores returns authorized stores."""
    token = create_test_token()
    response = await client.get("/api/v1/stores", headers={"Authorization": f"Bearer {token}"})
    assert response.status_code == 200
    data = response.json()["data"]
    assert isinstance(data, list)
