from functools import lru_cache
from pathlib import Path
from typing import Optional

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict

BACKEND_DIR = Path(__file__).resolve().parent.parent.parent
ROOT_DIR = BACKEND_DIR.parent


class Settings(BaseSettings):
    """
    ShelfSaathi Application Settings.
    Environment variable loader conforming to ARCHITECTURE.md and API.md.
    """

    model_config = SettingsConfigDict(
        env_file=(
            str(BACKEND_DIR / ".env"),
            str(ROOT_DIR / ".env"),
            ".env",
        ),
        env_file_encoding="utf-8",
        extra="ignore",
    )

    APP_ENV: str = Field(default="development", description="Runtime environment")
    API_V1_PREFIX: str = Field(default="/api/v1", description="API route prefix")
    FRONTEND_ORIGINS: str = Field(
        default="http://localhost:5173,http://localhost:3000,http://127.0.0.1:5173,http://127.0.0.1:3000,https://shelf-saathi-77pj.vercel.app",
        description="Allowed frontend origins for CORS",
    )

    # Database
    DATABASE_URL: str = Field(
        default="postgresql://postgres:postgres@localhost:5432/shelfsaathi",
        description="PostgreSQL connection string",
    )

    # Supabase Auth and Storage
    SUPABASE_URL: str = Field(
        default="https://placeholder-project.supabase.co",
        description="Supabase project URL",
    )
    SUPABASE_JWT_ISSUER: str = Field(
        default="https://placeholder-project.supabase.co/auth/v1",
        description="Expected JWT issuer",
    )
    SUPABASE_JWKS_URL: Optional[str] = Field(
        default=None,
        description="Supabase JWKS endpoint for token validation",
    )
    SUPABASE_JWT_SECRET: Optional[str] = Field(
        default=None,
        description="Supabase JWT secret for HS256 signature verification",
    )
    SUPABASE_SERVICE_ROLE_KEY: Optional[str] = Field(
        default=None,
        description="Service role key for server-side privileged storage operations",
    )
    SUPABASE_STORAGE_BUCKET: str = Field(
        default="invoices",
        description="Private invoice storage bucket",
    )

    # AI Vision and Extraction Provider
    AI_PROVIDER: str = Field(default="gemini", description="Selected AI vision provider")
    AI_PROVIDER_API_KEY: Optional[str] = Field(
        default=None,
        description="AI provider API key",
    )
    AI_MODEL: str = Field(default="gemini-flash-lite-latest", description="Vision model identifier")
    AI_REQUEST_TIMEOUT_SECONDS: int = Field(default=30, description="AI request timeout")
    AI_MAX_RETRIES: int = Field(default=2, description="Bounded retries for AI calls")

    # External Product Lookup
    OPEN_FOOD_FACTS_ENABLED: bool = Field(default=False, description="Open Food Facts toggle")
    OPEN_FOOD_FACTS_BASE_URL: str = Field(
        default="https://world.openfoodfacts.org",
        description="Open Food Facts API base URL",
    )

    # Observability and Security Controls
    LOG_LEVEL: str = Field(default="INFO", description="Application log level")
    RATE_LIMIT_ENABLED: bool = Field(default=False, description="Rate limiting toggle")
    RATE_LIMIT_STORE_URL: Optional[str] = Field(
        default=None,
        description="Optional shared rate-limit store URL",
    )

    @property
    def cors_origins(self) -> list[str]:
        return [origin.strip() for origin in self.FRONTEND_ORIGINS.split(",") if origin.strip()]


@lru_cache
def get_settings() -> Settings:
    """Return cached settings instance."""
    return Settings()
