"""
============================================================================
ProofPixel — FastAPI Application (main.py)
============================================================================

Entry-point for the backend server.

Run with:
    uvicorn main:app --reload

Endpoints:
    POST /api/v1/analyze   — Upload an image for deepfake analysis.
    GET  /                  — Health-check / welcome message.
"""

from __future__ import annotations

import hashlib
import logging
import time
from contextlib import asynccontextmanager

from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from ml_service import predict_image
from database import init_db, log_scan

# ---------------------------------------------------------------------------
# Logging
# ---------------------------------------------------------------------------
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s  %(levelname)-8s  %(name)s  %(message)s",
)
logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Pydantic response model
# ---------------------------------------------------------------------------

class AnalyzeResponse(BaseModel):
    """JSON shape returned by the /api/v1/analyze endpoint."""
    label: str                  # "Real" or "Fake"
    confidence: float           # 0.0 – 100.0
    image_hash: str             # SHA-256 hex digest
    processing_time_ms: int     # Server-side time in milliseconds
    is_ai_generated: bool       # True → AI-generated


# ---------------------------------------------------------------------------
# Application lifespan — initialise resources on startup
# ---------------------------------------------------------------------------

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup / shutdown lifecycle hook."""
    logger.info("Initialising database…")
    init_db()
    logger.info("ProofPixel backend is ready.")
    yield
    logger.info("Shutting down ProofPixel backend.")


# ---------------------------------------------------------------------------
# FastAPI app
# ---------------------------------------------------------------------------

app = FastAPI(
    title="ProofPixel API",
    version="1.0.0",
    description="AI image forensics backend — deepfake detection via HOG + Random Forest.",
    lifespan=lifespan,
)

# ---------------------------------------------------------------------------
# CORS — allow the React dev server to make requests
# ---------------------------------------------------------------------------
app.add_middleware(
    CORSMiddleware,
    # Allow all origins so the Vercel-deployed frontend (and local dev)
    # can reach this API. Tighten this to your specific Vercel domain
    # in production for better security.
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------------------------------------------------------------------------
# Routes
# ---------------------------------------------------------------------------

@app.get("/")
async def root():
    """Health-check endpoint."""
    return {"status": "ok", "service": "ProofPixel API v1.0.0"}


@app.post("/api/v1/analyze", response_model=AnalyzeResponse)
async def analyze_image(file: UploadFile = File(...)):
    """
    Accept an uploaded image, run it through the ML pipeline, log the
    result to MySQL, and return the analysis.

    Request:
        - ``file``: multipart-form image upload (.jpg / .jpeg / .png).

    Returns:
        ``AnalyzeResponse`` JSON object.
    """
    # ------------------------------------------------------------------
    # 1. Validate content type
    # ------------------------------------------------------------------
    allowed_types = {"image/jpeg", "image/png", "image/jpg"}
    if file.content_type not in allowed_types:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file type '{file.content_type}'. "
                   f"Accepted: {', '.join(sorted(allowed_types))}.",
        )

    # ------------------------------------------------------------------
    # 2. Read file bytes
    # ------------------------------------------------------------------
    image_bytes: bytes = await file.read()
    if len(image_bytes) == 0:
        raise HTTPException(status_code=400, detail="Uploaded file is empty.")

    # ------------------------------------------------------------------
    # 3. Compute SHA-256 hash
    # ------------------------------------------------------------------
    image_hash: str = hashlib.sha256(image_bytes).hexdigest()

    # ------------------------------------------------------------------
    # 4. Run ML inference and measure wall-clock time
    # ------------------------------------------------------------------
    start_time = time.perf_counter()
    try:
        ai_probability, verdict = predict_image(image_bytes)
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc))
    elapsed_ms = int((time.perf_counter() - start_time) * 1000)

    # ------------------------------------------------------------------
    # 5. Determine human-readable label
    # ------------------------------------------------------------------
    label: str = "Fake" if verdict else "Real"

    # ------------------------------------------------------------------
    # 6. Log to MySQL (non-blocking — failure does not break the response)
    # ------------------------------------------------------------------
    log_scan(
        image_hash=image_hash,
        ai_probability=ai_probability,
        verdict=label,
        processing_time_ms=elapsed_ms,
    )

    # ------------------------------------------------------------------
    # 7. Return JSON response
    # ------------------------------------------------------------------
    return AnalyzeResponse(
        label=label,
        confidence=round(ai_probability, 2),
        image_hash=image_hash,
        processing_time_ms=elapsed_ms,
        is_ai_generated=verdict,
    )
