"""
============================================================================
ProofPixel — ML Inference Service (ml_service.py)
============================================================================

Image preprocessing, HOG feature extraction, and Random Forest inference
for deepfake detection.

Dependencies:
    pip install opencv-python-headless scikit-image scikit-learn joblib numpy

Usage:
    from ml_service import predict_image

    probability, verdict = predict_image(raw_image_bytes)
"""

from __future__ import annotations

import logging
from pathlib import Path
from typing import Tuple

import cv2
import joblib
import numpy as np
from skimage.feature import hog

# ---------------------------------------------------------------------------
# Logging
# ---------------------------------------------------------------------------
logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Constants
# ---------------------------------------------------------------------------

# Target dimensions for the preprocessing step.
IMAGE_SIZE: Tuple[int, int] = (128, 128)

# HOG descriptor parameters – these must match the values used during
# model training for the feature vector dimensions to be compatible.
HOG_PIXELS_PER_CELL: Tuple[int, int] = (8, 8)
HOG_CELLS_PER_BLOCK: Tuple[int, int] = (2, 2)
HOG_ORIENTATIONS: int = 9

# Path to the serialised scikit-learn Random Forest model.
# Place your trained model file in the same directory as this script.
MODEL_PATH: Path = Path(__file__).resolve().parent / "model.joblib"

# ---------------------------------------------------------------------------
# Model cache (loaded once on first prediction)
# ---------------------------------------------------------------------------
_model = None


def _load_model():
    """
    Lazily load the pre-trained Random Forest model from disk.

    Returns:
        The scikit-learn model object, or ``None`` if the model file is
        missing (in which case predictions will use a random placeholder).
    """
    global _model

    if _model is not None:
        return _model

    if MODEL_PATH.exists():
        # Check if the file is a Git LFS pointer (tiny text file, not real model)
        file_size = MODEL_PATH.stat().st_size
        if file_size < 1024:  # Real model is 300+ MB; LFS pointer is ~130 bytes
            logger.warning(
                "Model file at %s is only %d bytes — likely a Git LFS pointer. "
                "Run 'git lfs pull' to download the actual model. "
                "Using random placeholder predictions.",
                MODEL_PATH, file_size,
            )
            return None

        try:
            logger.info("Loading model from %s (%d MB)", MODEL_PATH, file_size // (1024 * 1024))
            _model = joblib.load(MODEL_PATH)
            return _model
        except Exception as exc:
            logger.error(
                "Failed to load model from %s: %s. "
                "Using random placeholder predictions.",
                MODEL_PATH, exc,
            )
            return None

    logger.warning(
        "Model file not found at %s. "
        "Predictions will use a *random placeholder* until a real model is provided.",
        MODEL_PATH,
    )
    return None


# ---------------------------------------------------------------------------
# Image Preprocessing
# ---------------------------------------------------------------------------

def preprocess_image(image_bytes: bytes) -> np.ndarray:
    """
    Decode raw image bytes, resize to ``IMAGE_SIZE``, and convert to
    grayscale.

    Args:
        image_bytes: Raw bytes of the uploaded image (JPEG / PNG).

    Returns:
        A 2-D NumPy array (H × W) of dtype ``uint8`` representing the
        grayscale image.

    Raises:
        ValueError: If the image cannot be decoded from the provided bytes.
    """
    # Decode the raw bytes into a NumPy array via OpenCV.
    np_arr = np.frombuffer(image_bytes, dtype=np.uint8)
    img = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)

    if img is None:
        raise ValueError("Failed to decode image from the provided bytes.")

    # Resize to the target dimensions.
    img_resized = cv2.resize(img, IMAGE_SIZE, interpolation=cv2.INTER_AREA)

    # Convert BGR → Grayscale.
    gray = cv2.cvtColor(img_resized, cv2.COLOR_BGR2GRAY)

    logger.debug(
        "Preprocessed image: original shape=%s → resized=%s (grayscale)",
        img.shape,
        gray.shape,
    )
    return gray


# ---------------------------------------------------------------------------
# Feature Extraction
# ---------------------------------------------------------------------------

def extract_hog_features(image: np.ndarray) -> np.ndarray:
    """
    Extract a Histogram of Oriented Gradients (HOG) feature vector from
    a grayscale image.

    Args:
        image: 2-D NumPy array (H × W, dtype ``uint8``).

    Returns:
        A 1-D NumPy feature vector.
    """
    features = hog(
        image,
        orientations=HOG_ORIENTATIONS,
        pixels_per_cell=HOG_PIXELS_PER_CELL,
        cells_per_block=HOG_CELLS_PER_BLOCK,
        block_norm="L2-Hys",
        feature_vector=True,
    )

    logger.debug("HOG feature vector length: %d", len(features))
    return features


# ---------------------------------------------------------------------------
# Prediction
# ---------------------------------------------------------------------------

def predict_image(image_bytes: bytes) -> Tuple[float, bool]:
    """
    Run the full inference pipeline on raw image bytes.

    Pipeline:
        1. Preprocess (resize + grayscale).
        2. Extract HOG features.
        3. Classify with the Random Forest model.

    Args:
        image_bytes: Raw bytes of the uploaded image.

    Returns:
        A tuple of ``(probability, verdict)`` where:
        - ``probability`` (float): confidence score from 0.0 to 100.0.
        - ``verdict`` (bool): ``True`` → AI-generated, ``False`` → Real.
    """
    # Step 1 — Preprocess
    gray_image = preprocess_image(image_bytes)

    # Step 2 — Feature extraction
    features = extract_hog_features(gray_image)

    # Step 3 — Classification
    model = _load_model()

    if model is not None:
        # The model expects a 2-D array of shape (n_samples, n_features).
        features_2d = features.reshape(1, -1)
        proba = model.predict_proba(features_2d)[0]  # [P(Real), P(AI)]
        ai_probability = float(proba[1]) * 100.0      # Convert to 0–100 range
    else:
        # ---------------------------------------------------------------
        # PLACEHOLDER — generates a random score when no model is loaded.
        # Replace with a real model for production use.
        # ---------------------------------------------------------------
        logger.warning("Using random placeholder prediction.")
        ai_probability = float(np.random.uniform(10.0, 95.0))

    # Threshold: ≥ 50 % → AI-generated
    verdict: bool = ai_probability >= 50.0

    logger.info(
        "Prediction complete — probability=%.2f%%, verdict=%s",
        ai_probability,
        "AI" if verdict else "Real",
    )

    return ai_probability, verdict
