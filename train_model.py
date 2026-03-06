"""
============================================================================
ProofPixel — Model Training Script (train_model.py)
============================================================================

Trains a Random Forest classifier on HOG features for deepfake detection.

SUPPORTS MULTIPLE DATASETS:
    Pass one or more dataset directories via --dataset flags. The script
    auto-detects common folder naming conventions:
        - REAL/FAKE  (CIFAKE)
        - real/fake
        - Real/Fake
        - real/ai    (AI Generated vs Real Images)
        - Real/AI

    Each dataset directory should contain train/ and test/ splits
    (or the images directly in class subfolders).

Compatible Datasets:
    1. CIFAKE:  https://www.kaggle.com/datasets/birdy654/cifake-real-and-ai-generated-synthetic-images
    2. AI Generated vs Real Images:  https://www.kaggle.com/datasets/swati6945/ai-generated-vs-real-images

Usage:
    # Single dataset
    python train_model.py --dataset ./cifake

    # Multiple datasets (combined training for better accuracy)
    python train_model.py --dataset ./cifake --dataset ./ai-vs-real

    # Use all images (no subsampling) — takes longer but higher accuracy
    python train_model.py --dataset ./cifake --dataset ./ai-vs-real --max-per-class 0

    # Custom estimators and depth
    python train_model.py --dataset ./cifake --n-estimators 300 --max-depth 30

Dependencies:
    pip install -r requirements.txt
"""

from __future__ import annotations

import argparse
import logging
import os
import sys
import time
from pathlib import Path
from typing import List, Tuple, Optional

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
LABEL_REAL: int = 0
LABEL_FAKE: int = 1

# Auto-detection mapping: folder names → label
# The script tries each pair until it finds a match.
REAL_FOLDER_NAMES = ["REAL", "real", "Real", "authentic", "Authentic"]
FAKE_FOLDER_NAMES = ["FAKE", "fake", "Fake", "ai", "AI", "synthetic", "Synthetic",
                     "ai_generated", "AI_Generated", "generated", "Generated"]


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
# Auto-detect class folder names
# ---------------------------------------------------------------------------

def detect_class_folders(split_dir: Path) -> Tuple[str, str] | None:
    """
    Scan `split_dir` for subdirectories matching known real/fake naming.
    Returns (real_folder_name, fake_folder_name) or None if not found.
    """
    existing = {d.name for d in split_dir.iterdir() if d.is_dir()}

    for real_name in REAL_FOLDER_NAMES:
        for fake_name in FAKE_FOLDER_NAMES:
            if real_name in existing and fake_name in existing:
                return (real_name, fake_name)

    return None


# ---------------------------------------------------------------------------
# Dataset loader (single dataset)
# ---------------------------------------------------------------------------

def load_split(
    base_dir: Path,
    split: str,
    max_per_class: int = 0,
    dataset_label: str = "",
) -> Tuple[List[np.ndarray], List[int]]:
    """
    Load images from ``base_dir/<split>/<real_class>`` and
    ``base_dir/<split>/<fake_class>``, extract HOG features.

    Returns (features_list, labels_list) — not yet converted to numpy.
    """
    split_dir = base_dir / split
    if not split_dir.is_dir():
        logger.warning("[%s] Split directory not found: %s — skipping.", dataset_label, split_dir)
        return [], []

    names = detect_class_folders(split_dir)
    if names is None:
        logger.error(
            "[%s] Could not detect Real/Fake class folders in %s. "
            "Found subdirectories: %s",
            dataset_label, split_dir,
            [d.name for d in split_dir.iterdir() if d.is_dir()],
        )
        return [], []

    real_name, fake_name = names
    logger.info("[%s/%s] Detected class folders: Real='%s', Fake='%s'",
                dataset_label, split, real_name, fake_name)

    features_list: List[np.ndarray] = []
    labels_list: List[int] = []

    for folder_name, label_id in [(real_name, LABEL_REAL), (fake_name, LABEL_FAKE)]:
        class_dir = split_dir / folder_name

        # Gather all image paths
        image_paths = sorted([
            str(p) for p in class_dir.iterdir()
            if p.suffix.lower() in (".png", ".jpg", ".jpeg", ".webp", ".bmp")
        ])

        # Optionally subsample
        if max_per_class > 0 and len(image_paths) > max_per_class:
            rng = np.random.default_rng(seed=42)
            indices = rng.choice(len(image_paths), size=max_per_class, replace=False)
            image_paths = [image_paths[i] for i in sorted(indices)]

        logger.info(
            "  [%s/%s/%s] Processing %d images…",
            dataset_label, split, folder_name, len(image_paths),
        )

        # Progress bar via tqdm (optional)
        try:
            from tqdm import tqdm
            iterator = tqdm(image_paths, desc=f"    {folder_name}", unit="img")
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
            logger.warning("    Skipped %d unreadable images.", skipped)

    return features_list, labels_list


# ---------------------------------------------------------------------------
# Multi-dataset loader
# ---------------------------------------------------------------------------

