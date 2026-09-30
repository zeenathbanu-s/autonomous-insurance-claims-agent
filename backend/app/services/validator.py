"""
FNOL field validator.

Identifies which mandatory fields are missing from the extracted data.
Returns a list of field names (camelCase) that were not extracted.

Mandatory fields are defined by the assessment specification.
"""

from typing import List

from app.schemas.claim import ExtractedFields


# All fields that must be present in a complete FNOL document
MANDATORY_FIELDS = [
    "policyNumber",
    "policyholderName",
    "effectiveDates",
    "incidentDate",
    "incidentTime",
    "location",
    "description",
    "claimant",
    "thirdParties",
    "contactDetails",
    "assetType",
    "assetId",
    "estimatedDamage",
    "claimType",
    "attachments",
    "initialEstimate",
]


def find_missing_fields(fields: ExtractedFields) -> List[str]:
    """
    Return a list of mandatory field names that are None or empty string.
    """
    missing = []
    fields_dict = fields.model_dump()

    for field_name in MANDATORY_FIELDS:
        value = fields_dict.get(field_name)
        if value is None or (isinstance(value, str) and value.strip() == ""):
            missing.append(field_name)

    return missing
