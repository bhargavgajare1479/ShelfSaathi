import uuid

from fastapi import APIRouter, Depends, Request
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.dependencies import get_current_user, get_db, get_request_id
from app.core.security import AuthenticatedUser
from app.db.models import Store, StoreMember
from app.schemas.common import SuccessResponse

router = APIRouter(tags=["Authentication & Context"])


@router.get("/me", response_model=SuccessResponse[dict])
async def get_current_user_profile(
    request: Request,
    user: AuthenticatedUser = Depends(get_current_user),
    db: Session = Depends(get_db),
    request_id: str = Depends(get_request_id),
):
    """
    Return authenticated merchant profile and accessible stores with assigned roles.
    Conforms to API.md Section 4.2.
    """
    stores_data = []
    try:
        user_uuid = uuid.UUID(user.id)
        stmt = (
            select(Store, StoreMember.role)
            .join(StoreMember, Store.id == StoreMember.store_id)
            .where(StoreMember.user_id == user_uuid)
        )
        results = db.execute(stmt).all()
        for store_entity, role in results:
            stores_data.append(
                {
                    "id": str(store_entity.id),
                    "name": store_entity.name,
                    "role": role,
                    "created_at": (
                        store_entity.created_at.isoformat() if store_entity.created_at else None
                    ),
                }
            )
    except Exception:
        # Graceful handling when database tables are uninitialized
        pass

    return SuccessResponse(
        data={
            "id": user.id,
            "email": user.email,
            "role": user.role,
            "stores": stores_data,
        },
        request_id=request_id,
    )
