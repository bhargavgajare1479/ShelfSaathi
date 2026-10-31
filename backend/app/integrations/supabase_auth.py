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
        Uses SUPABASE_JWT_SECRET for signature verification when provided,
        with development decoding fallback.
        """
        if not token:
            raise UnauthorizedException("No token provided")

        try:
            if self.settings.SUPABASE_JWT_SECRET:
                claims = jwt.decode(
                    token,
                    self.settings.SUPABASE_JWT_SECRET,
                    algorithms=["HS256"],
                    options={"verify_aud": False},
                )
            else:
                claims = jwt.decode(token, options={"verify_signature": False})

            user_id = claims.get("sub")
            if not user_id:
                raise UnauthorizedException("Invalid token claims: missing subject")

            return AuthenticatedUser(
                id=user_id,
                email=claims.get("email"),
                role=claims.get("role", "authenticated"),
            )
        except jwt.PyJWTError as exc:
            raise UnauthorizedException(f"Token validation failed: {str(exc)}") from exc


auth_service = SupabaseAuthService()
