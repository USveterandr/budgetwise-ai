#!/usr/bin/env python3
"""
Verify administrator subscription plan
"""

import asyncio
import os
from dotenv import load_dotenv
from supabase_db import get_user_by_email

async def main():
    # Load environment variables
    load_dotenv()
    
    admin_email = "isaactrinidadllc@gmail.com"
    
    print(f"Checking {admin_email}...")
    
    # Get the user
    user = await get_user_by_email(admin_email)
    if not user:
        print(f"User {admin_email} not found!")
        return
    
    print(f"Email: {user['email']}")
    print(f"Full Name: {user['full_name']}")
    print(f"Subscription Plan: {user['subscription_plan']}")
    print(f"Is Admin: {user['is_admin']}")
    print(f"Email Confirmed: {user['email_confirmed']}")
    print(f"Points: {user['points']}")
    print(f"Streak Days: {user['streak_days']}")

if __name__ == "__main__":
    asyncio.run(main())