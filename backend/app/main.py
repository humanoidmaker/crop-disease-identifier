from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from app.core.config import settings
from app.core.database import init_db
from app.api import auth, predict, settings as settings_api

@asynccontextmanager
async def lifespan(app):
    await init_db()
    from app.ml.crop_classifier import classifier
    classifier.load_model()
    yield

app = FastAPI(title="CropDoc API", version="1.0.0", lifespan=lifespan)
app.add_middleware(CORSMiddleware, allow_origins=settings.CORS_ORIGINS, allow_credentials=True, allow_methods=["*"], allow_headers=["*"])
app.include_router(auth.router)
app.include_router(predict.router)
app.include_router(settings_api.router)

@app.get("/api/health")
async def health():
    from app.ml.crop_classifier import classifier
    return {
        "status": "ok",
        "app": "CropDoc",
        "model_loaded": classifier.model is not None,
        "device": str(classifier.device),
    }

@app.get("/api/stats")
async def stats():
    from app.core.database import get_db as gdb
    db = await gdb()
    from datetime import datetime, timezone
    now = datetime.now(timezone.utc)
    start = now.replace(hour=0, minute=0, second=0, microsecond=0)

    total_scans = await db.predictions.count_documents({})
    today_scans = await db.predictions.count_documents({"created_at": {"$gte": start}})
    total_users = await db.users.count_documents({})

    pipeline = [
        {"$group": {"_id": "$top_prediction", "count": {"$sum": 1}}},
        {"$sort": {"count": -1}},
        {"$limit": 10},
    ]
    diseases = await db.predictions.aggregate(pipeline).to_list(10)

    return {
        "stats": {
            "total_scans": total_scans,
            "today_scans": today_scans,
            "total_users": total_users,
            "top_diseases": [{"disease": d["_id"], "count": d["count"]} for d in diseases],
        }
    }
