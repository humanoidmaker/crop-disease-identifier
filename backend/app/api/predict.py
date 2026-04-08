from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from bson import ObjectId
from datetime import datetime, timezone
from app.core.database import get_db
from app.utils.auth import get_current_user
from app.ml.crop_classifier import classifier
import base64

router = APIRouter(prefix="/api/predict", tags=["predict"])

MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB
ALLOWED_TYPES = {"image/jpeg", "image/png", "image/webp", "image/jpg"}

@router.post("/crop")
async def predict_crop(file: UploadFile = File(...), user=Depends(get_current_user), db=Depends(get_db)):
    if file.content_type not in ALLOWED_TYPES:
        raise HTTPException(400, f"Unsupported file type: {file.content_type}. Use JPG, PNG, or WebP.")

    image_bytes = await file.read()
    if len(image_bytes) > MAX_FILE_SIZE:
        raise HTTPException(400, "File too large. Maximum size is 10MB.")

    try:
        results = classifier.predict(image_bytes)
    except Exception as e:
        raise HTTPException(500, f"Prediction failed: {str(e)}")

    image_b64 = base64.b64encode(image_bytes).decode("utf-8")
    thumbnail_b64 = image_b64[:200000] if len(image_b64) > 200000 else image_b64

    prediction_doc = {
        "user_id": user["id"],
        "filename": file.filename,
        "content_type": file.content_type,
        "file_size": len(image_bytes),
        "image_thumbnail": thumbnail_b64,
        "top_prediction": results["top_prediction"],
        "confidence": results["confidence"],
        "severity": results["severity"],
        "treatment": results["treatment"],
        "prevention": results["prevention"],
        "affected_crops": results["affected_crops"],
        "all_predictions": results["all_predictions"],
        "device": results["device"],
        "created_at": datetime.now(timezone.utc),
    }
    result = await db.predictions.insert_one(prediction_doc)

    return {
        "success": True,
        "prediction_id": str(result.inserted_id),
        **results,
    }

@router.get("/history")
async def get_history(skip: int = 0, limit: int = 20, user=Depends(get_current_user), db=Depends(get_db)):
    cursor = db.predictions.find(
        {"user_id": user["id"]},
        {"image_thumbnail": 0}
    ).sort("created_at", -1).skip(skip).limit(limit)
    predictions = []
    async for doc in cursor:
        doc["id"] = str(doc.pop("_id"))
        predictions.append(doc)
    total = await db.predictions.count_documents({"user_id": user["id"]})
    return {"success": True, "predictions": predictions, "total": total}

@router.get("/{prediction_id}")
async def get_prediction(prediction_id: str, user=Depends(get_current_user), db=Depends(get_db)):
    try:
        doc = await db.predictions.find_one({"_id": ObjectId(prediction_id), "user_id": user["id"]})
    except Exception:
        raise HTTPException(400, "Invalid prediction ID")
    if not doc:
        raise HTTPException(404, "Prediction not found")
    doc["id"] = str(doc.pop("_id"))
    return {"success": True, "prediction": doc}
