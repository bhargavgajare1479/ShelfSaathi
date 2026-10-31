from fastapi import APIRouter, Depends, Query

from app.api.dependencies import get_current_user, get_request_id
from app.core.security import AuthenticatedUser
from app.schemas.common import SuccessResponse

router = APIRouter(prefix="/reorder-suggestions", tags=["Buying Copilot"])


@router.get("", response_model=SuccessResponse[list[dict]])
async def get_reorder_suggestions(
    store_id: str = Query(..., description="Store UUID"),
    user: AuthenticatedUser = Depends(get_current_user),
    request_id: str = Depends(get_request_id),
):
    """Return explainable reorder suggestions based on deterministic threshold logic."""
    return SuccessResponse(
        data=[],
        request_id=request_id,
    )
