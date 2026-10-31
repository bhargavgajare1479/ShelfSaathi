from fastapi import APIRouter, Depends, status
from pydantic import BaseModel, Field

from app.api.dependencies import get_current_user, get_request_id, require_store_role
from app.core.security import AuthenticatedUser, StoreContext, StoreRole
from app.schemas.common import SuccessResponse

router = APIRouter(prefix="/stores", tags=["Stores & Membership"])


class StoreMemberCreateRequest(BaseModel):
    user_id: str = Field(description="User UUID to add to store")
    role: StoreRole = Field(default=StoreRole.STAFF, description="Store role (owner or staff)")


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


@router.get("/{store_id}/members", response_model=SuccessResponse[list[dict]])
async def list_store_members(
    store_id: str,
    context: StoreContext = Depends(require_store_role(StoreRole.STAFF)),
    request_id: str = Depends(get_request_id),
):
    """List staff and owners for a store."""
    return SuccessResponse(
        data=[],
        request_id=request_id,
    )


@router.post(
    "/{store_id}/members",
    status_code=status.HTTP_201_CREATED,
    response_model=SuccessResponse[dict],
)
async def add_store_member(
    store_id: str,
    payload: StoreMemberCreateRequest,
    context: StoreContext = Depends(require_store_role(StoreRole.OWNER)),
    request_id: str = Depends(get_request_id),
):
    """Add or invite a staff member to a store. Restricted to Store Owners."""
    return SuccessResponse(
        data={
            "store_id": store_id,
            "user_id": payload.user_id,
            "role": payload.role.value,
        },
        request_id=request_id,
    )
