# ProofPixel — AI Image Forensics

A production-grade deepfake detection platform. Upload any image for instant forensic analysis powered by computer vision and machine learning.

## Tech Stack

| Layer     | Technology                                   |
| --------- | -------------------------------------------- |
| Frontend  | React 18, TypeScript, Tailwind CSS, shadcn/ui |
| Backend   | FastAPI (Python 3.10+)                       |
| ML        | OpenCV, scikit-image (HOG), scikit-learn (RF) |
| Database  | MySQL 8+                                     |

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

### Environment Variables

Create a `.env` file in the project root:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=deepfake_detector
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
├── database.py            # MySQL connection & logging
└── requirements.txt       # Python dependencies
```

## License

MIT
