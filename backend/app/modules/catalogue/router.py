from typing import Optional

from fastapi import APIRouter, Depends, Query

from app.api.dependencies import get_current_user, get_request_id
from app.core.security import AuthenticatedUser
from app.schemas.common import PaginatedResponse, PaginationMeta

router = APIRouter(prefix="/products", tags=["Catalogue & Products"])


@router.get("", response_model=PaginatedResponse[dict])
async def list_products(
    store_id: str = Query(..., description="Store UUID"),
    search: Optional[str] = Query(None, description="Optional search term"),
    limit: int = Query(25, ge=1, le=100),
    cursor: Optional[str] = Query(None),
    user: AuthenticatedUser = Depends(get_current_user),
    request_id: str = Depends(get_request_id),
):
    """List and search store catalogue products."""
    return PaginatedResponse(
        data=[],
        pagination=PaginationMeta(limit=limit, next_cursor=None),
        request_id=request_id,
    )

