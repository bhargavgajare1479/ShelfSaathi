from fastapi import APIRouter, Depends, Request

from app.api.dependencies import get_current_user, get_request_id
from app.core.security import AuthenticatedUser
from app.schemas.common import SuccessResponse

router = APIRouter(tags=["Authentication & Context"])


@router.get("/me", response_model=SuccessResponse[dict])
async def get_current_user_profile(
    request: Request,
    user: AuthenticatedUser = Depends(get_current_user),
    request_id: str = Depends(get_request_id),
):
    """Return authenticated merchant profile and accessible stores."""
    return SuccessResponse(
        data={
            "id": user.id,
            "email": user.email,
            "role": user.role,
        },
        request_id=request_id,
    )