def load_multi_dataset(
    dataset_dirs: List[Path],
    split: str,
    max_per_class: int = 0,
) -> Tuple[np.ndarray, np.ndarray]:
    """
    Load and combine features from multiple dataset directories.

    Args:
        dataset_dirs:   List of dataset root paths.
        split:          "train" or "test".
        max_per_class:  Max images per class per dataset (0 = unlimited).

    Returns:
        (X, y) — combined feature matrix and label array.
    """
    all_features: List[np.ndarray] = []
    all_labels: List[int] = []

    for i, base_dir in enumerate(dataset_dirs):
        label = f"Dataset-{i+1}({base_dir.name})"
        logger.info("=== Loading %s from %s ===", split, label)

        feats, labels = load_split(base_dir, split, max_per_class, label)
        all_features.extend(feats)
        all_labels.extend(labels)

        logger.info("  → Loaded %d samples from %s/%s", len(feats), label, split)

    if not all_features:
        logger.error("No images were loaded for split '%s'. Check your dataset paths.", split)
        sys.exit(1)

    X = np.array(all_features, dtype=np.float64)
    y = np.array(all_labels, dtype=np.int32)

    # Log class distribution
    real_count = int(np.sum(y == LABEL_REAL))
    fake_count = int(np.sum(y == LABEL_FAKE))
    logger.info(
        "[%s] Combined: %d total samples (Real=%d, Fake=%d)",
        split, len(y), real_count, fake_count,
    )

    return X, y


# ---------------------------------------------------------------------------
# Training
# ---------------------------------------------------------------------------

def train(args: argparse.Namespace) -> None:
    """End-to-end training pipeline with multi-dataset support."""

    dataset_paths = [Path(d).resolve() for d in args.dataset]
    logger.info("=" * 60)
    logger.info("ProofPixel Model Training")
    logger.info("=" * 60)
    logger.info("Datasets: %s", [str(p) for p in dataset_paths])
    logger.info("Max per class per dataset: %s", args.max_per_class or "ALL")
    logger.info("Estimators: %d  |  Max depth: %s  |  Jobs: %d",
                args.n_estimators, args.max_depth, args.n_jobs)
    logger.info("=" * 60)

    # Validate directories exist
    for p in dataset_paths:
        if not p.is_dir():
            logger.error("Dataset directory not found: %s", p)
            sys.exit(1)

    # ------------------------------------------------------------------
    # 1. Load & extract features from all datasets
    # ------------------------------------------------------------------
    X_train, y_train = load_multi_dataset(dataset_paths, "train", args.max_per_class)
    X_test, y_test = load_multi_dataset(dataset_paths, "test", args.max_per_class)

    # Shuffle training data (important when combining datasets)
    rng = np.random.default_rng(seed=42)
    shuffle_idx = rng.permutation(len(y_train))
    X_train = X_train[shuffle_idx]
    y_train = y_train[shuffle_idx]

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
    logger.info("★ Overall Accuracy: %.4f (%.2f%%)", acc, acc * 100)

    print("\nClassification Report:")
    print(classification_report(
        y_test, y_pred,
        target_names=["Real", "Fake (AI)"],
    ))

    print("Confusion Matrix:")
    cm = confusion_matrix(y_test, y_pred)
    print(cm)
    print(f"\n  True Negatives (Real→Real):   {cm[0][0]}")
    print(f"  False Positives (Real→Fake):  {cm[0][1]}")
    print(f"  False Negatives (Fake→Real):  {cm[1][0]}")
    print(f"  True Positives (Fake→Fake):   {cm[1][1]}")

    # ------------------------------------------------------------------
    # 4. Save model
    # ------------------------------------------------------------------
    output_path = Path(args.output).resolve()
    joblib.dump(clf, output_path)
    logger.info(
        "Model saved to %s (%.1f MB)",
        output_path,
        output_path.stat().st_size / (1024 * 1024),
    )

    # ------------------------------------------------------------------
    # 5. Summary
    # ------------------------------------------------------------------
    print("\n" + "=" * 60)
    print(f"  TRAINING COMPLETE")
    print(f"  Accuracy:     {acc * 100:.2f}%")
    print(f"  Train time:   {train_time:.1f}s")
    print(f"  Train size:   {len(y_train)} samples")
    print(f"  Test size:    {len(y_test)} samples")
    print(f"  Datasets:     {len(dataset_paths)}")
    print(f"  Model saved:  {output_path}")
    print("=" * 60)


# ---------------------------------------------------------------------------
# CLI
# ---------------------------------------------------------------------------

def main() -> None:
    parser = argparse.ArgumentParser(
        description="Train a Random Forest on HOG features for deepfake detection. "
                    "Supports combining multiple datasets.",
    )
    parser.add_argument(
        "--dataset", type=str, action="append", required=True,
        help="Path to a dataset root (contains train/ and test/). "
             "Can be specified multiple times to combine datasets.",
    )
    parser.add_argument(
        "--output", type=str, default="model.joblib",
        help="Output path for the trained model (default: model.joblib).",
    )
    parser.add_argument(
        "--max-per-class", type=int, default=10000,
        help="Max images per class per dataset (0 = all). Default: 10000.",
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
