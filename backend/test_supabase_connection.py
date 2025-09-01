#!/usr/bin/env python3
import os
import asyncio
import asyncpg
from dotenv import load_dotenv
from datetime import datetime, timezone

# Load environment variables
load_dotenv()

async def main():
    # Get Supabase database URL from environment
    db_url = os.getenv('SUPABASE_DB_URL')
    
    if not db_url:
        print("❌ Missing SUPABASE_DB_URL in .env file")
        return
    
    print(f"🔗 Connecting to Supabase database...")
    
    try:
        # Create direct PostgreSQL connection
        conn = await asyncpg.connect(dsn=db_url)
        
        print("✅ Successfully connected to Supabase database!")
        
        # Check if users table exists and get admin user
        try:
            result = await conn.fetch("SELECT * FROM public.users WHERE email = $1", 'isaactrinidadllc@gmail.com')
            
            if result:
                user = dict(result[0])
                print(f"✅ Admin user found: {user['email']} - Plan: {user['subscription_plan']}")
            else:
                print("⚠️  Admin user not found. Creating administrator user...")
                
                # Create the admin user
                admin_user_id = await conn.fetchval(
                    """
                    INSERT INTO public.users (email, password_hash, subscription_plan, full_name, is_admin, email_confirmed, points, streak_days)
                    VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
                    RETURNING id
                    """,
                    'isaactrinidadllc@gmail.com',
                    'hashed_password_placeholder',  # You should hash this properly
                    'business-pro-elite',
                    'Administrator',
                    True,
                    True,
                    0,
                    0
                )
                
                if admin_user_id:
                    print(f"✅ Administrator user created successfully with ID: {admin_user_id}")
                else:
                    print("❌ Failed to create administrator user")
                    
        except Exception as db_error:
            print(f"❌ Database operation failed: {db_error}")
            
        finally:
            await conn.close()
            
    except Exception as e:
        print(f"❌ Failed to connect to database: {e}")
        print("   Please check your SUPABASE_DB_URL in the .env file")

if __name__ == "__main__":
    asyncio.run(main())