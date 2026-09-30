"""
Pydantic schemas for request/response validation.
"""

from typing import List, Optional
from pydantic import BaseModel


class ExtractedFields(BaseModel):
    """
    Structured schema for all FNOL fields.
    All fields are optional because documents may be incomplete —
    missing fields are detected by the validator, not enforced here.
    """
    policyNumber: Optional[str] = None
    policyholderName: Optional[str] = None
    effectiveDates: Optional[str] = None
    incidentDate: Optional[str] = None
    incidentTime: Optional[str] = None
    location: Optional[str] = None
    description: Optional[str] = None
    claimant: Optional[str] = None
    thirdParties: Optional[str] = None
    contactDetails: Optional[str] = None
    assetType: Optional[str] = None
    assetId: Optional[str] = None
    estimatedDamage: Optional[float] = None
    claimType: Optional[str] = None
    attachments: Optional[str] = None
    initialEstimate: Optional[float] = None


class ClaimProcessResponse(BaseModel):
    """Response returned after processing an FNOL document."""
    extractedFields: ExtractedFields
    missingFields: List[str]
    recommendedRoute: str
    reasoning: str


class HealthResponse(BaseModel):
    status: str
    llm_configured: bool
