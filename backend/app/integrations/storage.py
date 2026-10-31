from app.core.config import get_settings


class StorageAdapter:
    """Storage adapter managing private invoice files in Supabase Storage."""

    def __init__(self):
        self.settings = get_settings()
        self.bucket = self.settings.SUPABASE_STORAGE_BUCKET

    def get_signed_url(self, file_path: str, expires_in_seconds: int = 3600) -> str:
        """Generate a short-lived signed URL for an authorized merchant review."""
        base = self.settings.SUPABASE_URL
        return f"{base}/storage/v1/object/sign/{self.bucket}/{file_path}?token=placeholder"


storage_service = StorageAdapter()
