from enum import Enum
from typing import Optional

from pydantic import BaseModel, Field


class StoreRole(str, Enum):
    """Store membership roles conforming to PRD and DATABASE.md."""

    OWNER = "owner"
    STAFF = "staff"


class AuthenticatedUser(BaseModel):
    id: str = Field(description="Supabase user UUID")
    email: Optional[str] = Field(default=None, description="User email address")
    role: str = Field(default="authenticated", description="Global auth role")


class StoreContext(BaseModel):
    store_id: str = Field(description="Active store UUID")
    user_id: str = Field(description="User UUID")
    store_role: StoreRole = Field(
        default=StoreRole.OWNER,
        description="Role within the active store (owner or staff)",
    )

    @property
    def is_owner(self) -> bool:
        return self.store_role == StoreRole.OWNER

    @property
    def is_staff(self) -> bool:
        return self.store_role in [StoreRole.OWNER, StoreRole.STAFF]
