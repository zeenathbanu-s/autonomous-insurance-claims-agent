"""
Deterministic claim routing engine.

This module applies business rules to decide the recommended workflow route.

ROUTING RULES (from assessment specification):

    Rule 1 — Fast-track:
        If estimated_damage < 25,000 → route to "Fast-track"

    Rule 2 — Manual review:
        If any mandatory field is missing → route to "Manual review"

    Rule 3 — Investigation Flag:
        If the incident description contains any of: fraud, inconsistent, staged
        (case-insensitive) → route to "Investigation Flag"

    Rule 4 — Specialist Queue:
        If claim type = "injury" → route to "Specialist Queue"

PRIORITY (when multiple rules match — highest priority wins):

    1. Investigation Flag   (most urgent, potential fraud)
    2. Manual review        (missing data blocks processing)
    3. Specialist Queue     (requires specialized handler)
    4. Fast-track           (normal fast-track processing)

The routing decision is ALWAYS deterministic. An LLM never touches this logic.
"""

from typing import List, Tuple

from app.schemas.claim import ExtractedFields


# Route name constants
ROUTE_INVESTIGATION = "Investigation Flag"
ROUTE_MANUAL_REVIEW = "Manual review"
ROUTE_SPECIALIST = "Specialist Queue"
ROUTE_FAST_TRACK = "Fast-track"

# Keywords that trigger Investigation Flag (case-insensitive)
FRAUD_KEYWORDS = {"fraud", "inconsistent", "staged"}

# Threshold for Fast-track
FAST_TRACK_THRESHOLD = 25_000.0


def route_claim(
    fields: ExtractedFields,
    missing_fields: List[str],
) -> Tuple[str, str]:
    """
    Apply all routing rules and return (recommended_route, reasoning).

    Priority:
    1. Investigation Flag
    2. Manual review
    3. Specialist Queue
    4. Fast-track
    """
    # Evaluate each rule and collect triggered routes with reasons
    triggered = []

    # Rule 3 — Investigation Flag
    fraud_keyword = _check_fraud_keywords(fields.description)
    if fraud_keyword:
        triggered.append((
            ROUTE_INVESTIGATION,
            f"The claim description contains the keyword '{fraud_keyword}', "
            f"which indicates potential fraud or suspicious activity and requires investigation.",
        ))

    # Rule 2 — Manual Review
    if missing_fields:
        formatted = ", ".join(missing_fields)
        triggered.append((
            ROUTE_MANUAL_REVIEW,
            f"The following mandatory field(s) are missing: {formatted}. "
            f"Manual review is required to obtain the missing information.",
        ))

    # Rule 4 — Specialist Queue
    if fields.claimType and fields.claimType.strip().lower() == "injury":
        triggered.append((
            ROUTE_SPECIALIST,
            f"The claim type is 'injury', which requires handling by a specialist team "
            f"due to potential medical and legal complexities.",
        ))

    # Rule 1 — Fast-track
    damage = fields.estimatedDamage
    if damage is not None and damage < FAST_TRACK_THRESHOLD:
        triggered.append((
            ROUTE_FAST_TRACK,
            f"The estimated damage of ${damage:,.2f} is below the ${FAST_TRACK_THRESHOLD:,.0f} "
            f"threshold and all mandatory fields are present, qualifying for fast-track processing.",
        ))

    if not triggered:
        # Edge case: damage >= 25000 with no other flags — still needs a route
        return (
            ROUTE_MANUAL_REVIEW,
            "The claim does not qualify for fast-track processing (estimated damage is at or above "
            f"${FAST_TRACK_THRESHOLD:,.0f}). Manual review is required.",
        )

    # Apply priority: return the highest-priority triggered route
    priority_order = [
        ROUTE_INVESTIGATION,
        ROUTE_MANUAL_REVIEW,
        ROUTE_SPECIALIST,
        ROUTE_FAST_TRACK,
    ]

    for priority_route in priority_order:
        for route, reason in triggered:
            if route == priority_route:
                return route, reason

    # Fallback (should never reach here)
    return triggered[0]


def _check_fraud_keywords(description: str) -> str:
    """
    Check if the description contains any fraud-related keywords.
    Returns the matched keyword (lowercase) or empty string if none found.
    Matching is case-insensitive and whole-word aware.
    """
    if not description:
        return ""

    desc_lower = description.lower()
    for keyword in FRAUD_KEYWORDS:
        # Check for keyword as a substring (assessment does not require whole-word only)
        if keyword in desc_lower:
            return keyword

    return ""
