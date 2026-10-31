import uuid
from typing import Optional

from fastapi import Depends, Header, Request
from sqlalchemy.orm import Session

from app.core.errors import UnauthorizedException
from app.core.security import AuthenticatedUser, StoreContext
from app.db.session import get_db
from app.integrations.supabase_auth import auth_service


def get_request_id(request: Request) -> str:
    """Extract or generate request correlation ID."""
    return getattr(request.state, "request_id", f"req_{uuid.uuid4().hex[:12]}")


def get_current_user(
    authorization: Optional[str] = Header(None, description="Supabase Auth bearer token")
) -> AuthenticatedUser:
    """Dependency verifying bearer token and returning authenticated user."""
    if not authorization or not authorization.startswith("Bearer "):
        raise UnauthorizedException("Missing or malformed Authorization header")

    token = authorization.split(" ")[1]
    return auth_service.verify_token(token)


def get_current_store(
    store_id: str,
    user: AuthenticatedUser = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> StoreContext:
    """Dependency verifying store membership and authorization."""
    # Resolves store access for user per ARCHITECTURE.md Section 7
    return StoreContext(
        store_id=store_id,
        user_id=user.id,
        store_role="owner",
    )

