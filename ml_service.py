"""
============================================================================
ProofPixel — ML Inference Service (ml_service.py)
============================================================================

Multi-feature image forensics pipeline combining four detection methods:

    1. ELA   (Error Level Analysis)  — Re-compression artifact detection
    2. FFT   (Frequency Spectrum)    — Frequency domain anomaly detection
    3. Stats (Pixel Statistics)      — Statistical distribution analysis
    4. HOG   (Gradient Histogram)    — Texture/gradient pattern matching

Each method extracts a compact feature vector. These are concatenated into
a single vector and classified by a GradientBoosting model.

Dependencies:
    pip install opencv-python-headless scikit-image scikit-learn joblib numpy
"""

from __future__ import annotations

import io
import logging
import os
import tempfile
import base64
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

IMAGE_SIZE: Tuple[int, int] = (128, 128)

# HOG parameters — must match training
HOG_PIXELS_PER_CELL: Tuple[int, int] = (16, 16)   # larger cells = fewer features, faster
HOG_CELLS_PER_BLOCK: Tuple[int, int] = (2, 2)
HOG_ORIENTATIONS: int = 9

# Model paths
MODEL_PATH: Path = Path(__file__).resolve().parent / "model.joblib"

# Optional: download model from URL if not found locally
# Set the MODEL_URL env var to a direct download link (e.g. Supabase Storage)
MODEL_URL: str = os.getenv("MODEL_URL", "")

# ---------------------------------------------------------------------------
# Model cache
# ---------------------------------------------------------------------------
_model = None


def _download_model(url: str, dest: Path) -> bool:
    """
    Download the model file from a URL to the destination path.
    Used when model.joblib is not available locally (e.g. on Render).
    """
    try:
        import urllib.request
        logger.info("Downloading model from %s …", url)
        urllib.request.urlretrieve(url, str(dest))
        size_mb = dest.stat().st_size / (1024 * 1024)
        logger.info("Model downloaded: %.1f MB", size_mb)
        return True
    except Exception as exc:
        logger.error("Failed to download model: %s", exc)
        return False


def _load_model():
    """
    Lazily load the pre-trained model from disk.
    Falls back to downloading from MODEL_URL if available.
    Returns None if no model is available (random placeholder predictions).
    """
    global _model

    if _model is not None:
        return _model

    # Try local file first
    if MODEL_PATH.exists():
        file_size = MODEL_PATH.stat().st_size
        if file_size < 1024:
            logger.warning(
                "Model file at %s is only %d bytes — likely a Git LFS pointer. "
                "Set MODEL_URL env var to download the real model.",
                MODEL_PATH, file_size,
            )
            # Try downloading if URL is set
            if MODEL_URL:
                if _download_model(MODEL_URL, MODEL_PATH):
                    return _load_model_from_file()
            return None
        return _load_model_from_file()

    # Try downloading from URL
    if MODEL_URL:
        if _download_model(MODEL_URL, MODEL_PATH):
            return _load_model_from_file()

    logger.warning(
        "Model file not found at %s and no MODEL_URL set. "
        "Using random placeholder predictions.",
        MODEL_PATH,
    )
    return None


def _load_model_from_file():
    """Actually load the model from the local file."""
    global _model
    try:
        size_mb = MODEL_PATH.stat().st_size / (1024 * 1024)
        logger.info("Loading model from %s (%.1f MB)", MODEL_PATH, size_mb)
        _model = joblib.load(MODEL_PATH)
        return _model
    except Exception as exc:
        logger.error("Failed to load model: %s. Using random placeholder.", exc)
        return None


# ===========================================================================
# FEATURE EXTRACTION
# ===========================================================================

# ---------------------------------------------------------------------------
# 1. Error Level Analysis (ELA)
# ---------------------------------------------------------------------------

