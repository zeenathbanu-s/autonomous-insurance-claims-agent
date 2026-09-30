"""
Live integration test: hits the running API at http://localhost:8000
with all 5 sample documents and verifies routes and JSON structure.

Run with:
    pytest backend/tests/test_live_api.py -v -s

Requires the backend to be running (uvicorn on port 8000).
"""

import os
import json
import pytest
import urllib.request
import urllib.error
import uuid

API_URL = "http://localhost:8000"
SAMPLE_DIR = os.path.join(os.path.dirname(__file__), "..", "..", "sample_documents")


def is_api_running():
    try:
        urllib.request.urlopen(f"{API_URL}/api/health", timeout=3)
        return True
    except Exception:
        return False


def post_file(filepath):
    boundary = uuid.uuid4().hex
    fname = os.path.basename(filepath)
    with open(filepath, "rb") as f:
        file_data = f.read()
    body = (
        f"--{boundary}\r\n"
        f'Content-Disposition: form-data; name="file"; filename="{fname}"\r\n'
        f"Content-Type: text/plain\r\n\r\n"
    ).encode() + file_data + f"\r\n--{boundary}--\r\n".encode()
    req = urllib.request.Request(
        f"{API_URL}/api/claims/process",
        data=body,
        headers={"Content-Type": f"multipart/form-data; boundary={boundary}"},
    )
    with urllib.request.urlopen(req, timeout=20) as resp:
        return json.loads(resp.read())


pytestmark = pytest.mark.skipif(
    not is_api_running(), reason="Backend not running on port 8000"
)


def test_health_endpoint():
    with urllib.request.urlopen(f"{API_URL}/api/health", timeout=5) as resp:
        data = json.loads(resp.read())
    assert data["status"] == "ok"
    assert "llm_configured" in data
    print(f"\n  Health: {data}")


def test_response_has_exactly_four_keys():
    """The API must return exactly the 4 assessment-required keys."""
    r = post_file(os.path.join(SAMPLE_DIR, "claim_fast_track.txt"))
    assert set(r.keys()) == {"extractedFields", "missingFields", "recommendedRoute", "reasoning"}, (
        f"Unexpected keys in response: {list(r.keys())}"
    )


@pytest.mark.parametrize("filename,expected_route", [
    ("claim_fast_track.txt",    "Fast-track"),
    ("claim_manual_review.txt", "Manual review"),
    ("claim_investigation.txt", "Investigation Flag"),
    ("claim_injury.txt",        "Specialist Queue"),
    ("claim_complex.txt",       "Investigation Flag"),
])
def test_sample_routing_via_api(filename, expected_route):
    r = post_file(os.path.join(SAMPLE_DIR, filename))
    print(f"\n  File    : {filename}")
    print(f"  Route   : {r['recommendedRoute']}")
    print(f"  Missing : {r['missingFields'] or 'none'}")
    print(f"  Keys    : {list(r.keys())}")
    print(f"  Reason  : {r['reasoning'][:100]}...")
    assert r["recommendedRoute"] == expected_route
    assert isinstance(r["missingFields"], list)
    assert isinstance(r["reasoning"], str) and len(r["reasoning"]) > 0
    assert isinstance(r["extractedFields"], dict)
