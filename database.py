"""
============================================================================
ProofPixel — Database Layer (database.py)
============================================================================

Supabase connection management and scan-log persistence.

The ``scan_logs`` table must be created in your Supabase project via the
SQL Editor. See the README for the schema.

Required columns:
    id, image_hash, ai_probability, verdict, processing_time_ms,
    user_id (TEXT), created_at (TIMESTAMPTZ)

Environment variables (loaded from ``.env``):
    SUPABASE_URL  — Your Supabase project URL
    SUPABASE_KEY  — Your Supabase service-role key (required to bypass RLS)
"""

from __future__ import annotations

import logging
import os
from typing import List, Dict, Any

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
SUPABASE_URL: str = os.getenv("SUPABASE_URL", "https://xlbtithryrslwxvqpfza.supabase.co")
SUPABASE_KEY: str = os.getenv("SUPABASE_KEY", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhsYnRpdGhyeXJzbHd4dnFwZnphIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI3OTE1MTEsImV4cCI6MjA4ODM2NzUxMX0.JBu-XVfLW498kupPPQh3KITKpf9KVFhPrzNK-MaWzow")

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
            user_id           TEXT,
            created_at        TIMESTAMPTZ DEFAULT NOW()
        );

        ALTER TABLE scan_logs ENABLE ROW LEVEL SECURITY;
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
    user_id: str | None = None,
) -> bool:
    """
    Insert a new row into the ``scan_logs`` table.

    Args:
        image_hash:         SHA-256 hex digest of the image.
        ai_probability:     Confidence score (0.0 – 100.0).
        verdict:            ``"Real"`` or ``"Fake"``.
        processing_time_ms: Server-side processing time in milliseconds.
        user_id:            Optional Supabase user ID to tie scan to a user.

    Returns:
        ``True`` if the record was inserted successfully, ``False`` otherwise.
    """
    client = _get_client()
    if client is None:
        logger.warning("Skipping DB log — Supabase not configured.")
        return False

    try:
        row = {
            "image_hash": image_hash,
            "ai_probability": ai_probability,
            "verdict": verdict,
            "processing_time_ms": processing_time_ms,
        }
        if user_id:
            row["user_id"] = user_id

        client.table("scan_logs").insert(row).execute()

        logger.info(
            "Logged scan: hash=%s… prob=%.2f verdict=%s user=%s time=%dms",
            image_hash[:12],
            ai_probability,
            verdict,
            user_id or "anonymous",
            processing_time_ms,
        )
        return True
    except Exception as exc:
        logger.error("Failed to log scan result: %s", exc)
        return False


# ---------------------------------------------------------------------------
# Fetching user history
# ---------------------------------------------------------------------------

def get_user_scans(user_id: str, limit: int = 10) -> List[Dict[str, Any]]:
    """
    Fetch the most recent scans for a given user.

    Args:
        user_id: Supabase user ID.
        limit:   Maximum number of rows to return (default 10).

    Returns:
        A list of dicts with scan data, ordered by created_at descending.
    """
    client = _get_client()
    if client is None:
        logger.warning("Cannot fetch scans — Supabase not configured.")
        return []

    try:
        response = (
            client.table("scan_logs")
            .select("id, image_hash, ai_probability, verdict, processing_time_ms, created_at")
            .eq("user_id", user_id)
            .order("created_at", desc=True)
            .limit(limit)
            .execute()
        )
        return response.data or []
    except Exception as exc:
        logger.error("Failed to fetch user scans: %s", exc)
        return []


def clear_user_scans(user_id: str) -> bool:
    """
    Delete all scan history for a given user.

    Args:
        user_id: Supabase user ID.

    Returns:
        True if successful, False otherwise.
    """
    client = _get_client()
    if client is None:
        logger.warning("Cannot delete scans — Supabase not configured.")
        return False

    try:
        client.table("scan_logs").delete().eq("user_id", user_id).execute()
        logger.info("Cleared scan history for user: %s", user_id)
        return True
    except Exception as exc:
        logger.error("Failed to clear user scans: %s", exc)
        return False
