#!/usr/bin/env python3
"""
Create admin user in Supabase with proper password hashing
"""

import asyncio
import os
import uuid
from datetime import datetime, timezone
from dotenv import load_dotenv
from passlib.context import CryptContext
from supabase_db import create_user, get_user_by_email

# Load environment variables
load_dotenv()

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_password(password: str) -> str:
    return pwd_context.hash(password)

async def main():
    admin_email = "isaactrinidadllc@gmail.com"
    admin_password = "admin123"
    
    print(f"🔍 Checking if admin user exists: {admin_email}")
    
    try:
        # Check if user already exists
        existing_user = await get_user_by_email(admin_email)
        
        if existing_user:
            print(f"✅ Admin user already exists!")
            print(f"   Email: {existing_user['email']}")
            print(f"   Is Admin: {existing_user.get('is_admin', False)}")
            print(f"   Subscription Plan: {existing_user.get('subscription_plan', 'N/A')}")
            return
        
        print(f"⚠️  Admin user not found. Creating new admin user...")
        
        # Create new admin user
        hashed_password = hash_password(admin_password)
        
        user_data = {
            "id": str(uuid.uuid4()),
            "email": admin_email,
            "password": hashed_password,
            "full_name": "Administrator",
            "subscription_plan": "business-pro-elite",
            "is_admin": True,
            "email_confirmed": True,
            "points": 0,
            "streak_days": 0,
            "created_at": datetime.now(timezone.utc)
        }
        
        created_user = await create_user(user_data)
        
        if created_user:
            print(f"🎉 SUCCESS: Admin user created!")
            print(f"   ID: {created_user['id']}")
            print(f"   Email: {created_user['email']}")
            print(f"   Is Admin: {created_user['is_admin']}")
            print(f"   Subscription Plan: {created_user['subscription_plan']}")
            print(f"\n✅ You can now login with:")
            print(f"   Email: {admin_email}")
            print(f"   Password: {admin_password}")
        else:
            print(f"❌ Failed to create admin user")
            
    except Exception as e:
        print(f"❌ Error: {e}")
        print(f"\n💡 If you're seeing connection errors, the admin user might need to be created manually in the Supabase dashboard.")
        print(f"\n📋 Manual creation steps:")
        print(f"   1. Go to Supabase Dashboard → Table Editor → users")
        print(f"   2. Click 'Insert' → 'Insert row'")
        print(f"   3. Fill in:")
        print(f"      - email: {admin_email}")
        print(f"      - password_hash: (use bcrypt hash of '{admin_password}')")
        print(f"      - full_name: Administrator")
        print(f"      - subscription_plan: business-pro-elite")
        print(f"      - is_admin: true")
        print(f"      - email_confirmed: true")

if __name__ == "__main__":
    asyncio.run(main())