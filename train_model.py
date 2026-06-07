"""
============================================================================
ProofPixel — Model Training Script (train_model.py)
============================================================================

Trains a HistGradientBoosting classifier with StandardScaler normalization
using multi-feature extraction: ELA + FFT + Pixel Statistics + HOG.

Supports combining multiple datasets for improved accuracy.

Compatible Datasets:
    1. CIFAKE: https://www.kaggle.com/datasets/birdy654/cifake-real-and-ai-generated-synthetic-images
    2. AI Generated vs Real: https://www.kaggle.com/datasets/swati6945/ai-generated-vs-real-images

Usage:
    # Single dataset
    python train_model.py --dataset ./cifake

    # Multiple datasets (recommended for best accuracy)
    python train_model.py --dataset ./cifake --dataset ./ai-vs-real

    # Use all images (slower but best accuracy)
    python train_model.py --dataset ./cifake --dataset ./ai-vs-real --max-per-class 0

Dependencies:
    pip install -r requirements.txt
"""

from __future__ import annotations

import argparse
import logging
import sys
import time
from pathlib import Path
from typing import List, Tuple

import cv2
import joblib
import numpy as np
from sklearn.ensemble import HistGradientBoostingClassifier
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix
from sklearn.preprocessing import StandardScaler

# Import feature extraction from ml_service
from ml_service import (
    IMAGE_SIZE,
    extract_ela_features,
    extract_fft_features,
    extract_statistical_features,
    extract_hog_features,
)

# ---------------------------------------------------------------------------
# Logging
# ---------------------------------------------------------------------------
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s  %(levelname)-8s  %(message)s",
)
logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Labels
# ---------------------------------------------------------------------------
LABEL_REAL: int = 0
LABEL_FAKE: int = 1

# Auto-detection: known folder names for each class
REAL_FOLDER_NAMES = ["REAL", "real", "Real", "authentic", "Authentic"]
FAKE_FOLDER_NAMES = ["FAKE", "fake", "Fake", "ai", "AI", "synthetic", "Synthetic",
                     "ai_generated", "AI_Generated", "generated", "Generated"]


# ---------------------------------------------------------------------------
# Feature extraction (single image file)
# ---------------------------------------------------------------------------

def extract_features_from_file(image_path: str) -> np.ndarray | None:
    """
    Read an image file and extract the full multi-feature vector.
    Returns None if the image cannot be read.
    """
    img_bgr = cv2.imread(image_path, cv2.IMREAD_COLOR)
    if img_bgr is None:
        return None

    img_resized = cv2.resize(img_bgr, IMAGE_SIZE, interpolation=cv2.INTER_AREA)
    gray = cv2.cvtColor(img_resized, cv2.COLOR_BGR2GRAY)

    try:
        ela_feat = extract_ela_features(img_resized)
        fft_feat = extract_fft_features(gray)
        stat_feat = extract_statistical_features(img_resized, gray)
        hog_feat = extract_hog_features(gray)
        return np.concatenate([ela_feat, fft_feat, stat_feat, hog_feat])
    except Exception:
        return None


# ---------------------------------------------------------------------------
# Auto-detect class folders
# ---------------------------------------------------------------------------

def detect_class_folders(split_dir: Path) -> Tuple[str, str] | None:
    """Detect real/fake subdirectory names."""
    existing = {d.name for d in split_dir.iterdir() if d.is_dir()}
    for real_name in REAL_FOLDER_NAMES:
        for fake_name in FAKE_FOLDER_NAMES:
            if real_name in existing and fake_name in existing:
                return (real_name, fake_name)
    return None


# ---------------------------------------------------------------------------
# Dataset loader
# ---------------------------------------------------------------------------

