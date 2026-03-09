---
title: ProofPixel
emoji: 🛡️
colorFrom: gray
colorTo: indigo
sdk: docker
pinned: false
---
<div align="center">
  <img src="public/logo.png" alt="ProofPixel Logo" width="150" />
  <h1>ProofPixel</h1> — AI Image Forensics
</div>

A production-grade deepfake detection platform that analyzes images for AI-generated artifacts using computer vision and machine learning. Built with a React frontend, FastAPI backend, and a Random Forest classifier trained on HOG features.

> **Live Demo:** [proofpixel.vercel.app](https://proofpixel.vercel.app) · **API:** [proofpixel.onrender.com](https://proofpixel.onrender.com)

---

## ✨ Features

- **AI Detection** — Upload any image for instant deepfake analysis via HOG + Random Forest
- **Supabase Auth** — Email/password authentication with session persistence
- **Scan History** — User-scoped history panel showing past analyses with verdict badges
- **Modern UI** — Dark cybersecurity theme with glassmorphism effects and Tailwind animations
- **Responsive** — Two-column desktop layout (analyzer + history) with stacked mobile view

---

## 🏗️ Tech Stack

| Layer     | Technology                                            |
| --------- | ----------------------------------------------------- |
| Frontend  | React 18, Vite, Tailwind CSS, shadcn/ui, Lucide Icons |
| Backend   | FastAPI, Uvicorn (Python 3.10+)                       |
| ML        | OpenCV, scikit-image (HOG), scikit-learn (Random Forest) |
| Auth      | Supabase (GoTrue)                                     |
| Database  | Supabase (PostgreSQL)                                 |
| Hosting   | Vercel (frontend), Render (backend)                   |

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm
- Python 3.10+ and pip
- A [Supabase](https://supabase.com) project

### 1. Clone & Install

```bash
git clone https://github.com/garv-codes/proofpixel.git
cd proofpixel

# Frontend
npm install

# Backend
pip install -r requirements.txt
```

### 2. Environment Variables

Create a `.env` file in the project root:

```env
# Backend (Python)
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_KEY=your-anon-key

# Frontend (Vite — must have VITE_ prefix)
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_API_URL=http://localhost:8000/api/v1
```

### 3. Database Setup

Run this SQL in the Supabase **SQL Editor**:

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
```

### 4. Run Locally

```bash
# Terminal 1 — Backend
uvicorn main:app --reload        # http://localhost:8000

# Terminal 2 — Frontend
npm run dev                      # http://localhost:5173
```

---

## 🤖 ML Pipeline

### How It Works

```
Image Upload → Resize (128×128) → Grayscale → HOG Features (8100-dim) → Random Forest → Verdict
```

1. **Preprocessing** — Resize to 128×128, convert to grayscale
2. **Feature Extraction** — Histogram of Oriented Gradients (HOG) with 9 orientations, 8×8 pixel cells, 2×2 block normalization
3. **Classification** — Random Forest (50 trees, max depth 20) trained on combined CIFAKE + AI-vs-Real datasets
4. **Result** — Probability score (0–100%) and binary verdict (Real / AI-Generated)

### Training the Model

The model is pre-trained and included as `model.joblib`. To retrain:

```bash
# Download datasets from Kaggle:
# 1. https://www.kaggle.com/datasets/birdy654/cifake-real-and-ai-generated-synthetic-images
# 2. https://www.kaggle.com/datasets/swati6945/ai-generated-vs-real-images

# Train with both datasets combined
python train_model.py \
    --dataset ./cifake \
    --dataset ./ai-vs-real \
    --max-per-class 5000 \
    --n-estimators 50 \
    --max-depth 20
```

| Parameter | Default | Description |
|-----------|---------|-------------|
| `--dataset` | required | Path(s) to dataset dirs (repeatable) |
| `--max-per-class` | 10000 | Max images per class per dataset (0 = all) |
| `--n-estimators` | 200 | Number of trees in the forest |
| `--max-depth` | None | Max tree depth (None = unlimited) |
| `--n-jobs` | -1 | Parallel threads (-1 = all cores) |

---

## 📁 Project Structure

```
proofpixel/
├── src/                          # React frontend
│   ├── components/               # Reusable UI components
│   │   ├── UploadZone.jsx        #   Glassmorphism drag-and-drop upload
│   │   ├── ScannerOverlay.jsx    #   Scan animation overlay
│   │   ├── AnalysisResults.jsx   #   Verdict display with confidence score
│   │   ├── HistoryPanel.jsx      #   Recent scans sidebar
│   │   ├── ProtectedRoute.jsx    #   Auth route guard
│   │   ├── AppSidebar.jsx        #   Desktop sidebar navigation
│   │   ├── TopBar.jsx            #   Mobile top bar
│   │   └── BottomNav.jsx         #   Mobile bottom navigation
│   ├── pages/                    # Route-level pages
│   │   ├── Analyzer.jsx          #   Main analysis page (state machine)
│   │   ├── LoginPage.jsx         #   Auth sign-in / sign-up
│   │   ├── Architecture.jsx      #   ML pipeline documentation
│   │   └── About.jsx             #   Developer profile
│   ├── contexts/
│   │   └── AuthContext.jsx       #   Supabase session provider
│   ├── lib/
│   │   └── supabaseClient.js     #   Supabase client singleton
│   └── services/
│       └── api.js                #   Backend API service layer
├── main.py                       # FastAPI application + endpoints
├── ml_service.py                 # ML inference pipeline (HOG + RF)
├── database.py                   # Supabase connection & scan logging
├── train_model.py                # Multi-dataset model training script
├── model.joblib                  # Pre-trained Random Forest model (Git LFS)
├── requirements.txt              # Python dependencies
├── vercel.json                   # Vercel SPA rewrite config
├── render.yaml                   # Render deployment blueprint
└── package.json                  # Node.js dependencies & scripts
```

---

## 🌐 Deployment

### Frontend (Vercel)

1. Connect your GitHub repo to [Vercel](https://vercel.com)
2. Set environment variables in Vercel Dashboard → Settings → Environment Variables:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_API_URL` = `https://proofpixel.onrender.com/api/v1`
3. Deploy — Vercel auto-builds on every push

### Backend (Render)

1. Connect your GitHub repo to [Render](https://render.com)
2. Create a **Web Service** with:
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `uvicorn main:app --host 0.0.0.0 --port $PORT`
3. Set environment variables: `SUPABASE_URL`, `SUPABASE_KEY`
4. Deploy

> **Note:** The free tier has 512 MB RAM. The model is optimized at ~6 MB to fit within this limit.

---

## 📡 API Reference

### `POST /api/v1/analyze`

Upload an image for deepfake analysis.

| Parameter | Type | Location | Description |
|-----------|------|----------|-------------|
| `file` | File | body (multipart) | Image file (.jpg, .png) |
| `X-User-Id` | string | header (optional) | Supabase user ID for history |

**Response:**
```json
{
    "label": "Real",
    "confidence": 23.45,
    "image_hash": "a1b2c3...",
    "processing_time_ms": 142,
    "is_ai_generated": false
}
```

### `GET /api/v1/scans`

Fetch recent scan history for a user.

| Parameter | Type | Location | Description |
|-----------|------|----------|-------------|
| `user_id` | string | query | Supabase user UUID |
| `limit` | int | query | Max results (1–50, default 10) |

---

## 🔑 Authentication Flow

```
LoginPage → Supabase Auth → AuthContext (onAuthStateChange) → ProtectedRoute → Analyzer
```

- **Sign Up** — Creates account, sends verification email
- **Sign In** — JWT session stored in localStorage by Supabase client
- **Session Sync** — `onAuthStateChange` listener keeps state in sync across tabs
- **Sign Out** — Clears session, redirects to `/login`

---

## 📄 License

MIT
