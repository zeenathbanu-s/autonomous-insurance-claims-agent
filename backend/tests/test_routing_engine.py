"""
Tests for the deterministic routing engine.

Verifies:
- All four routing rules
- Rule priority (Investigation > Manual > Specialist > Fast-track)
- Edge cases (threshold boundary, keyword case-insensitivity)
"""

import pytest
from app.schemas.claim import ExtractedFields
from app.services.routing_engine import route_claim, FAST_TRACK_THRESHOLD


def make_fields(**kwargs) -> ExtractedFields:
    """Create an ExtractedFields instance with default values overridden by kwargs."""
    defaults = {
        "policyNumber": "POL-001",
        "policyholderName": "Test User",
        "effectiveDates": "01/01/2024 - 12/31/2024",
        "incidentDate": "03/15/2024",
        "incidentTime": "10:00 AM",
        "location": "Test Location",
        "description": "Normal incident with no suspicious keywords.",
        "claimant": "Test User",
        "thirdParties": "None",
        "contactDetails": "test@email.com",
        "assetType": "Sedan",
        "assetId": "VIN-123",
        "estimatedDamage": 10000.0,
        "claimType": "vehicle",
        "attachments": "Police report",
        "initialEstimate": 10000.0,
    }
    defaults.update(kwargs)
    return ExtractedFields(**defaults)


# ─── Rule 1: Fast-track ───────────────────────────────────────────────────────

def test_fast_track_below_threshold():
    fields = make_fields(estimatedDamage=18000.0)
    route, reasoning = route_claim(fields, [])
    assert route == "Fast-track"
    assert "18,000" in reasoning or "18000" in reasoning.replace(",", "")


def test_fast_track_damage_equals_zero():
    fields = make_fields(estimatedDamage=0.0)
    route, _ = route_claim(fields, [])
    assert route == "Fast-track"


def test_fast_track_just_below_threshold():
    fields = make_fields(estimatedDamage=24999.99)
    route, _ = route_claim(fields, [])
    assert route == "Fast-track"


def test_no_fast_track_at_threshold():
    """Damage == 25000 should NOT be fast-tracked."""
    fields = make_fields(estimatedDamage=25000.0)
    route, _ = route_claim(fields, [])
    assert route != "Fast-track"


def test_no_fast_track_above_threshold():
    fields = make_fields(estimatedDamage=50000.0)
    route, _ = route_claim(fields, [])
    assert route != "Fast-track"


# ─── Rule 2: Manual Review ────────────────────────────────────────────────────

def test_manual_review_missing_fields():
    fields = make_fields(policyNumber=None)
    route, reasoning = route_claim(fields, ["policyNumber"])
    assert route == "Manual review"
    assert "policyNumber" in reasoning


def test_manual_review_multiple_missing():
    fields = make_fields(policyNumber=None, incidentDate=None)
    route, reasoning = route_claim(fields, ["policyNumber", "incidentDate"])
    assert route == "Manual review"


# ─── Rule 3: Investigation Flag ───────────────────────────────────────────────

def test_investigation_flag_fraud():
    fields = make_fields(description="This claim involves fraud by the claimant.")
    route, reasoning = route_claim(fields, [])
    assert route == "Investigation Flag"
    assert "fraud" in reasoning.lower()


def test_investigation_flag_staged():
    fields = make_fields(description="The accident was staged in a parking lot.")
    route, reasoning = route_claim(fields, [])
    assert route == "Investigation Flag"
    assert "staged" in reasoning.lower()


def test_investigation_flag_inconsistent():
    fields = make_fields(description="The damage pattern is inconsistent with the story.")
    route, reasoning = route_claim(fields, [])
    assert route == "Investigation Flag"
    assert "inconsistent" in reasoning.lower()


def test_investigation_flag_case_insensitive_upper():
    fields = make_fields(description="Evidence of FRAUD was found.")
    route, _ = route_claim(fields, [])
    assert route == "Investigation Flag"


def test_investigation_flag_case_insensitive_mixed():
    fields = make_fields(description="The incident appears Staged based on witness accounts.")
    route, _ = route_claim(fields, [])
    assert route == "Investigation Flag"


# ─── Rule 4: Specialist Queue ─────────────────────────────────────────────────

def test_specialist_queue_injury():
    fields = make_fields(claimType="injury", estimatedDamage=50000.0)
    route, reasoning = route_claim(fields, [])
    assert route == "Specialist Queue"
    assert "injury" in reasoning.lower()


def test_specialist_queue_injury_case_insensitive():
    """claimType matching for injury should be case-insensitive."""
    fields = make_fields(claimType="Injury", estimatedDamage=50000.0)
    route, _ = route_claim(fields, [])
    assert route == "Specialist Queue"


# ─── Priority Tests ───────────────────────────────────────────────────────────

def test_priority_investigation_over_manual():
    """Investigation Flag beats Manual review."""
    fields = make_fields(
        description="This claim appears to be fraud.",
        policyNumber=None,
    )
    route, _ = route_claim(fields, ["policyNumber"])
    assert route == "Investigation Flag"


def test_priority_investigation_over_specialist():
    """Investigation Flag beats Specialist Queue."""
    fields = make_fields(
        description="staged accident with injuries.",
        claimType="injury",
        estimatedDamage=50000.0,
    )
    route, _ = route_claim(fields, [])
    assert route == "Investigation Flag"


def test_priority_manual_over_specialist():
    """Manual review beats Specialist Queue."""
    fields = make_fields(
        claimType="injury",
        estimatedDamage=50000.0,
        policyNumber=None,
    )
    route, _ = route_claim(fields, ["policyNumber"])
    assert route == "Manual review"


def test_priority_manual_over_fast_track():
    """Manual review beats Fast-track."""
    fields = make_fields(estimatedDamage=10000.0, policyNumber=None)
    route, _ = route_claim(fields, ["policyNumber"])
    assert route == "Manual review"


def test_priority_specialist_over_fast_track():
    """Specialist Queue beats Fast-track — but injury + low damage should give Specialist."""
    # Injury claim with damage below threshold: Specialist wins over Fast-track
    fields = make_fields(claimType="injury", estimatedDamage=10000.0)
    route, _ = route_claim(fields, [])
    assert route == "Specialist Queue"


def test_all_rules_triggered_investigation_wins():
    """When all rules trigger, Investigation Flag wins (highest priority)."""
    fields = make_fields(
        description="fraud staged inconsistent scenario",
        claimType="injury",
        estimatedDamage=10000.0,
        policyNumber=None,
    )
    route, _ = route_claim(fields, ["policyNumber"])
    assert route == "Investigation Flag"


# ─── Invalid file type / empty file handled at document_parser layer ──────────
# (Those are tested separately in test_document_parser.py)
