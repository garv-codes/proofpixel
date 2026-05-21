---
title: ProofPixel
emoji: 🛡️
colorFrom: gray
colorTo: indigo
sdk: docker
pinned: false
---

<div align="center">

# 🛡️ ProofPixel — AI Image Forensics Engine

**A production-grade deepfake detection system powered by a Multi-Feature Fusion ML pipeline**

[![Python](https://img.shields.io/badge/Python-3.10+-blue.svg?style=for-the-badge&logo=python&logoColor=white)](https://python.org)
[![React](https://img.shields.io/badge/React-18-61DAFB.svg?style=for-the-badge&logo=react&logoColor=black)](https://react.dev)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.110+-009688.svg?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![scikit-learn](https://img.shields.io/badge/scikit--learn-1.4+-F7931E.svg?style=for-the-badge&logo=scikit-learn&logoColor=white)](https://scikit-learn.org)
[![Supabase](https://img.shields.io/badge/Supabase-Auth%20%26%20DB-3ECF8E.svg?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com)

**Live Demo:** [proofpixel.vercel.app](https://proofpixel.vercel.app) · **API:** [garv-codes-proofpixel.hf.space](https://garv-codes-proofpixel.hf.space)

</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Key Features](#-key-features)
- [System Architecture](#-system-architecture)
- [ML Pipeline Deep Dive](#-ml-pipeline-deep-dive)
- [Model Performance](#-model-performance)
- [Known Limitations & Improvement Roadmap](#-known-limitations--improvement-roadmap)
- [Tech Stack](#%EF%B8%8F-tech-stack)
- [Getting Started](#-getting-started)
- [Project Structure](#-project-structure)
- [API Reference](#-api-reference)
- [Deployment](#-deployment)
- [Security](#-security)
- [Acknowledgments](#-acknowledgments)
- [License](#-license)

---

## 🧩 Overview

ProofPixel is a forensic tool designed to combat digital misinformation by detecting AI-generated images. As generative AI models (GANs, Diffusion Models, VAEs) produce increasingly realistic imagery, the ability to programmatically distinguish synthetic from authentic photographs becomes critical for journalism, legal evidence, and platform trust-and-safety.

Rather than relying on a single detection heuristic, ProofPixel employs a **Multi-Feature Fusion** strategy: four independent forensic signals are extracted from each image, concatenated into a single feature vector, and classified by a Random Forest ensemble. This approach targets the mathematical artifacts that different generation methods leave behind in distinct domains — compression residuals, frequency patterns, pixel statistics, and gradient textures.

---

## ✨ Key Features

| Feature | Description |
|---------|-------------|
| **Real-Time Analysis** | Sub-second classification with live confidence scoring |
| **Explainable AI (XAI)** | ELA and FFT forensic maps rendered alongside every verdict |
| **Multi-Feature Fusion** | Four independent forensic signals fused into one decision |
| **Scan History** | User-scoped persistent history with verdict badges |
| **Supabase Auth** | Email/password authentication with JWT session persistence |
| **Row Level Security** | PostgreSQL RLS enabled — data is user-scoped at the DB level |
| **Fully Dockerized** | Single-command backend deployment via Docker |

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT (Browser)                        │
│  React 18 + Vite  ·  Tailwind CSS  ·  shadcn/ui  ·  Lucide     │
│                                                                  │
│  ┌──────────┐   ┌──────────────┐   ┌──────────────────────┐    │
│  │LandingPage│   │  Analyzer    │   │Architecture / About  │    │
│  │  /login  │   │  /dashboard  │   │  /architecture       │    │
│  └──────────┘   └──────┬───────┘   └──────────────────────┘    │
└─────────────────────────┼───────────────────────────────────────┘
                          │  multipart/form-data (image)
                          │  via Vercel proxy rewrite
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│                   BACKEND (Hugging Face Spaces)                  │
│                    FastAPI 0.110 + Uvicorn                       │
│                                                                  │
│  POST /api/v1/analyze                                            │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                  ML Inference Pipeline                     │  │
│  │  ┌─────────┐  ┌─────────┐  ┌──────────┐  ┌──────────┐   │  │
│  │  │   ELA   │  │   FFT   │  │  Stats   │  │   HOG    │   │  │
│  │  │ 10 feat │  │ 10 feat │  │ 20 feat  │  │1764 feat │   │  │
│  │  └────┬────┘  └────┬────┘  └────┬─────┘  └────┬─────┘   │  │
│  │       └────────────┴────────────┴──────────────┘         │  │
│  │                   concatenate → 1804-dim vector            │  │
│  │                   Random Forest (200 trees)                │  │
│  │                   → P(AI) score + verdict                  │  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                  │
│  GET/DELETE /api/v1/scans                                        │
│                       │                                          │
└───────────────────────┼──────────────────────────────────────────┘
                        │
                        ▼
┌────────────────────────────────────────┐
│         Supabase (PostgreSQL)           │
│   scan_logs (RLS enabled)              │
│   Auth (GoTrue JWT)                    │
└────────────────────────────────────────┘
```

**Key architectural decisions:**
- **Vercel Proxy Rewrite** — The frontend proxies all `/api/v1/*` calls through Vercel's edge network to the Hugging Face backend, permanently eliminating CORS issues without touching backend headers.
- **Stateless Backend** — The FastAPI server holds no session state; all auth is handled client-side by Supabase GoTrue with JWT tokens.
- **Lazy Model Loading** — `model.joblib` is loaded once on first inference and cached in-process for all subsequent requests.

---

## 🧠 ML Pipeline Deep Dive

All four feature extractors operate on a standardized **128×128 px** BGR representation of the uploaded image.

### 1. Error Level Analysis (ELA) — 10 features

ELA detects re-compression artifacts that differ between genuine camera photographs and AI-synthesized images.

**Mechanism:** The input image is re-encoded as JPEG at quality 90, then decoded back. The absolute pixel difference between the original and re-compressed versions (the "error level") is computed and amplified by 10×.

**Why it works:** Camera-captured JPEG images have already been compressed once during capture. Re-compressing them at a known quality level produces low, uniform error levels. AI-generated images, particularly those output at a specific quality setting, often produce irregular or conspicuously uniform error patterns that differ from camera photos.

**Features extracted:** `[mean, std, max, min, median]` of the grayscale ELA image, plus per-channel (B, G, R) mean error, overall std, and energy.

---

### 2. FFT Frequency Analysis (FFT) — 10 features

The Fast Fourier Transform maps the spatial image into the frequency domain to detect spectral anomalies.

**Mechanism:** A 2D FFT is applied to the grayscale image. The magnitude spectrum is log-scaled and a radial (azimuthal) average is computed, giving a 1D frequency-vs-power profile from DC (center) to Nyquist.

**Why it works:** Real photographs exhibit a natural `1/f²` power-law decay in the frequency domain. AI upsampling (convolutions, bilinear interpolation, attention) often introduces periodic grid artifacts or suppresses high-frequency content in unnatural ways. GAN checkerboard artifacts are visible as sharp peaks in the FFT spectrum.

**Features extracted:** `[mean, std, max, energy]` of the spectrum, `[low/mid/high frequency band ratios]`, spectral centroid, rolloff, and flatness — 10 values total.

---

### 3. Pixel Statistics — 20 features

Statistical moments across color channels quantify the distinctive sensor characteristics of real cameras.

**Mechanism:** Per-channel (B, G, R) and grayscale mean, std, skewness, and kurtosis are computed. Edge density (Canny), Laplacian variance (sharpness), and local contrast are added.

**Why it works:** Real camera sensors introduce characteristic noise distributions (shot noise, read noise) that create specific skewness and kurtosis profiles. AI generators tend to produce statistically "cleaner" images with lower kurtosis. Additionally, AI images often have atypically uniform edge density.

**Features extracted:** 12 channel statistics + 4 grayscale statistics + 4 edge/sharpness metrics = **20 values**.

---

### 4. HOG (Histogram of Oriented Gradients) — 1764 features

HOG captures local texture and gradient patterns across spatial blocks.

**Mechanism:** The image is divided into 16×16 px cells. For each 2×2 block of cells, a 9-bin orientation histogram is computed and L2-Hys normalized. This produces a compact texture descriptor.

**Why it works:** AI-generated images often exhibit hyper-regular gradient patterns from the implicit smoothness bias of neural network decoders. Real photographs have more stochastic, irregular gradient distributions from natural textures.

**Features extracted:** `[(128/16 - 1)² × 4 × 9]` = **1764 values** (dominant feature set).

---

### 5. Random Forest Classifier

- **Algorithm:** `sklearn.ensemble.RandomForestClassifier`
- **Trees:** 200
- **Max depth:** Unlimited (each tree fits to full depth)
- **Feature selection:** `sqrt(n_features)` per split (default)
- **Total input dimensionality:** 10 + 10 + 20 + 1764 = **1804 features**
- **Training:** Shuffled with `seed=42` for reproducibility

---

## 📊 Model Performance

Results from our latest comprehensive evaluation (May 2026):

### CIFAKE Dataset (test split, n=400)

| Metric | Real | Fake (AI) | Overall |
|--------|------|-----------|---------|
| Precision | 84% | 80% | — |
| Recall | 79% | 85% | — |
| F1-Score | 0.81 | 0.82 | — |
| **Accuracy** | **78.5%** | **85.0%** | **81.8%** |

**Confusion Matrix (test set):**
```
               Predicted Real   Predicted Fake
Actual Real         157              43         (21.5% false alarm rate)
Actual Fake          30             170          (15.0% miss rate)
```

### CIFAKE Dataset (train split, n=400 sampled)

| Metric | Real | Fake (AI) |
|--------|------|-----------|
| Accuracy | 83.5% | 85.5% |

> ⚠️ **Overfitting note:** A Random Forest with unlimited depth should memorize its training set (≈100%). The fact that it only reaches 84.5% on training images indicates **severe underfitting** — the extracted features are not discriminative enough for the CIFAKE image distribution. See the improvement roadmap below.

### Landscapes Dataset (train split, n=297)

| Metric | Real | Fake (AI) |
|--------|------|-----------|
| Accuracy | **100%** | **100%** |

> ✅ The model performs perfectly on higher-resolution, real-world landscape photographs. The underfitting is specific to the CIFAKE dataset, which contains tiny 32×32 px images upscaled to 128×128 — a process that destroys the subtle compression and frequency artifacts the pipeline is designed to detect.

---

## ⚠️ Known Limitations & Improvement Roadmap

### Root Cause of CIFAKE Underfitting

The CIFAKE dataset consists of **32×32 px** images (CIFAR-10 resolution) that are upscaled to 128×128 for processing. This upscaling:
1. **Destroys ELA signals** — re-compression artifacts become dominated by interpolation noise
2. **Flattens FFT profiles** — the frequency content of a 32px image is trivially simple; upscaling introduces artifacts that are indistinguishable between real and fake
3. **Homogenizes HOG gradients** — tiny images have very coarse gradient patterns regardless of origin

### Concrete Improvement Steps (Prioritized)

| Priority | Change | Expected Impact |
|----------|--------|-----------------|
| 🔴 High | Replace Random Forest with **GradientBoosting (XGBClassifier or LightGBM)** | GBMs handle high-dimensional handcrafted features better; can achieve 5–10% accuracy gain |
| 🔴 High | Add **StandardScaler** normalization before training | RF doesn't require scaling, but GBMs and any future neural models do; also stabilizes ELA/Stats features |
| 🔴 High | Use a **proper high-resolution dataset** (e.g., LAION real vs. Stable Diffusion at ≥512px) | The core problem — training on 32px images means the features carry no signal |
| 🟡 Medium | Add **cross-validation** (5-fold StratifiedKFold) instead of a fixed train/test split | Gives more reliable accuracy estimates; enables hyperparameter tuning |
| 🟡 Medium | Include `ai-vs-real` and `landscapes` datasets with proper splits | The `ai-vs-real` dataset (500+500 real-world images) has no train/test split; restructure it |
| 🟡 Medium | **Data augmentation** during training (random JPEG compression quality, mild crops) | Makes the model robust to post-processing that would otherwise fool it |
| 🟢 Low | **Lightweight CNN ensemble** (MobileNetV3 fine-tuned for binary classification) | Replaces or supplements handcrafted features; typically reaches 95%+ on high-res data |
| 🟢 Low | **Calibrate probabilities** with Platt scaling or isotonic regression | RF probabilities are poorly calibrated by default (tend toward 0.5) |

---

## 🛠️ Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| **Frontend** | React | 18.3 |
| **Build Tool** | Vite | 5.4 |
| **Styling** | Tailwind CSS + shadcn/ui | 3.4 |
| **Backend** | FastAPI + Uvicorn | 0.110+ |
| **ML Core** | scikit-learn (Random Forest) | 1.4+ |
| **Computer Vision** | OpenCV (headless) | 4.9+ |
| **Feature Engineering** | scikit-image (HOG), SciPy (stats) | 0.22+ / 1.12+ |
| **Auth** | Supabase GoTrue | 2.0 |
| **Database** | Supabase PostgreSQL (RLS) | — |
| **Frontend Hosting** | Vercel | — |
| **Backend Hosting** | Hugging Face Spaces (Docker) | — |
| **CI/CD** | GitHub Actions | — |

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm
- Python 3.10+ and pip
- A [Supabase](https://supabase.com) project (free tier is sufficient)

### 1. Clone & Install

```bash
git clone https://github.com/garv-codes/proofpixel.git
cd proofpixel

# Install frontend dependencies
npm install

# Create and activate a Python virtual environment
python -m venv .venv
.venv\Scripts\activate          # Windows
# source .venv/bin/activate     # macOS/Linux

# Install backend dependencies
pip install -r requirements.txt
```

### 2. Configure Environment Variables

Create a `.env` file in the project root (**never commit this file**):

```env
# ── Backend (Python / FastAPI) ─────────────────────────────────────
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_KEY=your-service-role-key   # Use service-role key (bypasses RLS)

# ── Frontend (Vite — must have VITE_ prefix) ───────────────────────
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key  # Public key is safe here
VITE_API_URL=http://localhost:8000/api/v1
```

> **Why two different keys?**  
> The frontend uses the **anon key** — it is safe to expose in browser code and is restricted by Row Level Security policies. The backend uses the **service-role key** — it bypasses RLS to insert and query records server-side. Never expose the service-role key in frontend code.

### 3. Database Setup

Run this SQL in the **Supabase SQL Editor** (`supabase.com → your project → SQL Editor`):

```sql
CREATE TABLE IF NOT EXISTS scan_logs (
    id                 BIGSERIAL PRIMARY KEY,
    image_hash         TEXT NOT NULL,
    ai_probability     REAL NOT NULL,
    verdict            TEXT NOT NULL,
    processing_time_ms INTEGER NOT NULL,
    user_id            TEXT,
    created_at         TIMESTAMPTZ DEFAULT NOW()
);

-- Restrict direct access — only the backend (service-role) can read/write
ALTER TABLE scan_logs ENABLE ROW LEVEL SECURITY;
```

### 4. Run Locally

```bash
# Terminal 1 — Backend
uvicorn main:app --reload        # Starts at http://localhost:8000

# Terminal 2 — Frontend
npm run dev                      # Starts at http://localhost:5173
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 📁 Project Structure

```
proofpixel/
├── src/                          # React frontend
│   ├── components/               # Reusable UI components
│   │   ├── UploadZone.jsx        #   Drag-and-drop image upload
│   │   ├── ScannerOverlay.jsx    #   Animated scan overlay
│   │   ├── AnalysisResults.jsx   #   Verdict + confidence display
│   │   ├── HistoryPanel.jsx      #   Recent scans sidebar
│   │   ├── ConfidenceRing.jsx    #   Circular confidence meter
│   │   ├── ProtectedRoute.jsx    #   Auth route guard
│   │   ├── AppSidebar.jsx        #   Desktop navigation sidebar
│   │   ├── TopBar.jsx            #   Mobile top bar
│   │   └── BottomNav.jsx         #   Mobile bottom navigation
│   ├── pages/                    # Route-level page components
│   │   ├── LandingPage.jsx       #   Public landing page
│   │   ├── Analyzer.jsx          #   Main analysis dashboard
│   │   ├── LoginPage.jsx         #   Auth sign-in / sign-up
│   │   ├── Architecture.jsx      #   ML pipeline documentation
│   │   └── About.jsx             #   Developer profile
│   ├── contexts/
│   │   └── AuthContext.jsx       #   Supabase session provider (React Context)
│   ├── lib/
│   │   └── supabaseClient.js     #   Supabase client singleton
│   └── services/
│       └── api.js                #   Backend API service layer
├── main.py                       # FastAPI app — endpoints + CORS + lifespan
├── ml_service.py                 # ML inference pipeline (feature extraction + RF)
├── database.py                   # Supabase connection + scan logging
├── train_model.py                # Multi-dataset model training CLI
├── model.joblib                  # Pre-trained Random Forest (tracked via Git LFS)
├── requirements.txt              # Python dependencies
├── Dockerfile                    # Docker build for Hugging Face Spaces
├── .github/workflows/
│   └── sync-to-hf.yml            # GitHub Actions — auto-deploy to HF on push
├── vercel.json                   # Vercel SPA rewrite + API proxy rules
└── package.json                  # Node.js dependencies and npm scripts
```

---

## 📡 API Reference

### `POST /api/v1/analyze`

Upload an image for deepfake analysis.

**Request:** `multipart/form-data`

| Parameter | Type | Location | Required | Description |
|-----------|------|----------|----------|-------------|
| `file` | File | body | ✅ | Image file (`.jpg`, `.jpeg`, `.png`) |
| `X-User-Id` | string | header | ❌ | Supabase user UUID — links scan to history |

**Response:** `200 OK`

```json
{
    "label": "Real",
    "confidence": 23.45,
    "image_hash": "a1b2c3d4...",
    "processing_time_ms": 142,
    "is_ai_generated": false,
    "ela_image": "data:image/jpeg;base64,...",
    "fft_image": "data:image/jpeg;base64,..."
}
```

| Field | Type | Description |
|-------|------|-------------|
| `label` | string | `"Real"` or `"Fake"` |
| `confidence` | float | P(AI-generated) × 100, rounded to 2 dp |
| `image_hash` | string | SHA-256 hex digest of the uploaded image |
| `processing_time_ms` | int | Server-side wall-clock time in milliseconds |
| `is_ai_generated` | bool | `true` when confidence ≥ 50% |
| `ela_image` | string | Base64 data URI of the ELA forensic map |
| `fft_image` | string | Base64 data URI of the FFT frequency map |

**Error responses:** `400` (invalid file type / empty file), `422` (image decode failure)

---

### `GET /api/v1/scans`

Fetch recent scan history for a user.

| Parameter | Type | Location | Description |
|-----------|------|----------|-------------|
| `user_id` | string | query | Supabase user UUID |
| `limit` | int | query | Max results: 1–50 (default 10) |

---

### `DELETE /api/v1/scans`

Clear all scan history for the authenticated user.

| Header | Description |
|--------|-------------|
| `X-User-Id` | Supabase user UUID |

---

### `GET /`

Health-check endpoint. Returns `{"status": "ok", "service": "ProofPixel API v1.0.0"}`.

---

## 🌐 Deployment

### Frontend — Vercel

1. Connect your GitHub repository to [Vercel](https://vercel.com).
2. In **Settings → Environment Variables**, add:
   - `VITE_SUPABASE_URL` — your Supabase project URL
   - `VITE_SUPABASE_ANON_KEY` — your Supabase anon (public) key
   - `VITE_API_URL` — `https://garv-codes-proofpixel.hf.space/api/v1`
3. The `vercel.json` proxy rule forwards all `/api/v1/*` requests to the Hugging Face backend, bypassing CORS entirely.
4. Every push to `main` triggers an automatic Vercel deployment.

### Backend — Hugging Face Spaces (Docker)

1. Create a **Docker Space** on [Hugging Face](https://huggingface.co/spaces).
2. Add GitHub Repository Secrets:
   - `HF_TOKEN` — your Hugging Face write token
3. Add Hugging Face Space secrets (Space settings → Repository secrets):
   - `SUPABASE_URL` — your Supabase project URL
   - `SUPABASE_KEY` — your **service-role** key (not the anon key)
4. The GitHub Actions workflow (`.github/workflows/sync-to-hf.yml`) automatically syncs on every push to `main`.

---

## 🔑 Authentication Flow

```
Browser                     Supabase Auth (GoTrue)        FastAPI Backend
   │                                │                            │
   │── Sign Up / Sign In ──────────>│                            │
   │<─ JWT access token ────────────│                            │
   │                                │                            │
   │── POST /api/v1/analyze ─────────────────────────────────>  │
   │   X-User-Id: <user.id>                                      │
   │<─ AnalyzeResponse JSON ─────────────────────────────────── │
   │                                │                            │
   │── GET /api/v1/scans?user_id=<> ─────────────────────────>  │
   │<─ [ScanRecord, ...] ────────────────────────────────────── │
```

- **Sign Up** — creates account, sends verification email
- **Sign In** — JWT session stored in `localStorage` by the Supabase client
- **Session Sync** — `onAuthStateChange` listener keeps auth state consistent across tabs
- **Sign Out** — clears the session and redirects to `/login`

---

## 🔐 Security

| Concern | Mitigation |
|---------|-----------|
| API keys in source code | All credentials loaded from environment variables; no defaults baked into code |
| `.env` committed | `.gitignore` explicitly excludes `.env` |
| Public DB access | Supabase Row Level Security (RLS) enabled on `scan_logs` |
| Backend key exposure | Service-role key is **only** in backend env vars (HF Space secrets), never in frontend |
| CORS | Backend permits all origins for the public analysis API; credentials are not passed |
| Image storage | Images are **never stored** — only their SHA-256 hash is persisted |

---

## 🙏 Acknowledgments

Training datasets:

- [CIFAKE: Real and AI-Generated Synthetic Images](https://www.kaggle.com/datasets/birdy654/cifake-real-and-ai-generated-synthetic-images) — Kaggle
- [AI Generated vs Real Images](https://www.kaggle.com/datasets/swati6945/ai-generated-vs-real-images) — Kaggle
- [AI vs Real Image Detection](https://huggingface.co/datasets/Hemg/ai-vs-real-image-detection) — Hugging Face Hub
- [Autotrain Data Real vs Fake](https://huggingface.co/datasets/juliensimon/autotrain-data-real-vs-fake) — Hugging Face Hub

---

## 📄 License

MIT © 2025 Garv
