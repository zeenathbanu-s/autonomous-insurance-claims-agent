"""
Claims API endpoints.

POST /api/claims/process  — Upload and process an FNOL document (stateless, no database)
"""

from fastapi import APIRouter, File, UploadFile

from app.schemas.claim import ClaimProcessResponse
from app.services import document_parser, extractor, validator, routing_engine

router = APIRouter(prefix="/api/claims", tags=["claims"])


@router.post("/process", response_model=ClaimProcessResponse, status_code=200)
async def process_claim(file: UploadFile = File(...)):
    """
    Process an uploaded FNOL document (PDF or TXT).

    Flow:
    1. Validate file type and content
    2. Extract raw text from document
    3. Extract structured fields (LLM if configured, else rule-based)
    4. Identify missing mandatory fields
    5. Apply deterministic routing rules
    6. Return structured JSON response
    """
    # Step 1 — Read and validate file
    content = await file.read()
    document_parser.validate_file(file.filename, content)

    # Step 2 — Extract text
    raw_text = document_parser.extract_text(file.filename, content)

    # Step 3 — Extract structured fields
    extracted = extractor.extract(raw_text)

    # Step 4 — Identify missing fields
    missing = validator.find_missing_fields(extracted)

    # Step 5 — Route claim
    route, reasoning = routing_engine.route_claim(extracted, missing)

    # Step 6 — Return response
    return ClaimProcessResponse(
        extractedFields=extracted,
        missingFields=missing,
        recommendedRoute=route,
        reasoning=reasoning,
    )
