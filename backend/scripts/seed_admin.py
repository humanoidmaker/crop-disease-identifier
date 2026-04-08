import asyncio, sys
sys.path.insert(0, ".")
from app.core.database import init_db, get_db
from app.utils.auth import hash_password

async def seed():
    await init_db()
    db = await get_db()
    if await db.users.find_one({"email": "admin@cropdoc.local"}):
        print("Admin already exists")
        return
    await db.users.insert_one({
        "email": "admin@cropdoc.local",
        "password_hash": hash_password("admin123"),
        "name": "Admin",
        "role": "admin",
        "is_active": True,
        "email_verified": True,
    })
    print("Admin user created: admin@cropdoc.local / admin123")

asyncio.run(seed())
