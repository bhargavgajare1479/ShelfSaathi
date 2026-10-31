
from fastapi import APIRouter, Depends

from app.api.dependencies import get_current_user, get_request_id
from app.core.security import AuthenticatedUser
from app.schemas.common import SuccessResponse

router = APIRouter(prefix="/stores", tags=["Stores"])


@router.get("", response_model=SuccessResponse[list[dict]])
async def list_user_stores(
    user: AuthenticatedUser = Depends(get_current_user),
    request_id: str = Depends(get_request_id),
):
    """List stores accessible by the authenticated user."""
    return SuccessResponse(
        data=[],
        request_id=request_id,
    )

