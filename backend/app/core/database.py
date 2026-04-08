from motor.motor_asyncio import AsyncIOMotorClient
from app.core.config import settings

client = None
db = None

async def get_db():
    return db

async def init_db():
    global client, db
    client = AsyncIOMotorClient(settings.MONGODB_URI)
    db_name = settings.MONGODB_URI.rsplit("/", 1)[-1].split("?")[0] or "cropdoc_db"
    db = client[db_name]
    await db.users.create_index("email", unique=True)
    await db.predictions.create_index("user_id")
    await db.predictions.create_index("created_at")
    if not await db.settings.find_one({"key": "app_name"}):
        await db.settings.insert_many([
            {"key": "app_name", "value": "CropDoc"},
            {"key": "model_name", "value": "efficientnet_b3"},
            {"key": "org_name", "value": "Humanoid Maker"},
            {"key": "org_url", "value": "https://www.humanoidmaker.com"},
            {"key": "max_file_size_mb", "value": "10"},
            {"key": "supported_formats", "value": "jpg,jpeg,png,webp"},
        ])

    email_defaults = [
        {"key": "smtp_host", "value": ""},
        {"key": "smtp_port", "value": "587"},
        {"key": "smtp_user", "value": ""},
        {"key": "smtp_pass", "value": ""},
        {"key": "smtp_from", "value": ""},
        {"key": "email_verification_enabled", "value": "true"},
        {"key": "email_welcome_enabled", "value": "true"},
        {"key": "email_password_reset_enabled", "value": "true"},
        {"key": "email_password_changed_enabled", "value": "true"},
        {"key": "require_email_verification", "value": "false"},
    ]
    for d in email_defaults:
        await db.settings.update_one({"key": d["key"]}, {"$setOnInsert": d}, upsert=True)
