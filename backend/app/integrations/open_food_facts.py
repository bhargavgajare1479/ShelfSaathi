from typing import Any, Optional

import httpx

from app.core.config import get_settings


class OpenFoodFactsClient:
    """Client for optional Open Food Facts barcode lookup."""

    def __init__(self):
        self.settings = get_settings()
        self.enabled = self.settings.OPEN_FOOD_FACTS_ENABLED
        self.base_url = self.settings.OPEN_FOOD_FACTS_BASE_URL

    async def lookup_barcode(self, barcode: str) -> Optional[dict[str, Any]]:
        """Query product data by barcode; returns None when disabled or not found."""
        if not self.enabled:
            return None

        url = f"{self.base_url}/api/v0/product/{barcode}.json"
        try:
            async with httpx.AsyncClient(timeout=5.0) as client:
                resp = await client.get(url)
                if resp.status_code == 200:
                    data = resp.json()
                    if data.get("status") == 1:
                        return data.get("product")
        except httpx.HTTPError:
            # Fall back to None on timeout or network error per ARCHITECTURE.md
            return None
        return None


open_food_facts_client = OpenFoodFactsClient()
