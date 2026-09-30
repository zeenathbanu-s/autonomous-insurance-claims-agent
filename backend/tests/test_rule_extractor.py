"""
Tests for the rule-based field extractor.

Verifies that key FNOL fields are correctly extracted from realistic text.
"""

import pytest
from app.services.rule_extractor import extract_fields


SAMPLE_FNOL = """
FIRST NOTICE OF LOSS (FNOL)
============================
Policy Number: POL-2024-VH-00134
Policyholder Name: James Carter
Effective Dates: 01/01/2024 - 12/31/2024
Incident Date: 03/15/2024
Incident Time: 09:30 AM
Location: Intersection of Maple Avenue, Springfield, IL
Description: The insured vehicle was struck from behind at a traffic light.
Claimant: James Carter
Third Parties: Robert Hughes
Contact Details: james.carter@email.com | Phone: (555) 204-7891
Asset Type: Sedan
Asset ID: VIN-1HGCM82633A123456
Estimated Damage: $18,000
Claim Type: vehicle
Attachments: Police report, Photos
Initial Estimate: $18,000
"""


def test_extract_policy_number():
    fields = extract_fields(SAMPLE_FNOL)
    assert fields["policyNumber"] == "POL-2024-VH-00134"


def test_extract_policyholder_name():
    fields = extract_fields(SAMPLE_FNOL)
    assert "James Carter" in fields["policyholderName"]


def test_extract_effective_dates():
    fields = extract_fields(SAMPLE_FNOL)
    assert fields["effectiveDates"] is not None
    assert "2024" in fields["effectiveDates"]


def test_extract_incident_date():
    fields = extract_fields(SAMPLE_FNOL)
    assert fields["incidentDate"] is not None
    assert "2024" in fields["incidentDate"]


def test_extract_incident_time():
    fields = extract_fields(SAMPLE_FNOL)
    assert fields["incidentTime"] is not None
    assert "09:30" in fields["incidentTime"]


def test_extract_location():
    fields = extract_fields(SAMPLE_FNOL)
    assert fields["location"] is not None
    assert "Springfield" in fields["location"] or "Maple" in fields["location"]


def test_extract_description():
    fields = extract_fields(SAMPLE_FNOL)
    assert fields["description"] is not None
    assert len(fields["description"]) > 10


def test_extract_claimant():
    fields = extract_fields(SAMPLE_FNOL)
    assert fields["claimant"] is not None
    assert "James Carter" in fields["claimant"]


def test_extract_asset_type():
    fields = extract_fields(SAMPLE_FNOL)
    assert fields["assetType"] is not None
    assert "Sedan" in fields["assetType"]


def test_extract_asset_id():
    fields = extract_fields(SAMPLE_FNOL)
    assert fields["assetId"] is not None
    assert "VIN" in fields["assetId"]


def test_extract_estimated_damage_numeric():
    fields = extract_fields(SAMPLE_FNOL)
    assert fields["estimatedDamage"] == 18000.0


def test_extract_claim_type():
    fields = extract_fields(SAMPLE_FNOL)
    assert fields["claimType"] is not None
    assert "vehicle" in fields["claimType"].lower()


def test_extract_initial_estimate():
    fields = extract_fields(SAMPLE_FNOL)
    assert fields["initialEstimate"] == 18000.0


def test_missing_fields_return_none():
    """When a field is not present in the text, it should return None."""
    sparse_text = "Claimant: John Doe\nEstimated Damage: $5,000"
    fields = extract_fields(sparse_text)
    assert fields["policyNumber"] is None
    assert fields["incidentDate"] is None
