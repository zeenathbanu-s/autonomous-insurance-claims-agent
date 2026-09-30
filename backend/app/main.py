"""
FastAPI application entry point.

Stateless — no database required.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.routes import claims, health

app = FastAPI(
    title="Autonomous Insurance Claims Processing Agent",
    description=(
        "Processes FNOL (First Notice of Loss) documents, extracts structured fields, "
        "validates completeness, and routes claims using deterministic business rules."
    ),
    version="1.0.0",
)

# CORS — allow the React frontend to communicate with this API
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(health.router)
app.include_router(claims.router)


@app.get("/")
def root():
    return {
        "message": "Insurance Claims Processing Agent API",
        "docs": "/docs",
        "health": "/api/health",
    }
