"""
Integration test: processes all 5 sample FNOL documents through the full
service pipeline and verifies the expected routing outcome for each.
"""

import os
import pytest
from app.services import document_parser, extractor, validator, routing_engine

SAMPLE_DIR = os.path.join(os.path.dirname(__file__), "..", "..", "sample_documents")

CASES = [
    ("claim_fast_track.txt",    "Fast-track"),
    ("claim_manual_review.txt", "Manual review"),
    ("claim_investigation.txt", "Investigation Flag"),
    ("claim_injury.txt",        "Specialist Queue"),
    ("claim_complex.txt",       "Investigation Flag"),
]


def process_doc(filename):
    path = os.path.join(SAMPLE_DIR, filename)
    content = open(path, "rb").read()
    document_parser.validate_file(filename, content)
    text = document_parser.extract_text(filename, content)
    fields = extractor.extract(text)
    missing = validator.find_missing_fields(fields)
    route, reasoning = routing_engine.route_claim(fields, missing)
    return fields, missing, route, reasoning


@pytest.mark.parametrize("filename,expected_route", CASES)
def test_sample_document_routing(filename, expected_route):
    fields, missing, route, reasoning = process_doc(filename)
    print(f"\n  File    : {filename}")
    print(f"  Route   : {route}")
    print(f"  Missing : {missing if missing else 'none'}")
    print(f"  Reason  : {reasoning[:120]}")
    assert route == expected_route, (
        f"Expected '{expected_route}' but got '{route}' for {filename}"
    )


def test_fast_track_fields_extracted():
    """Fast-track doc should have all 16 mandatory fields present."""
    fields, missing, route, _ = process_doc("claim_fast_track.txt")
    assert missing == [], f"Unexpected missing fields: {missing}"
    assert fields.estimatedDamage == 18000.0
    assert fields.claimType is not None


def test_manual_review_missing_policy_number():
    """Manual review doc intentionally omits policy number."""
    fields, missing, route, _ = process_doc("claim_manual_review.txt")
    assert "policyNumber" in missing
    assert route == "Manual review"


def test_investigation_keywords_present():
    """Investigation doc description must contain a fraud keyword."""
    fields, missing, route, reasoning = process_doc("claim_investigation.txt")
    assert route == "Investigation Flag"
    desc = (fields.description or "").lower()
    assert any(kw in desc for kw in ("fraud", "staged", "inconsistent"))


def test_injury_claim_type():
    """Injury doc claim type must be 'injury'."""
    fields, missing, route, _ = process_doc("claim_injury.txt")
    assert fields.claimType is not None
    assert "injury" in fields.claimType.lower()
    assert route == "Specialist Queue"


def test_complex_investigation_wins():
    """Complex doc triggers multiple rules; Investigation Flag must win."""
    fields, missing, route, reasoning = process_doc("claim_complex.txt")
    assert route == "Investigation Flag"
    assert "fraud" in reasoning.lower() or "investigation" in reasoning.lower()
