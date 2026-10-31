import base64
import json
from abc import ABC, abstractmethod
from typing import Optional

import httpx
from pydantic import BaseModel, Field

from app.core.config import get_settings
from app.core.logging import logger


class ExtractedLineItem(BaseModel):
    raw_description: str = Field(description="Extracted item text")
    quantity: Optional[float] = Field(default=None, description="Extracted quantity")
    unit: Optional[str] = Field(default=None, description="Base unit e.g. kg, pcs, pack")
    unit_cost: Optional[float] = Field(default=None, description="Unit cost/price")
    line_total: Optional[float] = Field(default=None, description="Line total amount")
    confidence: Optional[float] = Field(default=None, description="Extraction confidence score")


class ExtractedInvoice(BaseModel):
    invoice_number: Optional[str] = Field(default=None, description="Supplier invoice number")
    invoice_date: Optional[str] = Field(default=None, description="Invoice date in ISO format")
    supplier_name: Optional[str] = Field(default=None, description="Detected supplier name")
    lines: list[ExtractedLineItem] = Field(default_factory=list, description="Extracted line items")
    confidence: float = Field(default=0.0, description="Overall document extraction confidence")


class VisionProviderInterface(ABC):
    """Abstract interface for AI invoice extraction provider."""

    @abstractmethod
    async def extract_invoice(self, image_bytes: bytes, content_type: str) -> ExtractedInvoice:
        """Extract structured line items and candidate fields from an invoice image."""
        pass


class GeminiVisionAdapter(VisionProviderInterface):
    """
    Adapter implementing invoice extraction using Google Gemini Vision API.
    Conforms to ARCHITECTURE.md Section 9 and Section 13.
    """

    def __init__(self):
        self.settings = get_settings()
        self.model = self.settings.AI_MODEL or "gemini-1.5-flash"
        self.api_key = self.settings.AI_PROVIDER_API_KEY
        self.timeout = self.settings.AI_REQUEST_TIMEOUT_SECONDS

    async def extract_invoice(self, image_bytes: bytes, content_type: str) -> ExtractedInvoice:
        """
        Sends image to Gemini generateContent endpoint requesting structured JSON.
        Falls back to safe empty candidate extraction when API key is unconfigured.
        """
        if not self.api_key or self.api_key.startswith("placeholder"):
            logger.info("Gemini API key unconfigured; returning empty extraction candidate")
            return ExtractedInvoice(
                invoice_number=None,
                invoice_date=None,
                supplier_name=None,
                lines=[],
                confidence=0.0,
            )

        encoded_image = base64.b64encode(image_bytes).decode("utf-8")
        url = (
            f"https://generativelanguage.googleapis.com/v1beta/models/"
            f"{self.model}:generateContent?key={self.api_key}"
        )

        prompt = (
            "You are an expert OCR invoice extraction engine for retail kirana stores. "
            "Extract all line items from this supplier bill. For each line, return: "
            "raw_description (clean product name/brand/size), quantity (numeric), "
            "unit (e.g. 'pcs', 'kg', 'pack'), unit_cost (numeric), line_total (numeric), "
            "and confidence (0.0 to 1.0). "
            "Also extract invoice_number, invoice_date, and supplier_name. "
            "Return valid JSON matching this schema."
        )

        payload = {
            "contents": [
                {
                    "parts": [
                        {"text": prompt},
                        {
                            "inline_data": {
                                "mime_type": content_type,
                                "data": encoded_image,
                            }
                        },
                    ]
                }
            ],
            "generationConfig": {
                "response_mime_type": "application/json",
                "temperature": 0.1,
            },
        }

        try:
            async with httpx.AsyncClient(timeout=float(self.timeout)) as client:
                response = await client.post(url, json=payload)
                if response.status_code != 200:
                    logger.error(
                        "Gemini API returned status %s: %s",
                        response.status_code,
                        response.text[:200],
                    )
                    return ExtractedInvoice(confidence=0.0)

                data = response.json()
                text_content = (
                    data.get("candidates", [{}])[0]
                    .get("content", {})
                    .get("parts", [{}])[0]
                    .get("text", "{}")
                )
                parsed = json.loads(text_content)
                return ExtractedInvoice(**parsed)
        except Exception as exc:
            logger.exception("Failed to extract invoice via Gemini: %s", str(exc))
            return ExtractedInvoice(confidence=0.0)


def get_vision_provider() -> VisionProviderInterface:
    """Factory returning configured Gemini vision provider adapter."""
    return GeminiVisionAdapter()
