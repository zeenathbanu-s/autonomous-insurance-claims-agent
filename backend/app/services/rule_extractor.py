"""
Rule-based FNOL field extractor.

This is the default extractor used when no LLM API key is configured.
It uses regex patterns and keyword matching to pull structured fields
from the raw FNOL document text.

Design principles:
- All patterns are case-insensitive.
- Each field has a primary pattern and optional fallback patterns.
- Returns a dict with the same keys as ExtractedFields schema.
"""

import re
from typing import Any, Dict, Optional


def extract_fields(text: str) -> Dict[str, Any]:
    """
    Extract all FNOL fields from raw document text using regex rules.
    Returns a dict matching the ExtractedFields schema.
    """
    return {
        "policyNumber": _extract_policy_number(text),
        "policyholderName": _extract_policyholder_name(text),
        "effectiveDates": _extract_effective_dates(text),
        "incidentDate": _extract_incident_date(text),
        "incidentTime": _extract_incident_time(text),
        "location": _extract_location(text),
        "description": _extract_description(text),
        "claimant": _extract_claimant(text),
        "thirdParties": _extract_third_parties(text),
        "contactDetails": _extract_contact_details(text),
        "assetType": _extract_asset_type(text),
        "assetId": _extract_asset_id(text),
        "estimatedDamage": _extract_estimated_damage(text),
        "claimType": _extract_claim_type(text),
        "attachments": _extract_attachments(text),
        "initialEstimate": _extract_initial_estimate(text),
    }


# ─── Individual field extractors ─────────────────────────────────────────────

def _first_match(patterns: list, text: str, min_length: int = 1) -> Optional[str]:
    """
    Try each pattern in order and return the first match group 1, or None.
    min_length: discard matches shorter than this (avoids capturing noise like 'is').
    """
    for pattern in patterns:
        m = re.search(pattern, text, re.IGNORECASE | re.MULTILINE)
        if m:
            value = m.group(1).strip()
            if value and len(value) >= min_length:
                return value
    return None


def _extract_policy_number(text: str) -> Optional[str]:
    """
    Policy numbers must look like structured IDs (e.g. POL-2024-VH-001).
    Require at least 5 chars and at least one digit to avoid matching plain words.
    """
    candidates = []
    patterns = [
        r"policy\s*(?:number|no\.?|#)\s*[:\-]?\s*([A-Z0-9][A-Z0-9\-]{3,})",
        r"pol\.?\s*#\s*[:\-]?\s*([A-Z0-9][A-Z0-9\-]{3,})",
    ]
    for pattern in patterns:
        m = re.search(pattern, text, re.IGNORECASE | re.MULTILINE)
        if m:
            value = m.group(1).strip()
            # Must contain at least one digit — real policy numbers always do
            if value and len(value) >= 4 and re.search(r'\d', value):
                return value
    return None


def _extract_policyholder_name(text: str) -> Optional[str]:
    return _first_match([
        r"policyholder(?:\s*name)?\s*[:\-]?\s*(.+)",
        r"insured(?:\s*name)?\s*[:\-]?\s*(.+)",
        r"policy\s*holder\s*[:\-]?\s*(.+)",
        r"name\s+of\s+insured\s*[:\-]?\s*(.+)",
    ], text)


def _extract_effective_dates(text: str) -> Optional[str]:
    return _first_match([
        r"effective\s*(?:dates?|period|from)\s*[:\-]?\s*(.+)",
        r"policy\s*(?:period|term)\s*[:\-]?\s*(.+)",
        r"coverage\s*(?:dates?|period)\s*[:\-]?\s*(.+)",
    ], text)


def _extract_incident_date(text: str) -> Optional[str]:
    return _first_match([
        r"(?:incident|loss|accident|event)\s*date\s*[:\-]?\s*([0-9]{1,2}[\/\-\.][0-9]{1,2}[\/\-\.][0-9]{2,4})",
        r"date\s+of\s+(?:incident|loss|accident)\s*[:\-]?\s*([0-9]{1,2}[\/\-\.][0-9]{1,2}[\/\-\.][0-9]{2,4})",
        r"(?:occurred?|happened?)\s+on\s*[:\-]?\s*([0-9]{1,2}[\/\-\.][0-9]{1,2}[\/\-\.][0-9]{2,4})",
        r"incident\s*date\s*[:\-]?\s*(.+?)(?:\n|$)",
    ], text)


def _extract_incident_time(text: str) -> Optional[str]:
    return _first_match([
        r"(?:incident|loss|accident|event)\s*time\s*[:\-]?\s*([0-9]{1,2}:[0-9]{2}\s*(?:AM|PM|am|pm)?)",
        r"time\s+of\s+(?:incident|loss|accident)\s*[:\-]?\s*([0-9]{1,2}:[0-9]{2}\s*(?:AM|PM|am|pm)?)",
        r"time\s*[:\-]?\s*([0-9]{1,2}:[0-9]{2}\s*(?:AM|PM|am|pm))",
    ], text)


def _extract_location(text: str) -> Optional[str]:
    return _first_match([
        r"(?:incident\s*)?location\s*[:\-]?\s*(.+)",
        r"place\s+of\s+(?:incident|loss|accident)\s*[:\-]?\s*(.+)",
        r"address\s+of\s+(?:incident|loss)\s*[:\-]?\s*(.+)",
        r"occurred?\s+at\s*[:\-]?\s*(.+)",
    ], text)


