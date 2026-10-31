from typing import Optional

import httpx

from app.core.config import get_settings
from app.core.logging import logger


class OpenFoodFactsClient:
    """
    Client for Open Food Facts product database.
    Provides external product enrichment for manufacturer barcodes (EAN-13, UPC).
    Conforms to ARCHITECTURE.md Section 11.3 and API.md Section 6.5.
    """

    def __init__(self):
        self.settings = get_settings()
        self.base_url = self.settings.OPEN_FOOD_FACTS_BASE_URL.rstrip("/")
        self.enabled = self.settings.OPEN_FOOD_FACTS_ENABLED

    async def lookup(self, barcode: str) -> Optional[dict]:
        """
        Query Open Food Facts by barcode.
        Returns parsed product metadata or None if disabled, not found, or timeout.
        """
        if not self.enabled or not barcode:
            return None

        clean_code = barcode.strip()
        url = f"{self.base_url}/api/v2/product/{clean_code}.json"

        try:
            async with httpx.AsyncClient(timeout=4.0) as client:
                resp = await client.get(
                    url,
                    headers={"User-Agent": "ShelfSaathi/0.1.0 (kirana-assistant-prototype)"},
                )
                if resp.status_code != 200:
                    return None

                data = resp.json()
                if data.get("status") != 1 or "product" not in data:
                    return None

                p = data["product"]
                name = p.get("product_name_en") or p.get("product_name")
                brand = p.get("brands")
                quantity_str = p.get("quantity")

                if not name:
                    return None

                return {
                    "name": name.strip(),
                    "brand": brand.strip() if brand else None,
                    "pack_size_str": quantity_str.strip() if quantity_str else None,
                    "source": "open_food_facts",
                }
        except Exception as exc:
            logger.debug("Open Food Facts lookup failed for barcode %s: %s", clean_code, exc)
            return None


open_food_facts_client = OpenFoodFactsClient()
