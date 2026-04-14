import os
import sys
from dotenv import load_dotenv

# Switch context to the backend so it loads the correct .env file
backend_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "BACKEND"))
os.chdir(backend_dir)
sys.path.append(backend_dir)
load_dotenv(os.path.join(backend_dir, ".env"))

from database.database import SessionLocal
from models import User

def make_admin(username: str):
    db = SessionLocal()
    try:
        user = db.query(User).filter(
            (User.username == username) | (User.email == username)
        ).first()
        if not user:
            print(f"Error: User or Email '{username}' not found in database.")
            return

        if user.is_admin:
            print(f"User '{username}' is already an admin.")
            return

        user.is_admin = True
        db.commit()
        print(f"✅ Success! Privileges escalated. '{username}' is now an Admin.")
    except Exception as e:
        print(f"An error occurred: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python make_admin.py <username>")
        sys.exit(1)
        
    username_target = sys.argv[1]
    make_admin(username_target)
