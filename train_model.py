"""
============================================================================
ProofPixel — Model Training Script (train_model.py)
============================================================================

Trains a Random Forest classifier on the CIFAKE dataset using HOG features.

Dataset: https://www.kaggle.com/datasets/birdy654/cifake-real-and-ai-generated-synthetic-images
    - 32×32 PNG images in two classes: REAL and FAKE
    - train/REAL  (50,000)   train/FAKE  (50,000)
    - test/REAL   (10,000)   test/FAKE   (10,000)

Usage:
    1. Download and extract the CIFAKE dataset into a folder (e.g. ./cifake/).
       The folder structure should be:
           cifake/
             train/
               REAL/  *.png
               FAKE/  *.png
             test/
               REAL/  *.png
               FAKE/  *.png

    2. Run:
           python train_model.py --dataset ./cifake

    3. The trained model is saved as model.joblib in the project root.

Dependencies:
    pip install -r requirements.txt
    (or)  pip install opencv-python-headless scikit-image scikit-learn joblib numpy tqdm

Notes:
    - To keep training tractable, a configurable subset of images is sampled
      via --max-per-class (default: 10000).  Set to 0 to use ALL images.
    - HOG parameters here MUST match those in ml_service.py.
"""

from __future__ import annotations

import argparse
import logging
import os
import sys
import time
from pathlib import Path
from typing import List, Tuple

import cv2
import joblib
import numpy as np
from skimage.feature import hog
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix

# ---------------------------------------------------------------------------
# Logging
# ---------------------------------------------------------------------------
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s  %(levelname)-8s  %(message)s",
)
logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# HOG parameters — MUST match ml_service.py
# ---------------------------------------------------------------------------
IMAGE_SIZE: Tuple[int, int] = (128, 128)
HOG_PIXELS_PER_CELL: Tuple[int, int] = (8, 8)
HOG_CELLS_PER_BLOCK: Tuple[int, int] = (2, 2)
HOG_ORIENTATIONS: int = 9

# ---------------------------------------------------------------------------
# Labels
# ---------------------------------------------------------------------------
LABEL_REAL: int = 0  # class index for "Real"
LABEL_FAKE: int = 1  # class index for "AI-generated / Fake"


# ---------------------------------------------------------------------------
# Feature extraction (single image)
# ---------------------------------------------------------------------------

def extract_features(image_path: str) -> np.ndarray | None:
    """
    Read an image, resize to IMAGE_SIZE, convert to grayscale, and
    extract the HOG feature vector.

    Returns None if the image cannot be read.
    """
    img = cv2.imread(image_path, cv2.IMREAD_COLOR)
    if img is None:
        return None

    img_resized = cv2.resize(img, IMAGE_SIZE, interpolation=cv2.INTER_AREA)
    gray = cv2.cvtColor(img_resized, cv2.COLOR_BGR2GRAY)

    features = hog(
        gray,
        orientations=HOG_ORIENTATIONS,
        pixels_per_cell=HOG_PIXELS_PER_CELL,
        cells_per_block=HOG_CELLS_PER_BLOCK,
        block_norm="L2-Hys",
        feature_vector=True,
    )
    return features


# ---------------------------------------------------------------------------
# Dataset loader
# ---------------------------------------------------------------------------

def load_dataset(
    base_dir: Path,
    split: str,
    max_per_class: int = 0,
) -> Tuple[np.ndarray, np.ndarray]:
    """
    Load images from ``base_dir/<split>/REAL`` and
    ``base_dir/<split>/FAKE``, extract HOG features, and return
    (X, y) arrays.

    Args:
        base_dir:       Root of the extracted CIFAKE dataset.
        split:          ``"train"`` or ``"test"``.
        max_per_class:  Maximum images to sample per class (0 = unlimited).

    Returns:
        Tuple of (features_array, labels_array).
    """
    features_list: List[np.ndarray] = []
    labels_list: List[int] = []

    for label_name, label_id in [("REAL", LABEL_REAL), ("FAKE", LABEL_FAKE)]:
        class_dir = base_dir / split / label_name
        if not class_dir.is_dir():
            logger.error("Directory not found: %s", class_dir)
            sys.exit(1)

        # Gather all image paths
        image_paths = sorted([
            str(p) for p in class_dir.iterdir()
            if p.suffix.lower() in (".png", ".jpg", ".jpeg")
        ])

        # Optionally subsample
        if max_per_class > 0 and len(image_paths) > max_per_class:
            rng = np.random.default_rng(seed=42)
            indices = rng.choice(len(image_paths), size=max_per_class, replace=False)
            image_paths = [image_paths[i] for i in sorted(indices)]

        logger.info(
            "[%s/%s] Processing %d images…",
            split, label_name, len(image_paths),
        )

        # Try to import tqdm for progress bars, fall back to plain loop
        try:
            from tqdm import tqdm
            iterator = tqdm(image_paths, desc=f"  {label_name}", unit="img")
        except ImportError:
            iterator = image_paths

        skipped = 0
        for path in iterator:
            feat = extract_features(path)
            if feat is not None:
                features_list.append(feat)
                labels_list.append(label_id)
            else:
                skipped += 1

        if skipped:
            logger.warning("  Skipped %d unreadable images.", skipped)

    X = np.array(features_list, dtype=np.float64)
    y = np.array(labels_list, dtype=np.int32)
    logger.info("[%s] Feature matrix shape: %s", split, X.shape)
    return X, y


