"""
Tests for the field validator.
"""

import pytest
from app.schemas.claim import ExtractedFields
from app.services.validator import find_missing_fields, MANDATORY_FIELDS


def complete_fields() -> ExtractedFields:
    return ExtractedFields(
        policyNumber="POL-001",
        policyholderName="Test User",
        effectiveDates="01/01/2024 - 12/31/2024",
        incidentDate="03/15/2024",
        incidentTime="10:00 AM",
        location="Test Location",
        description="Vehicle collision at intersection.",
        claimant="Test User",
        thirdParties="None",
        contactDetails="test@email.com",
        assetType="Sedan",
        assetId="VIN-123",
        estimatedDamage=10000.0,
        claimType="vehicle",
        attachments="Police report",
        initialEstimate=10000.0,
    )


def test_no_missing_fields_when_complete():
    fields = complete_fields()
    missing = find_missing_fields(fields)
    assert missing == []


def test_detects_missing_policy_number():
    fields = complete_fields()
    fields.policyNumber = None
    missing = find_missing_fields(fields)
    assert "policyNumber" in missing


def test_detects_multiple_missing():
    fields = ExtractedFields()  # All None
    missing = find_missing_fields(fields)
    assert len(missing) == len(MANDATORY_FIELDS)
    for f in MANDATORY_FIELDS:
        assert f in missing


def test_empty_string_treated_as_missing():
    fields = complete_fields()
    fields.location = ""
    missing = find_missing_fields(fields)
    assert "location" in missing


def test_zero_damage_not_missing():
    """0.0 is a valid value for estimatedDamage — not missing."""
    fields = complete_fields()
    fields.estimatedDamage = 0.0
    missing = find_missing_fields(fields)
    assert "estimatedDamage" not in missing
