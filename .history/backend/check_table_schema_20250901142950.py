#!/usr/bin/env python3
"""
Check the users table schema and constraints in Supabase
"""

import asyncio
import os
import asyncpg
from dotenv import load_dotenv

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
        
        # Get table schema
        print("\n📋 Users table schema:")
        schema_query = """
        SELECT 
            column_name,
            data_type,
            is_nullable,
            column_default,
            character_maximum_length
        FROM information_schema.columns 
        WHERE table_name = 'users' AND table_schema = 'public'
        ORDER BY ordinal_position;
        """
        
        columns = await conn.fetch(schema_query)
        for col in columns:
            print(f"  - {col['column_name']}: {col['data_type']} (nullable: {col['is_nullable']}, default: {col['column_default']})")
        
        # Get constraints
        print("\n🔒 Table constraints:")
        constraints_query = """
        SELECT 
            tc.constraint_name,
            tc.constraint_type,
            cc.check_clause
        FROM information_schema.table_constraints tc
        LEFT JOIN information_schema.check_constraints cc ON tc.constraint_name = cc.constraint_name
        WHERE tc.table_name = 'users' AND tc.table_schema = 'public';
        """
        
        constraints = await conn.fetch(constraints_query)
        for constraint in constraints:
            print(f"  - {constraint['constraint_name']}: {constraint['constraint_type']}")
            if constraint['check_clause']:
                print(f"    Check: {constraint['check_clause']}")
        
        # Check if password column exists
        password_col = await conn.fetchrow(
            "SELECT column_name FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'password'"
        )
        
        if password_col:
            print("\n✅ Password column exists")
        else:
            print("\n❌ Password column does not exist")
            
        await conn.close()
        
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    asyncio.run(main())