# ---------------------------------------------------------------------------
# Training
# ---------------------------------------------------------------------------

def train(args: argparse.Namespace) -> None:
    """End-to-end training pipeline."""
    dataset_path = Path(args.dataset).resolve()
    logger.info("Dataset root: %s", dataset_path)

    # ------------------------------------------------------------------
    # 1. Load & extract features
    # ------------------------------------------------------------------
    logger.info("=== Loading training set ===")
    X_train, y_train = load_dataset(dataset_path, "train", args.max_per_class)

    logger.info("=== Loading test set ===")
    X_test, y_test = load_dataset(dataset_path, "test", args.max_per_class)

    # ------------------------------------------------------------------
    # 2. Train Random Forest
    # ------------------------------------------------------------------
    logger.info(
        "Training Random Forest (n_estimators=%d, max_depth=%s, n_jobs=%d)…",
        args.n_estimators, args.max_depth, args.n_jobs,
    )
    t0 = time.perf_counter()

    clf = RandomForestClassifier(
        n_estimators=args.n_estimators,
        max_depth=args.max_depth,
        random_state=42,
        n_jobs=args.n_jobs,
        verbose=1,
    )
    clf.fit(X_train, y_train)

    train_time = time.perf_counter() - t0
    logger.info("Training completed in %.1f seconds.", train_time)

    # ------------------------------------------------------------------
    # 3. Evaluate
    # ------------------------------------------------------------------
    logger.info("=== Evaluation on test set ===")
    y_pred = clf.predict(X_test)

    acc = accuracy_score(y_test, y_pred)
    logger.info("Accuracy: %.4f (%.2f%%)", acc, acc * 100)

    print("\nClassification Report:")
    print(classification_report(
        y_test, y_pred,
        target_names=["Real", "Fake (AI)"],
    ))

    print("Confusion Matrix:")
    print(confusion_matrix(y_test, y_pred))

    # ------------------------------------------------------------------
    # 4. Save model
    # ------------------------------------------------------------------
    output_path = Path(args.output).resolve()
    joblib.dump(clf, output_path)
    logger.info("Model saved to %s (%.1f MB)",
                output_path,
                output_path.stat().st_size / (1024 * 1024))


# ---------------------------------------------------------------------------
# CLI
# ---------------------------------------------------------------------------

def main() -> None:
    parser = argparse.ArgumentParser(
        description="Train a Random Forest on the CIFAKE dataset using HOG features.",
    )
    parser.add_argument(
        "--dataset", type=str, required=True,
        help="Path to the extracted CIFAKE dataset root (contains train/ and test/).",
    )
    parser.add_argument(
        "--output", type=str, default="model.joblib",
        help="Output path for the trained model (default: model.joblib).",
    )
    parser.add_argument(
        "--max-per-class", type=int, default=10000,
        help="Max images per class to use (0 = all). Default: 10000.",
    )
    parser.add_argument(
        "--n-estimators", type=int, default=200,
        help="Number of trees in the Random Forest (default: 200).",
    )
    parser.add_argument(
        "--max-depth", type=int, default=None,
        help="Max tree depth (default: None = unlimited).",
    )
    parser.add_argument(
        "--n-jobs", type=int, default=-1,
        help="Parallel jobs for training (-1 = all cores). Default: -1.",
    )

    args = parser.parse_args()
    train(args)


if __name__ == "__main__":
    main()