def load_split(
    base_dir: Path, split: str, max_per_class: int, dataset_label: str,
) -> Tuple[List[np.ndarray], List[int]]:
    """Load images from a single dataset split."""
    split_dir = base_dir / split
    if not split_dir.is_dir():
        logger.warning("[%s] Split '%s' not found — skipping.", dataset_label, split)
        return [], []

    names = detect_class_folders(split_dir)
    if names is None:
        subdirs = [d.name for d in split_dir.iterdir() if d.is_dir()]
        logger.error("[%s] Cannot detect class folders in %s. Found: %s", dataset_label, split_dir, subdirs)
        return [], []

    real_name, fake_name = names
    logger.info("[%s/%s] Detected: Real='%s', Fake='%s'", dataset_label, split, real_name, fake_name)

    features_list, labels_list = [], []

    for folder_name, label_id in [(real_name, LABEL_REAL), (fake_name, LABEL_FAKE)]:
        class_dir = split_dir / folder_name
        image_paths = sorted([
            str(p) for p in class_dir.iterdir()
            if p.suffix.lower() in (".png", ".jpg", ".jpeg", ".webp", ".bmp")
        ])

        if max_per_class > 0 and len(image_paths) > max_per_class:
            rng = np.random.default_rng(seed=42)
            indices = rng.choice(len(image_paths), size=max_per_class, replace=False)
            image_paths = [image_paths[i] for i in sorted(indices)]

        logger.info("  [%s/%s/%s] Processing %d images…", dataset_label, split, folder_name, len(image_paths))

        try:
            from tqdm import tqdm
            iterator = tqdm(image_paths, desc=f"    {folder_name}", unit="img")
        except ImportError:
            iterator = image_paths

        skipped = 0
        for path in iterator:
            feat = extract_features_from_file(path)
            if feat is not None:
                features_list.append(feat)
                labels_list.append(label_id)
            else:
                skipped += 1

        if skipped:
            logger.warning("    Skipped %d unreadable images.", skipped)

    return features_list, labels_list


def load_multi_dataset(
    dataset_dirs: List[Path], split: str, max_per_class: int,
) -> Tuple[np.ndarray, np.ndarray]:
    """Load and combine features from multiple datasets."""
    all_features, all_labels = [], []

    for i, base_dir in enumerate(dataset_dirs):
        label = f"Dataset-{i+1}({base_dir.name})"
        feats, labels = load_split(base_dir, split, max_per_class, label)
        all_features.extend(feats)
        all_labels.extend(labels)
        logger.info("  → %d samples from %s/%s", len(feats), label, split)

    if not all_features:
        logger.error("No images loaded for split '%s'.", split)
        sys.exit(1)

    X = np.array(all_features, dtype=np.float64)
    y = np.array(all_labels, dtype=np.int32)

    # Replace any NaN/Inf with 0 (safety check)
    X = np.nan_to_num(X, nan=0.0, posinf=0.0, neginf=0.0)

    real_count = int(np.sum(y == LABEL_REAL))
    fake_count = int(np.sum(y == LABEL_FAKE))
    logger.info("[%s] Total: %d samples (Real=%d, Fake=%d), Features=%d",
                split, len(y), real_count, fake_count, X.shape[1])
    return X, y


# ---------------------------------------------------------------------------
# Training
# ---------------------------------------------------------------------------