def extract_ela_features(image_bgr: np.ndarray) -> np.ndarray:
    """
    Error Level Analysis — detects re-compression artifacts.

    HOW IT WORKS:
        AI-generated images often have uniform compression artifacts,
        while real photos have varying error levels across regions.
        We re-save the image at quality 90 and measure the difference.

    Returns:
        10-element feature vector:
        [mean, std, max, min, median of ELA image,
         mean_r, mean_g, mean_b, std_overall, energy]
    """
    # Encode to JPEG at quality 90, then decode back
    encode_params = [cv2.IMWRITE_JPEG_QUALITY, 90]
    _, encoded = cv2.imencode(".jpg", image_bgr, encode_params)
    recompressed = cv2.imdecode(encoded, cv2.IMREAD_COLOR)

    # Compute absolute difference (the "error level")
    ela = cv2.absdiff(image_bgr, recompressed).astype(np.float32)

    # Scale for better discrimination
    ela_scaled = ela * 10.0

    # Extract features from the ELA image
    ela_gray = cv2.cvtColor(ela_scaled.clip(0, 255).astype(np.uint8), cv2.COLOR_BGR2GRAY)

    features = [
        np.mean(ela_gray),        # overall mean error
        np.std(ela_gray),         # variation in error
        np.max(ela_gray),         # peak error
        np.min(ela_gray),         # minimum error
        np.median(ela_gray),      # median error
        np.mean(ela_scaled[:, :, 0]),  # mean error per channel (B)
        np.mean(ela_scaled[:, :, 1]),  # mean error per channel (G)
        np.mean(ela_scaled[:, :, 2]),  # mean error per channel (R)
        np.std(ela_scaled),       # overall std across all channels
        np.sum(ela_gray.astype(np.float64) ** 2) / ela_gray.size,  # energy
    ]
    return np.array(features, dtype=np.float64)


# ---------------------------------------------------------------------------
# 2. FFT Frequency Analysis
# ---------------------------------------------------------------------------

def extract_fft_features(gray: np.ndarray) -> np.ndarray:
    """
    Frequency domain analysis via 2D FFT.

    HOW IT WORKS:
        Real photos have natural frequency distributions with gradual
        roll-off. AI-generated images often have unusual patterns in
        the frequency domain — missing high frequencies or periodic
        artifacts from the generation process.

    Returns:
        10-element feature vector:
        [mean, std, max, energy of spectrum,
         low/mid/high frequency ratios,
         spectral centroid, spectral rolloff, spectral flatness]
    """
    # Compute 2D FFT and shift zero-frequency to center
    f_transform = np.fft.fft2(gray.astype(np.float64))
    f_shift = np.fft.fftshift(f_transform)
    magnitude = np.log1p(np.abs(f_shift))

    # Radial profile — average magnitude at each distance from center
    rows, cols = gray.shape
    cy, cx = rows // 2, cols // 2
    Y, X = np.ogrid[:rows, :cols]
    radius = np.sqrt((X - cx) ** 2 + (Y - cy) ** 2).astype(int)
    max_radius = min(cy, cx)

    # Compute azimuthal average
    radial_mean = np.zeros(max_radius)
    for r in range(max_radius):
        mask = radius == r
        if np.any(mask):
            radial_mean[r] = np.mean(magnitude[mask])

    # Divide spectrum into low/mid/high bands
    third = max_radius // 3
    low_energy = np.mean(radial_mean[:third]) if third > 0 else 0
    mid_energy = np.mean(radial_mean[third:2*third]) if third > 0 else 0
    high_energy = np.mean(radial_mean[2*third:]) if third > 0 else 0
    total_energy = low_energy + mid_energy + high_energy + 1e-10

    # Spectral features
    features = [
        np.mean(magnitude),
        np.std(magnitude),
        np.max(magnitude),
        np.sum(magnitude ** 2) / magnitude.size,  # energy
        low_energy / total_energy,   # low freq ratio
        mid_energy / total_energy,   # mid freq ratio
        high_energy / total_energy,  # high freq ratio
        np.sum(radial_mean * np.arange(max_radius)) / (np.sum(radial_mean) + 1e-10),  # centroid
        np.percentile(radial_mean, 85),  # rolloff
        np.exp(np.mean(np.log(radial_mean + 1e-10))) / (np.mean(radial_mean) + 1e-10),  # flatness
    ]
    return np.array(features, dtype=np.float64)


