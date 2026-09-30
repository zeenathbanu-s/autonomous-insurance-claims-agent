"""
Health check endpoint.

GET /api/health — Returns application health status.
"""

from fastapi import APIRouter

from app.schemas.claim import HealthResponse
from app.services import llm_extractor

router = APIRouter(prefix="/api", tags=["health"])


@router.get("/health", response_model=HealthResponse)
def health_check():
    """Check application health and LLM configuration status."""
    return HealthResponse(
        status="ok",
        llm_configured=llm_extractor.is_available(),
    )
