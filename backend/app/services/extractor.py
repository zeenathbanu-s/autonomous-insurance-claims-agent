"""
Extraction orchestrator.

This module decides which extraction strategy to use:
1. If LLM is configured and available → use llm_extractor
2. Otherwise → use rule_extractor (default, always works)

Both extractors return the same dict structure matching ExtractedFields.
"""

from typing import Any, Dict

from app.services import llm_extractor, rule_extractor
from app.schemas.claim import ExtractedFields


def extract(text: str) -> ExtractedFields:
    """
    Extract FNOL fields from raw document text.

    Strategy:
    - Try LLM extraction if configured (llm_extractor.is_available())
    - If LLM fails or is not configured, fall back to rule_extractor
    - Always return a validated ExtractedFields object
    """
    raw_fields: Dict[str, Any] = {}

    if llm_extractor.is_available():
        result = llm_extractor.extract_fields(text)
        if result:
            raw_fields = result

    # Fall back to rule-based if LLM not used or returned nothing
    if not raw_fields:
        raw_fields = rule_extractor.extract_fields(text)

    # Coerce numeric fields safely
    raw_fields = _coerce_numerics(raw_fields)

    return ExtractedFields(**raw_fields)


def _coerce_numerics(fields: Dict[str, Any]) -> Dict[str, Any]:
    """
    Ensure numeric fields are floats (not strings from LLM output).
    Silently sets to None if conversion fails.
    """
    for key in ("estimatedDamage", "initialEstimate"):
        val = fields.get(key)
        if val is not None and not isinstance(val, (int, float)):
            try:
                fields[key] = float(str(val).replace(",", "").replace("$", "").strip())
            except (ValueError, TypeError):
                fields[key] = None
    return fields
