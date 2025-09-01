#!/usr/bin/env python3
import asyncio
import bcrypt
import os
from dotenv import load_dotenv
from supabase_db import get_pool

# Load environment variables
load_dotenv()

async def update_admin_password():
    # Generate correct password hash for "SecureAdminPass123!"
    password = "SecureAdminPass123!"
    password_hash = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
    
    print(f"🔐 Updating admin password hash...")
    print(f"New password hash: {password_hash}")
    
    # Update the admin user's password hash
    pool = await get_pool()
    async with pool.acquire() as conn:
        result = await conn.execute(
            "UPDATE users SET password_hash = $1 WHERE email = $2",
            password_hash, "isaactrinidadllc@gmail.com"
        )
        print(f"✅ Updated {result.split()[-1]} row(s)")
    
    # Verify the update
    async with pool.acquire() as conn:
        row = await conn.fetchrow(
            "SELECT email, password_hash FROM users WHERE email = $1",
            "isaactrinidadllc@gmail.com"
        )
        if row:
            print(f"✅ Verification: Admin user {row['email']} password hash updated")
            # Test the password
            is_valid = bcrypt.checkpw(password.encode('utf-8'), row['password_hash'].encode('utf-8'))
            print(f"✅ Password verification: {is_valid}")
        else:
            print("❌ Admin user not found")

if __name__ == "__main__":
    asyncio.run(update_admin_password())