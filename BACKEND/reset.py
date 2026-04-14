from database.database import SessionLocal
from models import User
from auth import get_password_hash

db = SessionLocal()
users = db.query(User).all()
if users:
    target_user = None
    for u in users:
        if u.username == "user":
            target_user = u
            break
    if not target_user:
        target_user = users[0]
    target_user.hashed_password = get_password_hash("Admin!1234")
    db.commit()
    print(f"SUCCESS:{target_user.username}")
else:
    print("NO_USERS")
db.close()
