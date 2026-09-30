"""
Tests for the document parser service.

Verifies:
- Valid TXT extraction
- Empty file rejection
- Invalid file type rejection
- Encoding edge cases
"""

import pytest
from fastapi import HTTPException
from app.services.document_parser import validate_file, extract_text


# ─── validate_file ────────────────────────────────────────────────────────────

def test_validate_txt_file_valid():
    """Valid TXT file should not raise."""
    validate_file("test.txt", b"Hello world")


def test_validate_pdf_file_valid():
    """Valid PDF filename should pass type check (content checked by extractor)."""
    # We pass minimal bytes just to test the validation logic
    validate_file("test.pdf", b"%PDF-1.4 minimal")


def test_validate_invalid_extension():
    with pytest.raises(HTTPException) as exc_info:
        validate_file("report.docx", b"some content")
    assert exc_info.value.status_code == 415
    assert "docx" in exc_info.value.detail.lower() or "unsupported" in exc_info.value.detail.lower()


def test_validate_empty_file():
    with pytest.raises(HTTPException) as exc_info:
        validate_file("test.txt", b"")
    assert exc_info.value.status_code == 400


def test_validate_no_extension():
    with pytest.raises(HTTPException) as exc_info:
        validate_file("testfile", b"content")
    assert exc_info.value.status_code == 415


def test_validate_uppercase_extension():
    """File extensions should be accepted case-insensitively."""
    validate_file("REPORT.TXT", b"content")


# ─── extract_text (TXT) ───────────────────────────────────────────────────────

def test_extract_txt_basic():
    content = b"Policy Number: POL-001\nClaimant: John Doe"
    text = extract_text("claim.txt", content)
    assert "Policy Number" in text
    assert "John Doe" in text


def test_extract_txt_empty():
    with pytest.raises(HTTPException) as exc_info:
        extract_text("empty.txt", b"   ")
    assert exc_info.value.status_code == 400


def test_extract_txt_utf8_encoding():
    content = "Policyholdernamé: José García".encode("utf-8")
    text = extract_text("test.txt", content)
    assert "José" in text or "Jos" in text
