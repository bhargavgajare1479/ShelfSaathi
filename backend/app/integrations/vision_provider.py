from abc import ABC, abstractmethod
from typing import Any

from app.core.config import get_settings


class VisionProviderInterface(ABC):
    """Abstract interface for AI invoice extraction provider."""

    @abstractmethod
    async def extract_invoice(self, image_bytes: bytes, content_type: str) -> dict[str, Any]:
        """Extract structured line items and candidate fields from an invoice image."""
        pass


class GeminiVisionAdapter(VisionProviderInterface):
    """Adapter for Google Gemini Vision extraction."""

    def __init__(self):
        self.settings = get_settings()

    async def extract_invoice(self, image_bytes: bytes, content_type: str) -> dict[str, Any]:
        # Adapter boundary to invoke Gemini API with schema validation
        return {
            "invoice_number": None,
            "invoice_date": None,
            "lines": [],
            "confidence": 0.0,
        }


def get_vision_provider() -> VisionProviderInterface:
    """Factory returning configured vision provider adapter."""
    return GeminiVisionAdapter()

