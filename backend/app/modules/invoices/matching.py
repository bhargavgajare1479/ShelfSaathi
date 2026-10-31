import re
from typing import Optional

from rapidfuzz import fuzz

from app.db.models import Product


def normalize_text(text: Optional[str]) -> str:
    """
    Normalise text by lowercasing, stripping punctuation, and removing noise tokens.
    Conforms to ARCHITECTURE.md Section 9.
    """
    if not text:
        return ""
    cleaned = text.lower()
    # Strip common invoice noise tokens like mrp, rs, hsn, tax, qty
    cleaned = re.sub(r"\b(mrp|rs|inr|gst|tax|hsn|rate|qty|pkd|mfg|exp|batch)\b[:.]?", " ", cleaned)
    # Replace non-alphanumeric characters (except hyphens) with spaces
    cleaned = re.sub(r"[^\w\s-]", " ", cleaned)
    # Collapse multiple whitespace
    return " ".join(cleaned.split())


class MatchResult:
    """Structured catalogue matching decision outcome."""

    def __init__(
        self,
        product: Optional[Product],
        confidence: float,
        review_status: str,
        match_type: str,
    ):
        self.product = product
        self.confidence = confidence
        self.review_status = review_status
        self.match_type = match_type


def match_line_to_catalogue(
    raw_description: str,
    catalogue_products: list[Product],
) -> MatchResult:
    """
    Deterministic matching pipeline:
    1. Check for exact barcode in raw description
    2. Exact normalized product name match
    3. RapidFuzz token_sort_ratio and token_set_ratio comparison
    4. Conservative threshold classification:
       - score >= 82: 'matched'
       - 48 <= score < 82: 'needs_review' (suggests candidate for merchant review)
       - score < 48 or no catalogue: 'new_product'
    """
    if not catalogue_products:
        return MatchResult(
            product=None,
            confidence=0.0,
            review_status="new_product",
            match_type="no_catalogue",
        )

    norm_desc = normalize_text(raw_description)
    if not norm_desc:
        return MatchResult(
            product=None,
            confidence=0.0,
            review_status="needs_review",
            match_type="empty_description",
        )

    # 1. Barcode match if a product's barcode appears directly in description
    for product in catalogue_products:
        if product.barcode and product.barcode.strip():
            bc = product.barcode.strip().lower()
            if bc in norm_desc or bc in raw_description.lower():
                return MatchResult(
                    product=product,
                    confidence=1.0,
                    review_status="matched",
                    match_type="exact_barcode",
                )

    # 2. Exact normalized name match
    for product in catalogue_products:
        prod_norm = normalize_text(product.name)
        if prod_norm and prod_norm == norm_desc:
            return MatchResult(
                product=product,
                confidence=1.0,
                review_status="matched",
                match_type="exact_name",
            )

    # 3. RapidFuzz approximate matching
    best_product: Optional[Product] = None
    best_score: float = 0.0

    for product in catalogue_products:
        prod_norm = normalize_text(product.name)
        if not prod_norm:
            continue

        # Evaluate token set ratio (handles extra words/order) and token sort ratio
        set_score = fuzz.token_set_ratio(norm_desc, prod_norm)
        sort_score = fuzz.token_sort_ratio(norm_desc, prod_norm)
        composite_score = max(set_score, sort_score)

        # Brand boost if product brand is explicitly stated and matches description
        if product.brand and product.brand.strip().lower() in norm_desc:
            composite_score = min(100.0, composite_score + 5.0)

        if composite_score > best_score:
            best_score = composite_score
            best_product = product

    # 4. Conservative classification threshold
    if best_score >= 75.0 and best_product is not None:
        confidence = round(best_score / 100.0, 4)
        return MatchResult(
            product=best_product,
            confidence=confidence,
            review_status="matched",
            match_type="fuzzy",
        )
    elif best_score >= 45.0 and best_product is not None:
        confidence = round(best_score / 100.0, 4)
        return MatchResult(
            product=best_product,
            confidence=confidence,
            review_status="needs_review",
            match_type="fuzzy_ambiguous",
        )

    return MatchResult(
        product=None,
        confidence=0.0,
        review_status="new_product",
        match_type="none",
    )
