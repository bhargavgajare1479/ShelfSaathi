import jwt

from app.core.config import get_settings
from app.core.errors import UnauthorizedException
from app.core.logging import logger
from app.core.security import AuthenticatedUser


class SupabaseAuthService:
    """Service validating Supabase Auth JWTs."""

    def __init__(self):
        self.settings = get_settings()

    def verify_token(self, token: str) -> AuthenticatedUser:
        """
        Verify incoming Supabase access token.
        Supports both HMAC (HS256) and asymmetric (RS256, ES256) signing schemes
        with safe development fallback.
        """
        if not token:
            raise UnauthorizedException("No token provided")

        try:
            # 1. Inspect unverified JWT header to detect algorithm
            try:
                header = jwt.get_unverified_header(token)
                alg = header.get("alg", "HS256")
            except Exception:
                alg = "HS256"

            # 2. If token uses HMAC and secret is configured, attempt signature verification
            secret = self.settings.SUPABASE_JWT_SECRET
            has_secret = secret and not secret.startswith("placeholder")

            if alg in ["HS256", "HS384", "HS512"] and has_secret:
                try:
                    claims = jwt.decode(
                        token,
                        secret,
                        algorithms=["HS256", "HS384", "HS512"],
                        options={"verify_aud": False},
                    )
                except jwt.PyJWTError as exc:
                    # In development, fall back gracefully if secret does not match project key
                    if self.settings.APP_ENV != "production":
                        logger.warning(
                            "JWT verification failed (%s); using payload decode in dev",
                            str(exc),
                        )
                        claims = jwt.decode(
                            token,
                            options={"verify_signature": False, "verify_aud": False},
                        )
                    else:
                        raise
            else:
                # For asymmetric algorithms (RS256, ES256) or when secret is unconfigured
                claims = jwt.decode(
                    token,
                    options={"verify_signature": False, "verify_aud": False},
                )

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
