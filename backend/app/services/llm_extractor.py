"""
LLM-based FNOL field extractor (optional).

This module is used ONLY when LLM_API_KEY is configured in the environment.
If no API key is present, the system falls back to rule_extractor.py automatically.

The LLM's role is ONLY to extract structured fields from unstructured text.
The LLM does NOT make routing decisions — that is always handled deterministically
by routing_engine.py.

Currently supports: OpenAI (gpt-3.5-turbo / gpt-4)
"""

import json
import re
from typing import Any, Dict, Optional

from app.config import settings


EXTRACTION_PROMPT = """You are an insurance claims processing assistant.
Extract the following fields from the FNOL (First Notice of Loss) document text below.
Return ONLY valid JSON with these exact keys. Use null for any field you cannot find.

Required JSON keys:
- policyNumber (string)
- policyholderName (string)
- effectiveDates (string)
- incidentDate (string, format MM/DD/YYYY if possible)
- incidentTime (string)
- location (string)
- description (string, full description of the incident)
- claimant (string)
- thirdParties (string)
- contactDetails (string)
- assetType (string)
- assetId (string)
- estimatedDamage (number, no currency symbols)
- claimType (string, e.g. vehicle, injury, property, theft)
- attachments (string)
- initialEstimate (number, no currency symbols)

Return ONLY the JSON object, no other text.

FNOL Document:
{document_text}
"""


def is_available() -> bool:
    """Return True if an LLM API key has been configured."""
    return bool(settings.LLM_API_KEY)


def extract_fields(text: str) -> Optional[Dict[str, Any]]:
    """
    Use the configured LLM to extract structured fields from FNOL text.
    Returns a dict on success, or None if extraction fails (triggering fallback).
    """
    if not is_available():
        return None

    provider = settings.LLM_PROVIDER.lower()

    if provider == "openai":
        return _extract_with_openai(text)

    # Future: add anthropic, etc.
    return None


def _extract_with_openai(text: str) -> Optional[Dict[str, Any]]:
    """Call OpenAI API and parse JSON response."""
    try:
        from openai import OpenAI  # type: ignore

        client = OpenAI(api_key=settings.LLM_API_KEY)
        prompt = EXTRACTION_PROMPT.format(document_text=text[:4000])  # token limit guard

        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[{"role": "user", "content": prompt}],
            temperature=0,       # Deterministic output
            max_tokens=800,
        )

        raw = response.choices[0].message.content.strip()
        return _parse_json_response(raw)

    except Exception as exc:
        # Log but do not crash — caller will fall back to rule extractor
        print(f"[LLM Extractor] OpenAI extraction failed: {exc}")
        return None


def _parse_json_response(raw: str) -> Optional[Dict[str, Any]]:
    """Parse the JSON returned by the LLM, handling markdown code blocks."""
    # Strip ```json ... ``` wrapper if present
    raw = re.sub(r"^```(?:json)?\s*", "", raw.strip())
    raw = re.sub(r"\s*```$", "", raw.strip())

    try:
        data = json.loads(raw)
        if isinstance(data, dict):
            return data
    except json.JSONDecodeError as exc:
        print(f"[LLM Extractor] JSON parse error: {exc}")

    return None
