from fastapi import APIRouter, Depends, Query

from app.api.dependencies import get_current_user, get_request_id
from app.core.security import AuthenticatedUser
from app.schemas.common import PaginatedResponse, PaginationMeta

router = APIRouter(prefix="/purchase-order-drafts", tags=["Purchase Order Drafts"])


@router.get("", response_model=PaginatedResponse[dict])
async def list_purchase_order_drafts(
    store_id: str = Query(..., description="Store UUID"),
    limit: int = Query(25, ge=1, le=100),
    user: AuthenticatedUser = Depends(get_current_user),
    request_id: str = Depends(get_request_id),
):
    """Retrieve editable purchase order drafts for merchant review."""
    return PaginatedResponse(
        data=[],
        pagination=PaginationMeta(limit=limit, next_cursor=None),
        request_id=request_id,
    )
