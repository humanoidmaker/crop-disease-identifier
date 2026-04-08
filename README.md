# CropDoc — Crop Disease Identifier

An AI-powered crop disease identification tool built with FastAPI, PyTorch, React, and MongoDB. Upload a photo of an affected leaf to get instant disease identification with treatment recommendations and prevention tips.

**Built by [Humanoid Maker](https://www.humanoidmaker.com)**

## Features

- **AI Disease Identification**: Upload leaf images for instant classification across 10 conditions
- **Treatment Recommendations**: Get specific treatment advice for each detected disease
- **Prevention Tips**: Actionable prevention strategies for each condition
- **Camera Capture**: Take photos directly from your device camera (great for field use)
- **Disease Guide**: Complete reference of all detectable diseases with symptoms and treatments
- **Affected Crops Info**: Know which crops are commonly affected by each disease
- **Scan History**: Complete history with treatment records
- **User Authentication**: Secure registration, login, email verification, password reset
- **Responsive UI**: Mobile-friendly for field use

## Detectable Diseases

| Disease | Common Crops |
|---------|-------------|
| Healthy | General (no disease detected) |
| Bacterial Blight | Rice, Cotton, Beans, Tomato, Pepper |
| Leaf Rust | Wheat, Barley, Corn, Soybean, Coffee |
| Powdery Mildew | Wheat, Grapes, Cucurbits, Peas |
| Leaf Spot | Tomato, Pepper, Strawberry, Apple, Banana |
| Mosaic Virus | Tobacco, Tomato, Cucumber, Pepper, Beans |
| Early Blight | Tomato, Potato, Eggplant, Pepper |
| Late Blight | Potato, Tomato |
| Anthracnose | Mango, Banana, Beans, Pepper, Grapes |
| Downy Mildew | Grapes, Cucurbits, Lettuce, Onion, Spinach |

## Model Information

| Property | Value |
|----------|-------|
| Architecture | EfficientNet-B3 |
| Pre-trained On | ImageNet (ILSVRC 2012) |
| Input Size | 224 x 224 pixels |
| Output Classes | 10 |
| Framework | PyTorch |
| Download Size | ~48 MB (auto-downloaded on first run) |

## GPU Requirements

| Mode | Hardware | VRAM | Notes |
|------|----------|------|-------|
| CPU Inference | Any modern CPU | 4 GB RAM | Slower, ~2-5s per image |
| GPU Inference | NVIDIA GPU | 2 GB VRAM | Fast, <1s per image |
| Recommended | NVIDIA GTX 1060+ | 4 GB VRAM | Optimal performance |
| Production | NVIDIA T4 / RTX 3060+ | 8 GB VRAM | For concurrent users |

## Tech Stack

- **Backend**: Python 3.11, FastAPI, PyTorch, Motor (async MongoDB)
- **Frontend**: React 18, TypeScript, Tailwind CSS, Vite
- **Database**: MongoDB 7
- **ML Model**: EfficientNet-B3 (torchvision)

## Quick Start

### Prerequisites

- Python 3.11+
- Node.js 20+
- MongoDB 7+
- (Optional) NVIDIA GPU with CUDA

### Backend Setup

```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
python scripts/seed_admin.py
uvicorn app.main:app --reload
```

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

### Docker Compose

```bash
docker-compose up -d
```

### Default Admin Credentials

- Email: `admin@cropdoc.local`
- Password: `admin123`

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/predict/crop` | Upload leaf photo for disease identification |
| GET | `/api/predict/history` | Get user's prediction history |
| GET | `/api/predict/:id` | Get specific prediction with treatment details |
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login |
| GET | `/api/health` | Health check |
| GET | `/api/stats` | Application statistics |

## Accuracy Disclaimer

This tool uses a pre-trained EfficientNet-B3 model with ImageNet weights. For production-grade agricultural accuracy, the model should be fine-tuned on a curated plant disease dataset (e.g., PlantVillage). The current model provides directional results suitable for demonstration and educational purposes.

**This is a screening tool for crop disease identification. Results should be verified by an agricultural expert for accurate diagnosis and treatment planning.**

## License

MIT License - see [LICENSE](LICENSE) file.
