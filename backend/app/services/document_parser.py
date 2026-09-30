"""
Document parser service.

Responsibilities:
- Validate file type (PDF or TXT only)
- Extract raw text from the uploaded file
- Return normalized plain text for downstream extraction

Supported formats: .pdf, .txt
"""

import io
from fastapi import UploadFile, HTTPException


ALLOWED_EXTENSIONS = {".pdf", ".txt"}


def validate_file(filename: str, content: bytes) -> None:
    """
    Validate that the file is a supported type and is not empty.
    Raises HTTPException with a user-friendly message on failure.
    """
    if not filename:
        raise HTTPException(status_code=400, detail="No filename provided.")

    ext = _get_extension(filename)
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=415,
            detail=f"Unsupported file type '{ext}'. Only PDF and TXT files are accepted.",
        )

    if not content or len(content) == 0:
        raise HTTPException(status_code=400, detail="Uploaded file is empty.")


def extract_text(filename: str, content: bytes) -> str:
    """
    Extract raw text from the uploaded file.

    - TXT files are decoded directly.
    - PDF files are parsed using PyMuPDF (fitz).

    Returns the extracted text as a single string.
    """
    ext = _get_extension(filename)

    if ext == ".txt":
        return _extract_from_txt(content)
    elif ext == ".pdf":
        return _extract_from_pdf(content)

    raise HTTPException(status_code=415, detail="Unsupported file type.")


def _get_extension(filename: str) -> str:
    """Return the lowercase file extension including the dot."""
    if "." not in filename:
        return ""
    return "." + filename.rsplit(".", 1)[-1].lower()


def _extract_from_txt(content: bytes) -> str:
    """Decode TXT file bytes to string."""
    try:
        text = content.decode("utf-8", errors="replace")
    except Exception as exc:
        raise HTTPException(
            status_code=422, detail=f"Failed to read TXT file: {str(exc)}"
        )

    text = text.strip()
    if not text:
        raise HTTPException(status_code=400, detail="TXT file is empty or unreadable.")
    return text


def _extract_from_pdf(content: bytes) -> str:
    """Extract text from a PDF file using PyMuPDF."""
    try:
        import fitz  # PyMuPDF
    except ImportError:
        raise HTTPException(
            status_code=500,
            detail="PDF processing library (PyMuPDF) is not installed.",
        )

    try:
        pdf_file = fitz.open(stream=io.BytesIO(content), filetype="pdf")
        pages_text = []
        for page in pdf_file:
            pages_text.append(page.get_text())
        pdf_file.close()
        text = "\n".join(pages_text).strip()
    except Exception as exc:
        raise HTTPException(
            status_code=422, detail=f"Failed to extract text from PDF: {str(exc)}"
        )

    if not text:
        raise HTTPException(
            status_code=422,
            detail="PDF file appears to contain no extractable text (may be a scanned image).",
        )
    return text
