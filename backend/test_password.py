#!/usr/bin/env python3
import asyncio
import bcrypt
import os
from dotenv import load_dotenv
from supabase_db import get_user_by_email

# Load environment variables
load_dotenv()

async def test_password():
    # Get the admin user
    user = await get_user_by_email("isaactrinidadllc@gmail.com")
    if not user:
        print("❌ Admin user not found")
        return
    
    print(f"✅ Admin user found: {user['email']}")
    print(f"Password hash in DB: {user['password']}")
    
    # Test password verification
    test_password = "SecureAdminPass123!"
    stored_hash = user['password']
    
    if stored_hash:
        # Check if password matches
        is_valid = bcrypt.checkpw(test_password.encode('utf-8'), stored_hash.encode('utf-8'))
        print(f"Password verification result: {is_valid}")
        
        if is_valid:
            print("✅ Password matches!")
        else:
            print("❌ Password does not match")
            # Generate correct hash for comparison
            correct_hash = bcrypt.hashpw(test_password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
            print(f"Expected hash format: {correct_hash}")
    else:
        print("❌ No password hash found in database")

if __name__ == "__main__":
    asyncio.run(test_password())