def _extract_description(text: str) -> Optional[str]:
    # Try multi-line description blocks first, then single-line
    patterns = [
        r"(?:incident\s+)?description\s*[:\-]?\s*\n((?:.+\n?){1,5})",
        r"(?:incident\s+)?description\s*[:\-]?\s*(.+(?:\n.+){0,3})",
        r"(?:description\s+of\s+(?:incident|loss|damage))\s*[:\-]?\s*(.+)",
        r"what\s+happened\s*[:\-]?\s*(.+)",
    ]
    for pattern in patterns:
        m = re.search(pattern, text, re.IGNORECASE | re.MULTILINE)
        if m:
            value = m.group(1).strip()
            if value:
                # Collapse excess whitespace but keep sentence structure
                value = re.sub(r"\n+", " ", value).strip()
                return value
    return None


def _extract_claimant(text: str) -> Optional[str]:
    return _first_match([
        r"claimant(?:\s*name)?\s*[:\-]?\s*(.+)",
        r"filed\s+by\s*[:\-]?\s*(.+)",
        r"submitted\s+by\s*[:\-]?\s*(.+)",
    ], text)


def _extract_third_parties(text: str) -> Optional[str]:
    return _first_match([
        r"third[\s\-]part(?:y|ies)(?:\s*involved)?\s*[:\-]?\s*(.+)",
        r"other\s+(?:party|parties)\s*[:\-]?\s*(.+)",
        r"involved\s+parties\s*[:\-]?\s*(.+)",
    ], text)


def _extract_contact_details(text: str) -> Optional[str]:
    # Try to find a phone number or email as contact detail
    contact = _first_match([
        r"contact(?:\s*details?|:\s*info(?:rmation)?)?\s*[:\-]?\s*(.+)",
        r"phone(?:\s*number)?\s*[:\-]?\s*(.+)",
        r"email\s*[:\-]?\s*(.+)",
        r"tel(?:ephone)?\s*[:\-]?\s*(.+)",
    ], text)

    if not contact:
        # Try to extract a phone number pattern directly
        phone_match = re.search(r"(\+?[0-9][\d\s\-\(\)]{7,})", text)
        if phone_match:
            contact = phone_match.group(1).strip()

    return contact


def _extract_asset_type(text: str) -> Optional[str]:
    return _first_match([
        r"asset\s*type\s*[:\-]?\s*(.+)",
        r"vehicle\s*type\s*[:\-]?\s*(.+)",
        r"type\s+of\s+(?:vehicle|asset|property)\s*[:\-]?\s*(.+)",
        r"property\s*type\s*[:\-]?\s*(.+)",
    ], text)


def _extract_asset_id(text: str) -> Optional[str]:
    return _first_match([
        r"asset\s*(?:id|identifier|#)\s*[:\-]?\s*([A-Z0-9\-]+)",
        r"vehicle\s*(?:id|identifier|vin|registration|reg\.?)\s*[:\-]?\s*([A-Z0-9\-]+)",
        r"vin\s*[:\-]?\s*([A-Z0-9\-]+)",
        r"registration\s*(?:number|no\.?)?\s*[:\-]?\s*([A-Z0-9\-]+)",
        r"plate\s*(?:number|no\.?)?\s*[:\-]?\s*([A-Z0-9\-]+)",
    ], text)


def _extract_numeric(patterns: list, text: str) -> Optional[float]:
    """Extract a monetary/numeric value and convert to float."""
    raw = _first_match(patterns, text)
    if raw:
        # Remove currency symbols and commas
        cleaned = re.sub(r"[£$€,\s]", "", raw)
        try:
            return float(cleaned)
        except ValueError:
            return None
    return None


def _extract_estimated_damage(text: str) -> Optional[float]:
    return _extract_numeric([
        r"estimated\s+damage\s*[:\-]?\s*\$?([\d,]+(?:\.\d{2})?)",
        r"damage\s+estimate\s*[:\-]?\s*\$?([\d,]+(?:\.\d{2})?)",
        r"estimated\s+(?:repair\s+)?cost\s*[:\-]?\s*\$?([\d,]+(?:\.\d{2})?)",
        r"damage(?:s)?\s*(?:amount)?\s*[:\-]?\s*\$?([\d,]+(?:\.\d{2})?)",
    ], text)


def _extract_claim_type(text: str) -> Optional[str]:
    # First try explicit label
    result = _first_match([
        r"claim\s*type\s*[:\-]?\s*(.+)",
        r"type\s+of\s+claim\s*[:\-]?\s*(.+)",
        r"nature\s+of\s+claim\s*[:\-]?\s*(.+)",
    ], text)

    if result:
        return result.strip().lower()

    # Infer from keywords in text
    text_lower = text.lower()
    if "injury" in text_lower or "bodily" in text_lower or "personal injury" in text_lower:
        return "injury"
    if "vehicle" in text_lower or "collision" in text_lower or "auto" in text_lower:
        return "vehicle"
    if "property" in text_lower or "fire" in text_lower or "flood" in text_lower:
        return "property"
    if "theft" in text_lower or "stolen" in text_lower:
        return "theft"

    return None


def _extract_attachments(text: str) -> Optional[str]:
    return _first_match([
        r"attachments?\s*[:\-]?\s*(.+)",
        r"documents?\s+(?:attached|submitted|enclosed)\s*[:\-]?\s*(.+)",
        r"supporting\s+documents?\s*[:\-]?\s*(.+)",
        r"exhibits?\s*[:\-]?\s*(.+)",
    ], text)


def _extract_initial_estimate(text: str) -> Optional[float]:
    return _extract_numeric([
        r"initial\s+estimate\s*[:\-]?\s*\$?([\d,]+(?:\.\d{2})?)",
        r"preliminary\s+estimate\s*[:\-]?\s*\$?([\d,]+(?:\.\d{2})?)",
        r"initial\s+(?:damage\s+)?assessment\s*[:\-]?\s*\$?([\d,]+(?:\.\d{2})?)",
    ], text)