# ---------------------------------------------------------------------------
# 3. Pixel Statistics
# ---------------------------------------------------------------------------

def extract_statistical_features(image_bgr: np.ndarray, gray: np.ndarray) -> np.ndarray:
    """
    Statistical analysis of pixel distributions.

    HOW IT WORKS:
        Real images have specific statistical properties from camera
        sensors (noise characteristics, dynamic range usage). AI images
        often have different kurtosis, skewness, and edge distributions.

    Returns:
        20-element feature vector:
        [per-channel: mean, std, skewness, kurtosis (4×3=12),
         gray: mean, std, skewness, kurtosis (4),
         edge_density, edge_mean, laplacian_var, contrast]
    """
    from scipy import stats as sp_stats

    features = []

    # Per-channel statistics (B, G, R)
    for c in range(3):
        channel = image_bgr[:, :, c].astype(np.float64).flatten()
        features.extend([
            np.mean(channel),
            np.std(channel),
            float(sp_stats.skew(channel)),
            float(sp_stats.kurtosis(channel)),
        ])

    # Grayscale statistics
    gray_flat = gray.astype(np.float64).flatten()
    features.extend([
        np.mean(gray_flat),
        np.std(gray_flat),
        float(sp_stats.skew(gray_flat)),
        float(sp_stats.kurtosis(gray_flat)),
    ])

    # Edge analysis
    edges = cv2.Canny(gray, 50, 150)
    edge_density = np.sum(edges > 0) / edges.size
    edge_mean = np.mean(edges.astype(np.float64))

    # Laplacian variance (measure of blur/sharpness)
    laplacian = cv2.Laplacian(gray, cv2.CV_64F)
    laplacian_var = np.var(laplacian)

    # Local contrast (std of local patches)
    kernel_size = 5
    local_mean = cv2.blur(gray.astype(np.float64), (kernel_size, kernel_size))
    local_sq_mean = cv2.blur(gray.astype(np.float64) ** 2, (kernel_size, kernel_size))
    local_var = local_sq_mean - local_mean ** 2
    contrast = np.mean(np.sqrt(np.abs(local_var)))

    features.extend([edge_density, edge_mean, laplacian_var, contrast])

    return np.array(features, dtype=np.float64)


# ---------------------------------------------------------------------------
# 4. HOG Features (compact)
# ---------------------------------------------------------------------------

def extract_hog_features(gray: np.ndarray) -> np.ndarray:
    """
    Histogram of Oriented Gradients — texture/gradient patterns.

    Uses larger cells (16×16) than before for a more compact vector
    while still capturing structural patterns.

    Returns:
        HOG feature vector (2016 elements with 16×16 cells on 128×128 image).
    """
    features = hog(
        gray,
        orientations=HOG_ORIENTATIONS,
        pixels_per_cell=HOG_PIXELS_PER_CELL,
        cells_per_block=HOG_CELLS_PER_BLOCK,
        block_norm="L2-Hys",
        feature_vector=True,
    )
    return features


# ===========================================================================
# COMBINED FEATURE EXTRACTION
# ===========================================================================

def extract_all_features(image_bytes: bytes) -> np.ndarray:
    """
    Run the complete multi-feature extraction pipeline.

    Args:
        image_bytes: Raw bytes of the image file.

    Returns:
        Combined 1-D feature vector (ELA + FFT + Stats + HOG).

    Raises:
        ValueError: If the image cannot be decoded.
    """
    # Decode image
    np_arr = np.frombuffer(image_bytes, dtype=np.uint8)
    img_bgr = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)

    if img_bgr is None:
        raise ValueError("Failed to decode image from the provided bytes.")

    # Resize to standard dimensions
    img_resized = cv2.resize(img_bgr, IMAGE_SIZE, interpolation=cv2.INTER_AREA)
    gray = cv2.cvtColor(img_resized, cv2.COLOR_BGR2GRAY)

    # Extract features from all 4 methods
    ela_feat = extract_ela_features(img_resized)       # 10
    fft_feat = extract_fft_features(gray)               # 10
    stat_feat = extract_statistical_features(img_resized, gray)  # 20
    hog_feat = extract_hog_features(gray)               # ~2016

    # Concatenate into a single vector
    combined = np.concatenate([ela_feat, fft_feat, stat_feat, hog_feat])

    logger.debug(
        "Features: ELA=%d, FFT=%d, Stats=%d, HOG=%d → total=%d",
        len(ela_feat), len(fft_feat), len(stat_feat), len(hog_feat), len(combined),
    )
    return combined


