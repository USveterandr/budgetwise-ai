#!/usr/bin/env python3
"""
Script to add missing columns to the Supabase users table.
This will add: points, streak_days, last_login, email_confirmation_token, 
email_confirmation_sent_at, is_hold, is_paused, paused_at, hold_reason
"""

import os
import asyncpg
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

async def add_missing_columns():
    """Add missing columns to the users table"""
    
    # Get database URL from environment
    db_url = os.getenv('SUPABASE_DB_URL')
    if not db_url:
        print("Error: SUPABASE_DB_URL not found in environment variables")
        return False
    
    try:
        # Connect to database
        conn = await asyncpg.connect(db_url)
        print("Connected to Supabase database")
        
        # SQL to add missing columns
        add_columns_sql = """
        ALTER TABLE users 
        ADD COLUMN IF NOT EXISTS points INTEGER DEFAULT 0,
        ADD COLUMN IF NOT EXISTS streak_days INTEGER DEFAULT 0,
        ADD COLUMN IF NOT EXISTS last_login TIMESTAMP WITH TIME ZONE,
        ADD COLUMN IF NOT EXISTS email_confirmation_token TEXT,
        ADD COLUMN IF NOT EXISTS email_confirmation_sent_at TIMESTAMP WITH TIME ZONE,
        ADD COLUMN IF NOT EXISTS is_hold BOOLEAN DEFAULT FALSE,
        ADD COLUMN IF NOT EXISTS is_paused BOOLEAN DEFAULT FALSE,
        ADD COLUMN IF NOT EXISTS paused_at TIMESTAMP WITH TIME ZONE,
        ADD COLUMN IF NOT EXISTS hold_reason TEXT;
        """
        
        # Execute the ALTER TABLE statement
        await conn.execute(add_columns_sql)
        print("✅ Successfully added missing columns to users table")
        
        # Update existing users with default values
        update_defaults_sql = """
        UPDATE users 
        SET 
            points = COALESCE(points, 0),
            streak_days = COALESCE(streak_days, 0),
            is_hold = COALESCE(is_hold, FALSE),
            is_paused = COALESCE(is_paused, FALSE)
        WHERE points IS NULL OR streak_days IS NULL OR is_hold IS NULL OR is_paused IS NULL;
        """
        
        result = await conn.execute(update_defaults_sql)
        print(f"✅ Updated existing users with default values: {result}")
        
        # Verify the changes by checking table schema
        schema_sql = """
        SELECT column_name, data_type, is_nullable, column_default
        FROM information_schema.columns 
        WHERE table_name = 'users' 
        ORDER BY ordinal_position;
        """
        
        columns = await conn.fetch(schema_sql)
        print("\n📋 Current users table schema:")
        for col in columns:
            print(f"  - {col['column_name']}: {col['data_type']} (nullable: {col['is_nullable']}, default: {col['column_default']})")
        
        await conn.close()
        return True
        
    except Exception as e:
        print(f"❌ Error adding columns: {e}")
        return False

if __name__ == "__main__":
    import asyncio
    
    print("🔧 Adding missing columns to users table...")
    success = asyncio.run(add_missing_columns())
    
    if success:
        print("\n🎉 Migration completed successfully!")
        print("\nThe following columns have been added:")
        print("  - points (INTEGER, default: 0)")
        print("  - streak_days (INTEGER, default: 0)")
        print("  - last_login (TIMESTAMP WITH TIME ZONE)")
        print("  - email_confirmation_token (TEXT)")
        print("  - email_confirmation_sent_at (TIMESTAMP WITH TIME ZONE)")
        print("  - is_hold (BOOLEAN, default: FALSE)")
        print("  - is_paused (BOOLEAN, default: FALSE)")
        print("  - paused_at (TIMESTAMP WITH TIME ZONE)")
        print("  - hold_reason (TEXT)")
    else:
        print("\n❌ Migration failed. Please check the error messages above.")