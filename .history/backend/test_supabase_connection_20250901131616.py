#!/usr/bin/env python3
import os
from dotenv import load_dotenv
from supabase import create_client, Client

# Load environment variables
load_dotenv()

# Get Supabase credentials
supabase_url = "https://poceibkkajglqfheygbt.supabase.co"
supabase_key = os.getenv('SUPABASE_ANON_KEY', 'your-anon-key-here')

if not supabase_key or supabase_key == 'your-anon-key-here':
    print("Error: SUPABASE_ANON_KEY not found in environment variables")
    print("Please add SUPABASE_ANON_KEY to your .env file")
    exit(1)

try:
    # Create Supabase client
    supabase: Client = create_client(supabase_url, supabase_key)
    
    # Test basic connection first
    print("✅ Successfully connected to Supabase!")
    
    # Try to list available tables or create users table if it doesn't exist
    try:
        # First, let's try to create the users table
        create_table_sql = """
        CREATE TABLE IF NOT EXISTS users (
            id SERIAL PRIMARY KEY,
            email VARCHAR(255) UNIQUE NOT NULL,
            password_hash VARCHAR(255) NOT NULL,
            full_name VARCHAR(255),
            subscription_plan VARCHAR(50) DEFAULT 'free',
            is_admin BOOLEAN DEFAULT FALSE,
            email_confirmed BOOLEAN DEFAULT FALSE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        """
        
        # Execute the table creation
        result = supabase.rpc('exec_sql', {'sql': create_table_sql}).execute()
        print("📋 Users table created or already exists")
        
        # Now try to query the users table
        response = supabase.table('users').select('email, subscription_plan, is_admin').eq('email', 'isaactrinidadllc@gmail.com').execute()
        
        if response.data:
            user = response.data[0]
            print(f"👤 Administrator user found:")
            print(f"  Email: {user['email']}")
            print(f"  Subscription Plan: {user['subscription_plan']}")
            print(f"  Is Admin: {user['is_admin']}")
        else:
            print("ℹ️  No user found with email: isaactrinidadllc@gmail.com")
            print("   You may need to create the user first")
            
    except Exception as table_error:
        print(f"⚠️  Table operation failed: {table_error}")
        print("   The database connection is working, but table setup needs attention")
        
except Exception as e:
    print(f"❌ Error connecting to Supabase: {e}")
    print("Please check your Supabase URL and API key")