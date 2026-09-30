"""
Full verification script — run directly with Python.
Tests all 5 sample documents against the live API and verifies:
- HTTP 200 response
- Exactly 4 keys in response
- Correct recommendedRoute
- Non-empty reasoning
- missingFields is a list
- extractedFields is a dict
"""
import json, os, sys, uuid, urllib.request

API = "http://localhost:8000"
SAMPLES = os.path.join(os.path.dirname(__file__), "..", "..", "sample_documents")

CASES = [
    ("claim_fast_track.txt",    "Fast-track"),
    ("claim_manual_review.txt", "Manual review"),
    ("claim_investigation.txt", "Investigation Flag"),
    ("claim_injury.txt",        "Specialist Queue"),
    ("claim_complex.txt",       "Investigation Flag"),
]

EXPECTED_KEYS = {"extractedFields", "missingFields", "recommendedRoute", "reasoning"}

def post_file(path):
    boundary = uuid.uuid4().hex
    fname = os.path.basename(path)
    with open(path, "rb") as f:
        data = f.read()
    body = (
        f"--{boundary}\r\nContent-Disposition: form-data; "
        f'name="file"; filename="{fname}"\r\nContent-Type: text/plain\r\n\r\n'
    ).encode() + data + f"\r\n--{boundary}--\r\n".encode()
    req = urllib.request.Request(
        f"{API}/api/claims/process", data=body,
        headers={"Content-Type": f"multipart/form-data; boundary={boundary}"}
    )
    with urllib.request.urlopen(req, timeout=20) as r:
        return json.loads(r.read())

print("=" * 60)
print("HEALTH CHECK")
print("=" * 60)
with urllib.request.urlopen(f"{API}/api/health", timeout=5) as r:
    h = json.loads(r.read())
    print(f"  status        : {h['status']}")
    print(f"  llm_configured: {h['llm_configured']}")

print()
print("=" * 60)
print("SAMPLE DOCUMENT RESULTS")
print("=" * 60)

all_pass = True
for fname, expected in CASES:
    path = os.path.join(SAMPLES, fname)
    r = post_file(path)

    keys_ok    = set(r.keys()) == EXPECTED_KEYS
    route_ok   = r["recommendedRoute"] == expected
    reason_ok  = bool(r["reasoning"])
    missing_ok = isinstance(r["missingFields"], list)
    fields_ok  = isinstance(r["extractedFields"], dict)
    ok = all([keys_ok, route_ok, reason_ok, missing_ok, fields_ok])
    if not ok:
        all_pass = False

    status = "PASS" if ok else "FAIL"
    print(f"  [{status}] {fname}")
    print(f"         Route   : {r['recommendedRoute']}  (expected: {expected})")
    print(f"         Missing : {r['missingFields'] or 'none'}")
    print(f"         Keys    : {sorted(r.keys())}")
    print(f"         Reason  : {r['reasoning'][:90]}...")
    if not keys_ok:
        print(f"         !! KEY MISMATCH: got {sorted(r.keys())}")
    print()

print("=" * 60)
print("JSON STRUCTURE CHECK (first sample)")
print("=" * 60)
r0 = post_file(os.path.join(SAMPLES, "claim_fast_track.txt"))
required = ["extractedFields", "missingFields", "recommendedRoute", "reasoning"]
for k in required:
    present = k in r0
    print(f"  {'✓' if present else '✗'} {k}")

print()
print("OVERALL:", "ALL PASS ✓" if all_pass else "FAILURES FOUND ✗")
sys.exit(0 if all_pass else 1)
