from pathlib import Path
from typing import Optional

import httpx

from app.core.config import get_settings
from app.core.logging import logger


class StorageAdapter:
    """
    Storage adapter managing private invoice files in Supabase Storage.
    Supports Supabase Storage REST API with local filesystem fallback.
    Conforms to ARCHITECTURE.md Section 8 and DATABASE.md Section 9.
    """

    def __init__(self):
        self.settings = get_settings()
        self.bucket = self.settings.SUPABASE_STORAGE_BUCKET or "invoices"
        self.supabase_url = self.settings.SUPABASE_URL.rstrip("/")
        self.service_role_key = self.settings.SUPABASE_SERVICE_ROLE_KEY
        self.local_storage_dir = Path("storage_uploads")
        self.local_storage_dir.mkdir(parents=True, exist_ok=True)

    def _is_supabase_configured(self) -> bool:
        return bool(
            self.service_role_key
            and not self.service_role_key.startswith("placeholder")
            and self.supabase_url
            and not self.supabase_url.startswith("https://placeholder")
        )

    async def upload_file(self, file_bytes: bytes, storage_key: str, content_type: str) -> str:
        """Upload file bytes to private Supabase Storage bucket with local fallback."""
        local_path = self.local_storage_dir / storage_key
        local_path.parent.mkdir(parents=True, exist_ok=True)
        local_path.write_bytes(file_bytes)

        if not self._is_supabase_configured():
            logger.info("Supabase unconfigured; file saved locally: %s", storage_key)
            return storage_key

        url = f"{self.supabase_url}/storage/v1/object/{self.bucket}/{storage_key}"
        headers = {
            "Authorization": f"Bearer {self.service_role_key}",
            "Content-Type": content_type,
            "x-upsert": "true",
        }

        try:
            async with httpx.AsyncClient(timeout=15.0) as client:
                response = await client.post(url, content=file_bytes, headers=headers)
                if response.status_code in (200, 201):
                    logger.info("Uploaded invoice %s to Supabase Storage", storage_key)
                    return storage_key
                else:
                    logger.warning(
                        "Supabase storage error %s: %s (using local fallback)",
                        response.status_code,
                        response.text[:100],
                    )
        except Exception as exc:
            logger.warning("Supabase storage upload failed: %s (using local fallback)", str(exc))

        return storage_key

    async def get_signed_url(self, storage_key: str, expires_in_seconds: int = 3600) -> str:
        """
        Generate short-lived signed URL for an authorized merchant review.
        Conforms to DATABASE.md Section 9.1.
        """
        if self._is_supabase_configured():
            url = f"{self.supabase_url}/storage/v1/object/sign/{self.bucket}/{storage_key}"
            headers = {
                "Authorization": f"Bearer {self.service_role_key}",
                "Content-Type": "application/json",
            }
            try:
                async with httpx.AsyncClient(timeout=10.0) as client:
                    response = await client.post(
                        url,
                        json={"expiresIn": expires_in_seconds},
                        headers=headers,
                    )
                    if response.status_code == 200:
                        data = response.json()
                        signed_path = data.get("signedURL")
                        if signed_path:
                            return f"{self.supabase_url}/storage/v1{signed_path}"
            except Exception as exc:
                logger.warning("Failed to generate Supabase signed URL: %s", str(exc))

        # Local development / fallback preview endpoint
        return f"/api/v1/invoices/preview/{storage_key}"

    def get_local_file_path(self, storage_key: str) -> Optional[Path]:
        """Return local file path if present on disk."""
        local_path = self.local_storage_dir / storage_key
        if local_path.is_file():
            return local_path
        return None

    async def get_file_bytes(self, storage_key: str) -> Optional[bytes]:
        """Retrieve stored file bytes for extraction or diagnostics."""
        local_path = self.local_storage_dir / storage_key
        if local_path.is_file():
            return local_path.read_bytes()

        if self._is_supabase_configured():
            url = f"{self.supabase_url}/storage/v1/object/authenticated/{self.bucket}/{storage_key}"
            headers = {"Authorization": f"Bearer {self.service_role_key}"}
            try:
                async with httpx.AsyncClient(timeout=20.0) as client:
                    response = await client.get(url, headers=headers)
                    if response.status_code == 200:
                        return response.content
            except Exception as exc:
                logger.warning("Failed to fetch file from Supabase storage: %s", str(exc))

        return None


storage_service = StorageAdapter()
