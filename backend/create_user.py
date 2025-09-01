#!/usr/bin/env python3
"""
Create or update a user directly in MongoDB for BudgetWise.

Usage examples:
  # Load env from backend/.env (MONGO_URL, DB_NAME) and create confirmed free user
  python create_user.py --email isaactrinidadllc@gmail.com --password Password123 --full-name "Isaac Trinidad" --confirm

  # Reset password for an existing user and keep unconfirmed
  python create_user.py --email user@example.com --password NewTemp123
"""

import os
import sys
import argparse
import uuid
from datetime import datetime, timezone

try:
    from dotenv import load_dotenv
except Exception:
    load_dotenv = None

try:
    import bcrypt
    from pymongo import MongoClient
except Exception as e:
    print("Missing dependencies. Install backend requirements: pip install -r backend/requirements.txt")
    raise


def hash_password(pw: str) -> str:
    return bcrypt.hashpw(pw.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def main():
    parser = argparse.ArgumentParser(description="Create or update a BudgetWise user")
    parser.add_argument("--email", required=True, help="User email")
    parser.add_argument("--password", required=True, help="Temporary/plain password to set")
    parser.add_argument("--full-name", dest="full_name", default=None, help="Full name (defaults to email local part)")
    parser.add_argument("--plan", default="free", help="Subscription plan id (default: free)")
    parser.add_argument("--confirm", action="store_true", help="Mark email as confirmed")
    parser.add_argument("--admin", action="store_true", help="Grant admin role")
    parser.add_argument("--mongo-url", dest="mongo_url", default=None, help="Override MONGO_URL")
    parser.add_argument("--db-name", dest="db_name", default=None, help="Override DB_NAME")
    args = parser.parse_args()

    # Load env from backend/.env if available
    if load_dotenv:
        this_dir = os.path.dirname(os.path.abspath(__file__))
        env_path = os.path.join(this_dir, ".env")
        if os.path.exists(env_path):
            load_dotenv(env_path)

    mongo_url = args.mongo_url or os.environ.get("MONGO_URL")
    db_name = args.db_name or os.environ.get("DB_NAME")

    if not mongo_url or not db_name:
        print("Error: MONGO_URL and DB_NAME must be provided via env or flags.")
        print("Example: MONGO_URL=\"mongodb+srv://...\" DB_NAME=\"budgetwise\" python create_user.py --email ...")
        sys.exit(1)

    client = MongoClient(mongo_url)
    db = client[db_name]

    email = args.email.strip().lower()
    password_hashed = hash_password(args.password)
    full_name = args.full_name or email.split("@")[0]

    existing = db.users.find_one({"email": email})
    now_iso = datetime.now(timezone.utc).isoformat()

    if existing:
        # Update
        update = {
            "password": password_hashed,
            "full_name": full_name,
            "subscription_plan": args.plan,
            "updated_at": now_iso,
        }
        if args.confirm:
            update.update({
                "email_confirmed": True,
                "email_confirmation_token": None,
            })
        if args.admin:
            update["is_admin"] = True

        db.users.update_one({"id": existing.get("id")}, {"$set": update})
        user_id = existing.get("id")
        print(f"Updated existing user: {email} (id={user_id})")
    else:
        # Create new
        user_id = str(uuid.uuid4())
        doc = {
            "id": user_id,
            "email": email,
            "full_name": full_name,
            "subscription_plan": args.plan,
            "created_at": now_iso,
            "points": 0,
            "streak_days": 0,
            "last_login": None,
            "email_confirmed": bool(args.confirm),
            "email_confirmation_token": None,
            "email_confirmation_sent_at": None,
            "is_admin": bool(args.admin),
            "password": password_hashed,
        }
        db.users.insert_one(doc)
        print(f"Created user: {email} (id={user_id})")

    client.close()
    print("Done.")


if __name__ == "__main__":
    main()
