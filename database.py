"""
============================================================================
ProofPixel — Database Layer (database.py)
============================================================================

Supabase connection management and scan-log persistence using the
``supabase`` Python client.

The ``scan_logs`` table must be created in your Supabase project via the
SQL Editor or Table Editor. See the README for the schema.

Environment variables (loaded from ``.env``):
    SUPABASE_URL  — Your Supabase project URL
    SUPABASE_KEY  — Your Supabase anon/service-role key
"""

from __future__ import annotations

import logging
import os

from dotenv import load_dotenv
from supabase import create_client, Client

# ---------------------------------------------------------------------------
# Load environment variables from .env
# ---------------------------------------------------------------------------
load_dotenv()

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Configuration (read from environment)
# ---------------------------------------------------------------------------
SUPABASE_URL: str = os.getenv("SUPABASE_URL", "")
SUPABASE_KEY: str = os.getenv("SUPABASE_KEY", "")

# ---------------------------------------------------------------------------
# Supabase client (singleton)
# ---------------------------------------------------------------------------
_client: Client | None = None


def _get_client() -> Client | None:
    """
    Return a cached Supabase client instance.

    Returns:
        A ``Client`` instance, or ``None`` if credentials are missing.
    """
    global _client

    if _client is not None:
        return _client

    if not SUPABASE_URL or not SUPABASE_KEY:
        logger.warning(
            "SUPABASE_URL or SUPABASE_KEY not set — database logging disabled."
        )
        return None

    try:
        _client = create_client(SUPABASE_URL, SUPABASE_KEY)
        logger.info("Supabase client initialised.")
        return _client
    except Exception as exc:
        logger.error("Failed to create Supabase client: %s", exc)
        return None


# ---------------------------------------------------------------------------
# Initialisation
# ---------------------------------------------------------------------------

def init_db() -> None:
    """
    Verify the Supabase connection is working.

    The ``scan_logs`` table must already exist in your Supabase project.
    Create it via the SQL Editor with:

    .. code-block:: sql

        CREATE TABLE IF NOT EXISTS scan_logs (
            id                BIGSERIAL PRIMARY KEY,
            image_hash        TEXT NOT NULL,
            ai_probability    REAL NOT NULL,
            verdict           TEXT NOT NULL,
            processing_time_ms INTEGER NOT NULL,
            created_at        TIMESTAMPTZ DEFAULT NOW()
        );
    """
    client = _get_client()
    if client is None:
        logger.warning("Supabase not configured — database logging will be disabled.")
        return

    logger.info("Supabase connection verified — ready to log scans.")


# ---------------------------------------------------------------------------
# Logging a scan result
# ---------------------------------------------------------------------------

def log_scan(
    image_hash: str,
    ai_probability: float,
    verdict: str,
    processing_time_ms: int,
) -> bool:
    """
    Insert a new row into the ``scan_logs`` table.

    Args:
        image_hash:         SHA-256 hex digest of the image.
        ai_probability:     Confidence score (0.0 – 100.0).
        verdict:            ``"Real"`` or ``"Fake"``.
        processing_time_ms: Server-side processing time in milliseconds.

    Returns:
        ``True`` if the record was inserted successfully, ``False`` otherwise.
    """
    client = _get_client()
    if client is None:
        logger.warning("Skipping DB log — Supabase not configured.")
        return False

    try:
        client.table("scan_logs").insert({
            "image_hash": image_hash,
            "ai_probability": ai_probability,
            "verdict": verdict,
            "processing_time_ms": processing_time_ms,
        }).execute()

        logger.info(
            "Logged scan: hash=%s… prob=%.2f verdict=%s time=%dms",
            image_hash[:12],
            ai_probability,
            verdict,
            processing_time_ms,
        )
        return True
    except Exception as exc:
        logger.error("Failed to log scan result: %s", exc)
        return False
