#!/usr/bin/env python3
"""
Generate bcrypt hash for admin password
"""

from passlib.context import CryptContext
import uuid
from datetime import datetime, timezone

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_password(password: str) -> str:
    return pwd_context.hash(password)

if __name__ == "__main__":
    admin_email = "isaactrinidadllc@gmail.com"
    admin_password = "admin123"
    
    # Generate password hash
    password_hash = hash_password(admin_password)
    user_id = str(uuid.uuid4())
    current_time = datetime.now(timezone.utc).isoformat()
    
    print("🔐 Admin User Creation Details:")
    print("=" * 50)
    print(f"ID: {user_id}")
    print(f"Email: {admin_email}")
    print(f"Password Hash: {password_hash}")
    print(f"Full Name: Administrator")
    print(f"Subscription Plan: business-pro-elite")
    print(f"Is Admin: true")
    print(f"Email Confirmed: true")
    print(f"Points: 0")
    print(f"Streak Days: 0")
    print(f"Created At: {current_time}")
    print("=" * 50)
    
    print("\n📋 Manual Creation Steps in Supabase Dashboard:")
    print("1. Go to https://supabase.com/dashboard")
    print("2. Select your project")
    print("3. Go to Table Editor → users table")
    print("4. Click 'Insert' → 'Insert row'")
    print("5. Copy and paste the values above into the corresponding fields")
    print("6. Click 'Save'")
    
    print(f"\n✅ After creation, you can login with:")
    print(f"   Email: {admin_email}")
    print(f"   Password: {admin_password}")