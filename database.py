"""
============================================================================
ProofPixel — Database Layer (database.py)
============================================================================

MySQL connection management and scan-log persistence using
``mysql-connector-python``.

The ``scan_logs`` table is auto-created if it does not exist.

Environment variables (loaded from ``.env``):
    DB_HOST     — MySQL server hostname  (default: localhost)
    DB_USER     — MySQL user             (default: root)
    DB_PASSWORD — MySQL password          (default: "")
    DB_NAME     — Database name           (default: deepfake_detector)
"""

from __future__ import annotations

import logging
import os
from typing import Optional

import mysql.connector
from mysql.connector import Error as MySQLError
from dotenv import load_dotenv

# ---------------------------------------------------------------------------
# Load environment variables from .env
# ---------------------------------------------------------------------------
load_dotenv()

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Configuration (read from environment)
# ---------------------------------------------------------------------------
DB_HOST: str = os.getenv("DB_HOST", "localhost")
DB_USER: str = os.getenv("DB_USER", "root")
DB_PASSWORD: str = os.getenv("DB_PASSWORD", "")
DB_NAME: str = os.getenv("DB_NAME", "deepfake_detector")

# ---------------------------------------------------------------------------
# Table DDL
# ---------------------------------------------------------------------------
CREATE_TABLE_SQL: str = """
CREATE TABLE IF NOT EXISTS scan_logs (
    id              INT AUTO_INCREMENT PRIMARY KEY,
    image_hash      VARCHAR(64)    NOT NULL COMMENT 'SHA-256 hex digest',
    ai_probability  FLOAT          NOT NULL COMMENT '0.0 – 100.0',
    verdict         VARCHAR(10)    NOT NULL COMMENT 'Real or Fake',
    processing_time_ms  INT        NOT NULL COMMENT 'Server-side ms',
    created_at      TIMESTAMP      DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
"""

INSERT_LOG_SQL: str = """
INSERT INTO scan_logs (image_hash, ai_probability, verdict, processing_time_ms)
VALUES (%s, %s, %s, %s);
"""


# ---------------------------------------------------------------------------
# Connection helper
# ---------------------------------------------------------------------------

def _get_connection() -> Optional[mysql.connector.MySQLConnection]:
    """
    Open a new connection to the MySQL database.

    Returns:
        A ``MySQLConnection`` instance, or ``None`` if the connection failed.
    """
    try:
        conn = mysql.connector.connect(
            host=DB_HOST,
            user=DB_USER,
            password=DB_PASSWORD,
            database=DB_NAME,
        )
        return conn
    except MySQLError as exc:
        logger.error("MySQL connection failed: %s", exc)
        return None


# ---------------------------------------------------------------------------
# Initialisation — ensure the table exists
# ---------------------------------------------------------------------------

def init_db() -> None:
    """
    Create the ``scan_logs`` table if it does not already exist.

    Called once at application startup from ``main.py``.
    """
    conn = _get_connection()
    if conn is None:
        logger.warning(
            "Could not connect to MySQL — database logging will be disabled."
        )
        return

    try:
        cursor = conn.cursor()
        cursor.execute(CREATE_TABLE_SQL)
        conn.commit()
        logger.info("Database initialised — scan_logs table ready.")
    except MySQLError as exc:
        logger.error("Failed to initialise database: %s", exc)
    finally:
        conn.close()


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
        image_hash:        SHA-256 hex digest of the image.
        ai_probability:    Confidence score (0.0 – 100.0).
        verdict:           ``"Real"`` or ``"Fake"``.
        processing_time_ms: Server-side processing time in milliseconds.

    Returns:
        ``True`` if the record was inserted successfully, ``False`` otherwise.
    """
    conn = _get_connection()
    if conn is None:
        logger.warning("Skipping DB log — no database connection.")
        return False

    try:
        cursor = conn.cursor()
        cursor.execute(INSERT_LOG_SQL, (
            image_hash,
            ai_probability,
            verdict,
            processing_time_ms,
        ))
        conn.commit()
        logger.info(
            "Logged scan: hash=%s prob=%.2f verdict=%s time=%dms",
            image_hash[:12] + "…",
            ai_probability,
            verdict,
            processing_time_ms,
        )
        return True
    except MySQLError as exc:
        logger.error("Failed to log scan result: %s", exc)
        return False
    finally:
        conn.close()
