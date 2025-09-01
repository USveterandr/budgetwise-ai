#!/usr/bin/env python3
"""
Update administrator subscription plan to business-pro-elite
"""

import asyncio
import os
from dotenv import load_dotenv
from supabase_db import get_user_by_email, update_user_fields

async def main():
    # Load environment variables
    load_dotenv()
    
    admin_email = "isaactrinidadllc@gmail.com"
    new_plan = "business-pro-elite"
    
    print(f"Updating {admin_email} subscription plan to {new_plan}...")
    
    # Get the user first
    user = await get_user_by_email(admin_email)
    if not user:
        print(f"User {admin_email} not found!")
        return
    
    print(f"Current plan: {user['subscription_plan']}")
    
    # Update the subscription plan
    await update_user_fields(user['id'], {
        'subscription_plan': new_plan
    })
    
    # Verify the update
    updated_user = await get_user_by_email(admin_email)
    print(f"Updated plan: {updated_user['subscription_plan']}")
    print("Update completed successfully!")

if __name__ == "__main__":
    asyncio.run(main())