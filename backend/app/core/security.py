from typing import Optional

from pydantic import BaseModel, Field


class AuthenticatedUser(BaseModel):
    id: str = Field(description="Supabase user UUID")
    email: Optional[str] = Field(default=None, description="User email address")
    role: str = Field(default="authenticated", description="Auth role")


class StoreContext(BaseModel):
    store_id: str = Field(description="Active store UUID")
    user_id: str = Field(description="User UUID")
    store_role: str = Field(default="owner", description="Role within the active store")

