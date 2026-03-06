# ProofPixel — AI Image Forensics

A production-grade deepfake detection platform. Upload any image for instant forensic analysis powered by computer vision and machine learning.

## Tech Stack

| Layer     | Technology                                   |
| --------- | -------------------------------------------- |
| Frontend  | React 18, JavaScript, Tailwind CSS, shadcn/ui |
| Backend   | FastAPI (Python 3.10+)                       |
| ML        | OpenCV, scikit-image (HOG), scikit-learn (RF) |
| Database  | Supabase (PostgreSQL)                        |

## Getting Started

### Frontend

```bash
npm install
npm run dev          # starts on http://localhost:5173
```

### Backend

```bash
pip install -r requirements.txt
uvicorn main:app --reload   # starts on http://localhost:8000
```

### Supabase Setup

1. Create a project at [supabase.com](https://supabase.com)
2. Run this SQL in the **SQL Editor**:

```sql
CREATE TABLE IF NOT EXISTS scan_logs (
    id                BIGSERIAL PRIMARY KEY,
    image_hash        TEXT NOT NULL,
    ai_probability    REAL NOT NULL,
    verdict           TEXT NOT NULL,
    processing_time_ms INTEGER NOT NULL,
    created_at        TIMESTAMPTZ DEFAULT NOW()
);
```

3. Copy your **Project URL** and **anon key** from Settings → API
4. Create a `.env` file in the project root:

```env
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_KEY=your-anon-or-service-role-key
```

## Project Structure

```
proofpixel/
├── src/                   # React frontend
│   ├── components/        # Reusable UI components
│   ├── pages/             # Route-level page components
│   ├── services/          # API service layer
│   └── hooks/             # Custom React hooks
├── main.py                # FastAPI application
├── ml_service.py          # ML inference pipeline
├── database.py            # Supabase connection & logging
├── train_model.py         # CIFAKE model training script
└── requirements.txt       # Python dependencies
```

## License

MIT
