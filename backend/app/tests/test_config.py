from app.core.config import get_settings


def test_settings_defaults():
    """Verify default configuration values."""
    settings = get_settings()
    assert settings.APP_ENV in ["development", "test", "production"]
    assert settings.API_V1_PREFIX == "/api/v1"
    assert "http://localhost:5173" in settings.cors_origins
    assert settings.SUPABASE_STORAGE_BUCKET == "invoices"
    assert settings.AI_PROVIDER == "gemini"