def train(args: argparse.Namespace) -> None:
    """End-to-end training pipeline."""
    dataset_paths = [Path(d).resolve() for d in args.dataset]

    logger.info("=" * 60)
    logger.info("ProofPixel — Multi-Feature Model Training")
    logger.info("=" * 60)
    logger.info("Datasets: %s", [str(p) for p in dataset_paths])
    logger.info("Classifier: HistGradientBoosting (max_iter=%d, learning_rate=%s, max_depth=%s)",
                args.max_iter, args.learning_rate, args.max_depth)
    logger.info("=" * 60)

    for p in dataset_paths:
        if not p.is_dir():
            logger.error("Dataset not found: %s", p)
            sys.exit(1)

    # Load data
    X_train, y_train = load_multi_dataset(dataset_paths, "train", args.max_per_class)
    X_test, y_test = load_multi_dataset(dataset_paths, "test", args.max_per_class)

    # Shuffle training data
    rng = np.random.default_rng(seed=42)
    shuffle_idx = rng.permutation(len(y_train))
    X_train, y_train = X_train[shuffle_idx], y_train[shuffle_idx]

    # Normalize features — critical for gradient boosting on mixed-scale features
    logger.info("Fitting StandardScaler on training data…")
    scaler = StandardScaler()
    X_train = scaler.fit_transform(X_train)
    X_test = scaler.transform(X_test)

    # Train — HistGradientBoosting with regularization
    logger.info("Training HistGradientBoosting…")
    t0 = time.perf_counter()

    clf = HistGradientBoostingClassifier(
        max_iter=args.max_iter,
        learning_rate=args.learning_rate,
        max_depth=args.max_depth,
        min_samples_leaf=args.min_samples_leaf,
        l2_regularization=args.l2_reg,
        random_state=42,
        verbose=1,
    )
    clf.fit(X_train, y_train)
    train_time = time.perf_counter() - t0
    logger.info("Training completed in %.1f seconds.", train_time)

    # Evaluate
    logger.info("=== Evaluation ===")
    y_pred = clf.predict(X_test)
    acc = accuracy_score(y_test, y_pred)

    print(f"\n* Accuracy: {acc * 100:.2f}%\n")
    print("Classification Report:")
    print(classification_report(y_test, y_pred, target_names=["Real", "Fake (AI)"]))
    print("Confusion Matrix:")
    cm = confusion_matrix(y_test, y_pred)
    print(cm)
    print(f"  True Negatives  (Real->Real):  {cm[0][0]}")
    print(f"  False Positives (Real->Fake):  {cm[0][1]}")
    print(f"  False Negatives (Fake->Real):  {cm[1][0]}")
    print(f"  True Positives  (Fake->Fake):  {cm[1][1]}")

    # Save model
    output_path = Path(args.output).resolve()
    joblib.dump(clf, output_path)
    size_mb = output_path.stat().st_size / (1024 * 1024)
    logger.info("Model saved to %s (%.1f MB)", output_path, size_mb)

    # Save scaler alongside model
    scaler_path = output_path.parent / "scaler.joblib"
    joblib.dump(scaler, scaler_path)
    logger.info("Scaler saved to %s", scaler_path)

    print(f"\n{'=' * 60}")
    print(f"  TRAINING COMPLETE")
    print(f"  Accuracy:   {acc * 100:.2f}%")
    print(f"  Train time: {train_time:.1f}s")
    print(f"  Train size: {len(y_train)} samples")
    print(f"  Test size:  {len(y_test)} samples")
    print(f"  Model size: {size_mb:.1f} MB")
    print(f"  Model path: {output_path}")
    print(f"  Scaler:     {scaler_path}")
    print(f"{'=' * 60}")


# ---------------------------------------------------------------------------
# CLI
# ---------------------------------------------------------------------------

def main() -> None:
    parser = argparse.ArgumentParser(
        description="Train a HistGradientBoosting classifier with StandardScaler + multi-feature extraction (ELA+FFT+Stats+HOG).",
    )
    parser.add_argument("--dataset", type=str, action="append", required=True,
                        help="Dataset root (repeatable).")
    parser.add_argument("--output", type=str, default="model.joblib",
                        help="Output model path (default: model.joblib).")
    parser.add_argument("--max-per-class", type=int, default=10000,
                        help="Max images per class per dataset (0 = all).")
    parser.add_argument("--max-iter", type=int, default=500,
                        help="Max boosting iterations (default: 500).")
    parser.add_argument("--learning-rate", type=float, default=0.05,
                        help="Learning rate (default: 0.05).")
    parser.add_argument("--max-depth", type=int, default=8,
                        help="Max tree depth (default: 8).")
    parser.add_argument("--min-samples-leaf", type=int, default=20,
                        help="Min samples per leaf (default: 20).")
    parser.add_argument("--l2-reg", type=float, default=0.1,
                        help="L2 regularization (default: 0.1).")
    args = parser.parse_args()
    train(args)


if __name__ == "__main__":
    main()
    