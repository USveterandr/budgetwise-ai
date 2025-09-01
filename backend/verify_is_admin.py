#!/usr/bin/env python3
"""
Verify is_admin field is working in Supabase
"""

import asyncio
import os
from dotenv import load_dotenv
from supabase_db import get_user_by_email

async def main():
    # Load environment variables
    load_dotenv()
    
    admin_email = "isaactrinidadllc@gmail.com"
    
    print(f"🔍 Checking admin user: {admin_email}")
    
    try:
        # Get the user using our Supabase client
        user = await get_user_by_email(admin_email)
        
        if not user:
            print(f"❌ User {admin_email} not found!")
            return
        
        print(f"✅ User found!")
        print(f"   Email: {user['email']}")
        print(f"   Full Name: {user.get('full_name', 'N/A')}")
        print(f"   Subscription Plan: {user.get('subscription_plan', 'N/A')}")
        print(f"   Is Admin: {user.get('is_admin', 'Field not found')}")
        print(f"   Email Confirmed: {user.get('email_confirmed', 'N/A')}")
        
        # Check if is_admin field exists and is True
        if 'is_admin' in user:
            if user['is_admin']:
                print("🎉 SUCCESS: is_admin field is set to True!")
            else:
                print("⚠️  WARNING: is_admin field exists but is set to False")
        else:
            print("❌ ERROR: is_admin field not found in user record")
            
    except Exception as e:
        print(f"❌ Error checking user: {e}")

if __name__ == "__main__":
    asyncio.run(main())