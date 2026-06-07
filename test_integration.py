"""
ProofPixel — Integration & System Tests
Validates the ML pipeline end-to-end and the FastAPI endpoints.
"""

import sys
import os
import time
import hashlib
import traceback

# Ensure project root is importable
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

PASS = 0
FAIL = 0
ERRORS = []

def test(name, condition, detail=""):
    global PASS, FAIL, ERRORS
    if condition:
        PASS += 1
        print(f"  ✓ {name}")
    else:
        FAIL += 1
        msg = f"  ✗ {name}" + (f" — {detail}" if detail else "")
        print(msg)
        ERRORS.append(msg)

# ═══════════════════════════════════════════════════════════════════
# INTEGRATION TESTS — ML Pipeline Components
# ═══════════════════════════════════════════════════════════════════

print("\n" + "=" * 60)
print("  INTEGRATION TESTS — ML Pipeline")
print("=" * 60)

# --- Test: Model loads successfully ---
try:
    from ml_service import _load_model, MODEL_PATH
    model = _load_model()
    test("Model loads from disk", model is not None)
    test("Model file exists and is > 1KB", MODEL_PATH.exists() and MODEL_PATH.stat().st_size > 1024)
except Exception as e:
    test("Model loads from disk", False, str(e))

# --- Test: Feature extraction on a real image ---
try:
    from ml_service import extract_all_features, extract_ela_features, extract_fft_features, extract_statistical_features, extract_hog_features
    import cv2
    import numpy as np

    # Find a test image
    import glob
    real_images = sorted(glob.glob("cifake/test/REAL/*.jpg"))
    fake_images = sorted(glob.glob("cifake/test/FAKE/*.jpg"))

    if real_images:
        with open(real_images[0], "rb") as f:
            img_bytes = f.read()

        # Full pipeline
        features = extract_all_features(img_bytes)
        test("extract_all_features returns a 1D array", features.ndim == 1)
        test(f"Feature vector has expected length (got {len(features)})", len(features) > 1700,
             f"Expected ~2056, got {len(features)}")
        test("No NaN values in feature vector", not np.any(np.isnan(features)))
        test("No Inf values in feature vector", not np.any(np.isinf(features)))

        # Individual extractors
        img_bgr = cv2.imdecode(np.frombuffer(img_bytes, np.uint8), cv2.IMREAD_COLOR)
        img_resized = cv2.resize(img_bgr, (128, 128))
        gray = cv2.cvtColor(img_resized, cv2.COLOR_BGR2GRAY)

        ela = extract_ela_features(img_resized)
        test(f"ELA features: {len(ela)} elements", len(ela) == 10)

        fft = extract_fft_features(gray)
        test(f"FFT features: {len(fft)} elements", len(fft) == 10)

        stats = extract_statistical_features(img_resized, gray)
        test(f"Statistical features: {len(stats)} elements", len(stats) == 20)

        hog_f = extract_hog_features(gray)
        test(f"HOG features: {len(hog_f)} elements", len(hog_f) > 1700)

        # Verify concatenation matches
        combined_manual = np.concatenate([ela, fft, stats, hog_f])
        test("Manual concat matches extract_all_features", len(combined_manual) == len(features))
    else:
        test("Test images available", False, "No CIFAKE test images found")

except Exception as e:
    test("Feature extraction pipeline", False, traceback.format_exc())

# --- Test: Prediction on a real image ---
try:
    from ml_service import predict_image

    if real_images:
        with open(real_images[0], "rb") as f:
            prob, verdict, ela_img, fft_img = predict_image(f.read())
        test("predict_image returns probability 0-100", 0 <= prob <= 100)
        test("predict_image returns boolean verdict", isinstance(verdict, bool))
        test("predict_image returns ELA base64 string", isinstance(ela_img, str) and ela_img.startswith("data:image"))
        test("predict_image returns FFT base64 string", isinstance(fft_img, str) and fft_img.startswith("data:image"))

    if fake_images:
        with open(fake_images[0], "rb") as f:
            prob, verdict, _, _ = predict_image(f.read())
        test("Fake image returns probability 0-100", 0 <= prob <= 100)
        test("predict_image verdict is bool for fake", isinstance(verdict, bool))

except Exception as e:
    test("Prediction pipeline", False, traceback.format_exc())

# --- Test: Prediction consistency (same image → same result) ---
try:
    if real_images:
        with open(real_images[0], "rb") as f:
            img_bytes = f.read()
        p1, v1, _, _ = predict_image(img_bytes)
        p2, v2, _, _ = predict_image(img_bytes)
        test("Deterministic: same image → same probability", abs(p1 - p2) < 0.001)
        test("Deterministic: same image → same verdict", v1 == v2)
