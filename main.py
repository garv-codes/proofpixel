"""
============================================================================
ProofPixel — FastAPI Application (main.py)
============================================================================

Entry-point for the backend server.

Run with:
    uvicorn main:app --reload

Endpoints:
    POST /api/v1/analyze   — Upload an image for deepfake analysis.
    GET  /api/v1/scans     — Fetch recent scans for a user.
    GET  /                  — Health-check / welcome message.
"""

from __future__ import annotations

import hashlib
import logging
import time
from contextlib import asynccontextmanager
from typing import Optional, List

from fastapi import FastAPI, File, Header, HTTPException, Query, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from ml_service import predict_image
from database import init_db, log_scan, get_user_scans, clear_user_scans

# ---------------------------------------------------------------------------
# Logging
# ---------------------------------------------------------------------------
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s  %(levelname)-8s  %(name)s  %(message)s",
)
logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Pydantic response models
# ---------------------------------------------------------------------------

class AnalyzeResponse(BaseModel):
    """JSON shape returned by the /api/v1/analyze endpoint."""
    label: str                  # "Real" or "Fake"
    confidence: float           # 0.0 – 100.0
    image_hash: str             # SHA-256 hex digest
    processing_time_ms: int     # Server-side time in milliseconds
    is_ai_generated: bool       # True → AI-generated
    ela_image: str              # Base64 encoded ELA visual map
    fft_image: str              # Base64 encoded FFT visual map


class ScanRecord(BaseModel):
    """Shape of a single scan history item."""
    id: int
    image_hash: str
    ai_probability: float
    verdict: str
    processing_time_ms: int
    created_at: str


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
# CORS
# ---------------------------------------------------------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
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
async def analyze_image(
    file: UploadFile = File(...),
    x_user_id: Optional[str] = Header(None, alias="X-User-Id"),
):
    """
    Accept an uploaded image, run it through the ML pipeline, log the
    result to Supabase, and return the analysis.

    Request:
        - ``file``: multipart-form image upload (.jpg / .jpeg / .png).
        - ``X-User-Id`` header (optional): Supabase user ID for history tracking.

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
        ai_probability, verdict, ela_image, fft_image = predict_image(image_bytes)
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc))
    elapsed_ms = int((time.perf_counter() - start_time) * 1000)

    # ------------------------------------------------------------------
    # 5. Determine human-readable label
    # ------------------------------------------------------------------
    label: str = "Fake" if verdict else "Real"

    # ------------------------------------------------------------------
    # 6. Log to Supabase (non-blocking — failure does not break response)
    # ------------------------------------------------------------------
    log_scan(
        image_hash=image_hash,
        ai_probability=ai_probability,
        verdict=label,
        processing_time_ms=elapsed_ms,
        user_id=x_user_id,
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
        ela_image=ela_image,
        fft_image=fft_image,
    )


@app.get("/api/v1/scans", response_model=List[ScanRecord])
async def list_scans(
    user_id: str = Query(..., description="Supabase user ID"),
    limit: int = Query(10, ge=1, le=50, description="Max results"),
):
    """
    Fetch recent scan history for a given user.

    Query params:
        - ``user_id``: Supabase user UUID.
        - ``limit``: Number of results (default 10, max 50).

    Returns:
        A list of ``ScanRecord`` objects ordered by most recent first.
    """
    scans = get_user_scans(user_id=user_id, limit=limit)
    return scans


@app.delete("/api/v1/scans")
async def delete_scans(
    user_id: str = Header(..., alias="X-User-Id", description="Supabase user ID"),
):
    """
    Delete all scan history for the authenticated user.

    Headers:
        - ``X-User-Id``: Supabase user UUID.

    Returns:
        Success message.
    """
    success = clear_user_scans(user_id)
    if not success:
        raise HTTPException(status_code=500, detail="Failed to clear scan history.")
    
    return {"status": "success", "message": "Scan history cleared."}
