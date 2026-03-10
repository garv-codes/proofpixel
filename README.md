---
title: ProofPixel
emoji: 🛡️
colorFrom: gray
colorTo: indigo
sdk: docker
pinned: false
---

<div align="center">
  <h1>🛡️ ProofPixel — AI Image Forensics</h1>
  <p><strong>A Forensic Engine for Detecting AI-Generated Images via Hybrid Machine Learning</strong></p>
  
  <p>
    <img src="https://img.shields.io/badge/Python-3.9+-blue.svg?style=for-the-badge&logo=python&logoColor=white" alt="Python" />
    <img src="https://img.shields.io/badge/React-18-61DAFB.svg?style=for-the-badge&logo=react&logoColor=black" alt="React" />
    <img src="https://img.shields.io/badge/FastAPI-0.110+-009688.svg?style=for-the-badge&logo=fastapi&logoColor=white" alt="FastAPI" />
    <img src="https://img.shields.io/badge/scikit--learn-1.4+-F7931E.svg?style=for-the-badge&logo=scikit-learn&logoColor=white" alt="Scikit-Learn" />
  </p>
</div>

ProofPixel is a production-grade forensic tool designed to combat digital misinformation by detecting AI-generated images. It utilizes a sophisticated hybrid machine learning pipeline to analyze visual artifacts across multiple domains, providing users with real-time, explainable intelligence.

> **Live Demo:** [proofpixel.vercel.app](https://proofpixel.vercel.app) · **API:** [garv-codes-proofpixel.hf.space](https://garv-codes-proofpixel.hf.space)

---

## ✨ Key Features

- **Real-Time Analysis**: Instantly classify images as real or AI-generated with low latency.
- **Explainable AI (XAI) Forensic Maps**: Go beyond binary verdicts. ProofPixel generates visual forensic maps (ELA and FFT) to highlight the exact regions and frequencies that triggered the AI detector.
- **High Accuracy**: Achieves a **90.0% Test Accuracy** across diverse generator topologies (GANs, Diffusion Models).
- **Supabase Auth**: Email/password authentication with session persistence.
- **Scan History**: User-scoped history panel showing past analyses with verdict badges.

---

## 🧠 Core Architecture: Multi-Feature Fusion Pipeline

ProofPixel moves beyond simple pixel-level CNNs by employing a **Multi-Feature Fusion** pipeline. This approach extracts mathematical inconsistencies unique to AI image synthesis targeting three distinct forensic domains:

1. **ELA (Error Level Analysis)**
   * **Mechanism**: Compresses the image at a known quality level and computes the residual difference.
   * **Purpose**: Identifies compression inconsistencies. AI-generated images or spliced regions often exhibit irregular compression signatures compared to natural camera photographs.
2. **FFT (Fast Fourier Transform)**
   * **Mechanism**: Maps the spatial image into the frequency domain.
   * **Purpose**: Detects high-frequency artifacts. Convolutional upsampling (common in GANs and Diffusion models) frequently leaves unnatural periodic frequencies that are invisible to the human eye but glaringly apparent in the FFT power spectrum.
3. **Pixel Statistics & HOG (Histogram of Oriented Gradients)**
   * **Mechanism**: Extracts structural gradients and local texture variations.
   * **Purpose**: Captures unnatural smoothness or hyper-regular edge alignments characteristic of synthetic generation.

### Model Specifications
- **Algorithm**: `RandomForestClassifier` (optimized for multi-dimensional feature variance).
- **Training Data**: Trained on a massive, highly-diversified dataset of **32,000 images** curated from the CIFAKE and AI-vs-Real corpuses.
- **Performance**: Validated on holdout sets, achieving a robust **90.0% overall accuracy**.

---

## 💻 User Interface

The frontend is built with **React** and **Tailwind CSS**, delivering a highly polished, responsive, and intuitive "cyber-forensic" aesthetic.
- **XAI Integration**: The results dashboard dynamically renders the backend-generated ELA and FFT Base64 maps alongside the authenticity score, transforming a black-box ML prediction into an auditable forensic breakdown.
- **Modern UI**: Dark cybersecurity theme with glassmorphism effects and Tailwind animations.

---

## 🛠️ Tech Stack

| Layer     | Technology                                            |
| --------- | ----------------------------------------------------- |
| Frontend  | React 18, Vite, Tailwind CSS, shadcn/ui, Lucide Icons |
| Backend   | FastAPI, Uvicorn (Python 3.10+)                       |
| ML        | OpenCV, scikit-image (HOG), scikit-learn (Random Forest) |
| Auth      | Supabase (GoTrue)                                     |
| Database  | Supabase (PostgreSQL)                                 |
| Hosting   | Vercel (frontend), Hugging Face Spaces (backend)      |

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm
- Python 3.9+ and pip
- A [Supabase](https://supabase.com) project

### 1. Clone & Install

```bash
git clone https://github.com/garv-codes/proofpixel.git
cd proofpixel

# Frontend
npm install

# Backend
python -m venv .venv
source .venv/bin/activate  # Or `.venv\Scripts\activate` on Windows
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
└── package.json                  # Node.js dependencies & scripts
```

---

## 🌐 Deployment

### Frontend (Vercel)

1. Connect your GitHub repo to [Vercel](https://vercel.com).
2. Set environment variables in Vercel Dashboard → Settings → Environment Variables:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_API_URL` = `https://garv-codes-proofpixel.hf.space/api/v1`
3. Deploy — Vercel auto-builds on every push.

### Backend (Hugging Face Spaces)

1. Create a new **Docker Space** on [Hugging Face](https://huggingface.co/spaces).
2. The repository includes an automated GitHub Actions workflow (`.github/workflows/sync-to-hf.yml`) that pushes directly to the Space.
3. Add your `HF_TOKEN`, `HF_USERNAME`, and `HF_SPACE_NAME` to your GitHub Repository Secrets.
4. Set the `SUPABASE_URL` and `SUPABASE_KEY` secrets within the Hugging Face Space settings.

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
    "is_ai_generated": false,
    "ela_image": "base64...",
    "fft_image": "base64..."
}
```

### `GET /api/v1/scans`

Fetch recent scan history for a user.

| Parameter | Type | Location | Description |
|-----------|------|----------|-------------|
| `user_id` | string | query | Supabase user UUID |
| `limit` | int | query | Max results (1–50, default 10) |

### `DELETE /api/v1/scans`

Clear your personal scan history logs.

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

## 🙏 Acknowledgments

The machine learning models driving ProofPixel were significantly accelerated by the incredible open-source datasets provided by the Kaggle data science community:
- [CIFAKE: Real and AI-Generated Synthetic Images](https://www.kaggle.com/datasets/birdy654/cifake-real-and-ai-generated-synthetic-images)
- [AI Generated vs Real Images](https://www.kaggle.com/datasets/swati6945/ai-generated-vs-real-images)

In addition, we deeply appreciate the dataset access provided by the Hugging Face Hub to counteract model bias on real-world scenery:
- [AI vs Real Image Detection](https://huggingface.co/datasets/Hemg/ai-vs-real-image-detection)
- [Autotrain Data Real vs Fake](https://huggingface.co/datasets/juliensimon/autotrain-data-real-vs-fake)

---

## 📄 License

MIT