except Exception as e:
    test("Prediction consistency", False, str(e))

# --- Test: Invalid image handling ---
try:
    from ml_service import predict_image
    try:
        predict_image(b"this is not an image")
        test("Rejects invalid image bytes", False, "Should have raised ValueError")
    except ValueError:
        test("Rejects invalid image bytes", True)
    except Exception as e:
        test("Rejects invalid image bytes", False, f"Wrong exception type: {type(e).__name__}: {e}")
except Exception as e:
    test("Invalid image handling", False, str(e))


# ═══════════════════════════════════════════════════════════════════
# SYSTEM TESTS — FastAPI Endpoints
# ═══════════════════════════════════════════════════════════════════

print("\n" + "=" * 60)
print("  SYSTEM TESTS — FastAPI Endpoints")
print("=" * 60)

try:
    from fastapi.testclient import TestClient
    from main import app

    client = TestClient(app)

    # Health check
    r = client.get("/")
    test("GET / returns 200", r.status_code == 200)
    test("GET / contains status:ok", r.json().get("status") == "ok")

    # Analyze with valid image
    if real_images:
        with open(real_images[0], "rb") as f:
            img_bytes = f.read()
        r = client.post(
            "/api/v1/analyze",
            files={"file": ("test.jpg", img_bytes, "image/jpeg")},
        )
        test("POST /analyze returns 200 for valid JPEG", r.status_code == 200)
        data = r.json()
        test("Response has label field", "label" in data)
        test("Response has confidence field", "confidence" in data)
        test("Response has is_ai_generated field", "is_ai_generated" in data)
        test("Response has ela_image field", "ela_image" in data)
        test("Response has fft_image field", "fft_image" in data)
        test("Response has processing_time_ms field", "processing_time_ms" in data)
        test("Response has image_hash field", "image_hash" in data)
        test("Label is 'Real' or 'Fake'", data["label"] in ["Real", "Fake"])
        test("Confidence is 0-100", 0 <= data["confidence"] <= 100)
        test("image_hash is valid SHA-256", len(data["image_hash"]) == 64)

        expected_hash = hashlib.sha256(img_bytes).hexdigest()
        test("image_hash matches SHA-256 of uploaded bytes", data["image_hash"] == expected_hash)

    # Analyze with X-User-Id header
    if real_images:
        with open(real_images[0], "rb") as f:
            img_bytes = f.read()
        r = client.post(
            "/api/v1/analyze",
            files={"file": ("test.jpg", img_bytes, "image/jpeg")},
            headers={"X-User-Id": "test-user-12345"},
        )
        test("POST /analyze with X-User-Id returns 200", r.status_code == 200)

    # Reject invalid file type
    r = client.post(
        "/api/v1/analyze",
        files={"file": ("test.txt", b"hello world", "text/plain")},
    )
    test("POST /analyze rejects text/plain (400)", r.status_code == 400)
    test("Error message mentions unsupported file type", "Unsupported file type" in r.json().get("detail", ""))

    # Reject empty file
    r = client.post(
        "/api/v1/analyze",
        files={"file": ("empty.jpg", b"", "image/jpeg")},
    )
    test("POST /analyze rejects empty file (400)", r.status_code == 400)

    # Reject corrupt image
    r = client.post(
        "/api/v1/analyze",
        files={"file": ("corrupt.jpg", b"not a real image", "image/jpeg")},
    )
    test("POST /analyze rejects corrupt image (422)", r.status_code == 422)

    # Scans endpoint
    r = client.get("/api/v1/scans?user_id=nonexistent-user")
    test("GET /scans returns 200 for unknown user", r.status_code == 200)
    test("GET /scans returns list", isinstance(r.json(), list))

except ImportError as e:
    print(f"  ⚠ Skipping FastAPI system tests (missing dependency): {e}")
except Exception as e:
    test("FastAPI system tests", False, traceback.format_exc())


# ═══════════════════════════════════════════════════════════════════
# SUMMARY
# ═══════════════════════════════════════════════════════════════════

print("\n" + "=" * 60)
print(f"  RESULTS: {PASS} passed, {FAIL} failed")
print("=" * 60)
if ERRORS:
    print("\n  FAILURES:")
    for e in ERRORS:
        print(f"    {e}")
print()

sys.exit(1 if FAIL > 0 else 0)
