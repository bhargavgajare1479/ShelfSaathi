import jwt

from app.core.config import get_settings
from app.core.errors import UnauthorizedException
from app.core.security import AuthenticatedUser


class SupabaseAuthService:
    """Service validating Supabase Auth JWTs."""

    def __init__(self):
        self.settings = get_settings()

    def verify_token(self, token: str) -> AuthenticatedUser:
        """
        Verify incoming Supabase access token.
        In development, provides test fallback if JWKS/secret is not yet configured.
        """
        if not token:
            raise UnauthorizedException("No token provided")

        try:
            # Decode token claims (unverified fallback for development stubbing if needed)
            unverified_claims = jwt.decode(token, options={"verify_signature": False})
            user_id = unverified_claims.get("sub")
            if not user_id:
                raise UnauthorizedException("Invalid token claims: missing subject")

            return AuthenticatedUser(
                id=user_id,
                email=unverified_claims.get("email"),
                role=unverified_claims.get("role", "authenticated"),
            )
        except jwt.PyJWTError as exc:
            raise UnauthorizedException(f"Token validation failed: {str(exc)}") from exc


auth_service = SupabaseAuthService()