# ===========================================================================
# PREDICTION
# ===========================================================================

def _encode_to_base64_img(img: np.ndarray) -> str:
    """Encode an OpenCV image to base64 JPEG, resizing if larger than max_dim."""
    h, w = img.shape[:2]
    max_dim = 256
    if max(h, w) > max_dim:
        scale = max_dim / max(h, w)
        img = cv2.resize(img, (int(w * scale), int(h * scale)), interpolation=cv2.INTER_AREA)
        
    _, buffer = cv2.imencode('.jpg', img, [cv2.IMWRITE_JPEG_QUALITY, 85])
    b64_str = base64.b64encode(buffer).decode('utf-8')
    return f"data:image/jpeg;base64,{b64_str}"

def generate_xai_maps(image_bytes: bytes) -> Tuple[str, str]:
    """
    Generate Explainable AI visuals for ELA and FFT.
    Returns: (ela_base64, fft_base64)
    """
    np_arr = np.frombuffer(image_bytes, dtype=np.uint8)
    img_bgr = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)
    if img_bgr is None:
        return "", ""

    # 1. Generate ELA visual
    encode_params = [cv2.IMWRITE_JPEG_QUALITY, 90]
    _, encoded = cv2.imencode(".jpg", img_bgr, encode_params)
    recompressed = cv2.imdecode(encoded, cv2.IMREAD_COLOR)
    ela = cv2.absdiff(img_bgr, recompressed).astype(np.float32)
    ela_scaled = ela * 15.0  # boost for visual impact
    ela_vis = ela_scaled.clip(0, 255).astype(np.uint8)

    # 2. Generate FFT visual
    gray = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2GRAY)
    f_transform = np.fft.fft2(gray.astype(np.float64))
    f_shift = np.fft.fftshift(f_transform)
    magnitude = np.log1p(np.abs(f_shift))
    mag_normalized = cv2.normalize(magnitude, None, 0, 255, cv2.NORM_MINMAX, dtype=cv2.CV_8U)
    fft_vis = cv2.applyColorMap(mag_normalized, cv2.COLORMAP_VIRIDIS)
    
    return _encode_to_base64_img(ela_vis), _encode_to_base64_img(fft_vis)

def predict_image(image_bytes: bytes) -> Tuple[float, bool, str, str]:
    """
    Run the full multi-feature inference pipeline.

    Pipeline:
        1. Extract ELA, FFT, Statistical, and HOG features.
        2. Concatenate into a single vector.
        3. Classify with the trained model.
        4. Generate XAI maps (base64) for frontend.

    Args:
        image_bytes: Raw bytes of the uploaded image.

    Returns:
        (probability, verdict, ela_image, fft_image):
        - probability: confidence score 0.0–100.0
        - verdict: True → AI-generated, False → Real
        - ela_image: base64 data URI
        - fft_image: base64 data URI
    """
    # Extract all features
    features = extract_all_features(image_bytes)

    # Classify
    model = _load_model()

    if model is not None:
        features_2d = features.reshape(1, -1)
        proba = model.predict_proba(features_2d)[0]  # [P(Real), P(AI)]
        ai_probability = float(proba[1]) * 100.0
    else:
        logger.warning("Using random placeholder prediction (no model loaded).")
        ai_probability = float(np.random.uniform(10.0, 95.0))

    verdict: bool = ai_probability >= 50.0
    
    # Generate XAI maps for frontend
    ela_base64, fft_base64 = generate_xai_maps(image_bytes)

    logger.info(
        "Prediction: prob=%.2f%%, verdict=%s",
        ai_probability,
        "AI" if verdict else "Real",
    )
    return ai_probability, verdict, ela_base64, fft_base64
