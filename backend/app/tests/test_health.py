import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_root_endpoint(client: AsyncClient):
    """Test root endpoint provides service status and API links."""
    response = await client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "ShelfSaathi API"
    assert data["status"] == "online"
    assert "docs_url" in data


@pytest.mark.asyncio
async def test_health_check(client: AsyncClient):
    """Test operational health check endpoint."""
    response = await client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}
    assert "X-Request-ID" in response.headers


@pytest.mark.asyncio
async def test_readiness_check(client: AsyncClient):
    """Test operational readiness check endpoint."""
    response = await client.get("/ready")
    assert response.status_code == 200
    assert response.json() == {"status": "ready"}


@pytest.mark.asyncio
async def test_unauthorized_route(client: AsyncClient):
    """Test protected route returns standard error envelope when token is missing."""
    response = await client.get("/api/v1/me")
    assert response.status_code == 401
    payload = response.json()
    assert "error" in payload
    assert payload["error"]["code"] == "UNAUTHORIZED"
    assert "request_id" in payload
