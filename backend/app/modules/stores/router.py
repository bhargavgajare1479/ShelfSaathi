import uuid

from fastapi import APIRouter, Depends, status
from pydantic import BaseModel, Field
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.dependencies import (
    get_current_store,
    get_current_user,
    get_db,
    get_request_id,
    require_store_role,
)
from app.core.errors import ConflictException, NotFoundException
from app.core.security import AuthenticatedUser, StoreContext, StoreRole
from app.db.models import Store, StoreMember
from app.schemas.common import SuccessResponse

router = APIRouter(prefix="/stores", tags=["Stores & Membership"])


class StoreCreateRequest(BaseModel):
    name: str = Field(min_length=1, max_length=100, description="Display name of the Kirana store")


class StoreMemberCreateRequest(BaseModel):
    user_id: str = Field(description="User UUID to add to store")
    role: StoreRole = Field(default=StoreRole.STAFF, description="Store role (owner or staff)")


@router.get("", response_model=SuccessResponse[list[dict]])
async def list_user_stores(
    user: AuthenticatedUser = Depends(get_current_user),
    db: Session = Depends(get_db),
    request_id: str = Depends(get_request_id),
):
    """List stores accessible by the authenticated user with assigned role."""
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
        pass

    return SuccessResponse(data=stores_data, request_id=request_id)


@router.post(
    "",
    status_code=status.HTTP_201_CREATED,
    response_model=SuccessResponse[dict],
)
async def create_store(
    payload: StoreCreateRequest,
    user: AuthenticatedUser = Depends(get_current_user),
    db: Session = Depends(get_db),
    request_id: str = Depends(get_request_id),
):
    """
    Create a new store workspace and automatically assign the creator as 'owner'.
    Enforces atomic store creation and ownership assignment.
    """
    user_uuid = uuid.UUID(user.id)
    new_store = Store(name=payload.name)
    db.add(new_store)
    db.flush()

    membership = StoreMember(
        store_id=new_store.id,
        user_id=user_uuid,
        role=StoreRole.OWNER.value,
    )
    db.add(membership)
    db.commit()
    db.refresh(new_store)

    return SuccessResponse(
        data={
            "id": str(new_store.id),
            "name": new_store.name,
            "role": StoreRole.OWNER.value,
            "created_at": new_store.created_at.isoformat(),
        },
        request_id=request_id,
    )


@router.get("/{store_id}", response_model=SuccessResponse[dict])
async def get_store_details(
    store_id: str,
    context: StoreContext = Depends(get_current_store),
    db: Session = Depends(get_db),
    request_id: str = Depends(get_request_id),
):
    """Retrieve details for a specific authorized store."""
    store = db.get(Store, uuid.UUID(store_id))
    if not store:
        raise NotFoundException("Store not found")

    return SuccessResponse(
        data={
            "id": str(store.id),
            "name": store.name,
            "role": context.store_role.value,
            "created_at": store.created_at.isoformat(),
        },
        request_id=request_id,
    )


@router.get("/{store_id}/members", response_model=SuccessResponse[list[dict]])
async def list_store_members(
    store_id: str,
    context: StoreContext = Depends(require_store_role(StoreRole.STAFF)),
    db: Session = Depends(get_db),
    request_id: str = Depends(get_request_id),
):
    """List staff and owners for a store."""
    members_data = []
    try:
        stmt = select(StoreMember).where(StoreMember.store_id == uuid.UUID(store_id))
        members = db.scalars(stmt).all()
        for member in members:
            members_data.append(
                {
                    "id": str(member.id),
                    "user_id": str(member.user_id),
                    "role": member.role,
                    "created_at": member.created_at.isoformat(),
                }
            )
    except Exception:
        pass

    return SuccessResponse(data=members_data, request_id=request_id)


@router.post(
    "/{store_id}/members",
    status_code=status.HTTP_201_CREATED,
    response_model=SuccessResponse[dict],
)
async def add_store_member(
    store_id: str,
    payload: StoreMemberCreateRequest,
    context: StoreContext = Depends(require_store_role(StoreRole.OWNER)),
    db: Session = Depends(get_db),
    request_id: str = Depends(get_request_id),
):
    """Add or invite a staff member to a store. Restricted to Store Owners."""
    target_user_uuid = uuid.UUID(payload.user_id)
    store_uuid = uuid.UUID(store_id)

    # Check if membership already exists
    existing = db.scalars(
        select(StoreMember).where(
            StoreMember.store_id == store_uuid,
            StoreMember.user_id == target_user_uuid,
        )
    ).first()
    if existing:
        raise ConflictException("User is already a member of this store")

    new_member = StoreMember(
        store_id=store_uuid,
        user_id=target_user_uuid,
        role=payload.role.value,
    )
    db.add(new_member)
    db.commit()
    db.refresh(new_member)

    return SuccessResponse(
        data={
            "id": str(new_member.id),
            "store_id": str(new_member.store_id),
            "user_id": str(new_member.user_id),
            "role": new_member.role,
            "created_at": new_member.created_at.isoformat(),
        },
        request_id=request_id,
    )


@router.post("/{store_id}/seed", response_model=SuccessResponse[dict])
async def seed_demo_data(
    store_id: str,
    context: StoreContext = Depends(require_store_role(StoreRole.OWNER)),
    db: Session = Depends(get_db),
    request_id: str = Depends(get_request_id),
):
    """
    Seed realistic Indian Kirana retail products, barcodes, and sales history.
    Restricted to Store Owners. Conforms to DATABASE.md Section 11.
    """
    from app.db.seed import seed_store_demo_data

    store_uuid = uuid.UUID(store_id)
    summary = seed_store_demo_data(store_uuid, db)
    return SuccessResponse(data=summary, request_id=request_id)
