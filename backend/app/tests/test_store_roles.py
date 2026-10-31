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
