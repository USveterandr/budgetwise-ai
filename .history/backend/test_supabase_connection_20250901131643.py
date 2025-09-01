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
    
    # Try to query the users table first
    try:
        response = supabase.table('users').select('email, subscription_plan, is_admin').eq('email', 'isaactrinidadllc@gmail.com').execute()
        
        if response.data:
            user = response.data[0]
            print(f"👤 Administrator user found:")
            print(f"  Email: {user['email']}")
            print(f"  Subscription Plan: {user['subscription_plan']}")
            print(f"  Is Admin: {user['is_admin']}")
        else:
            print("ℹ️  No user found with email: isaactrinidadllc@gmail.com")
            print("   Attempting to create the administrator user...")
            
            # Try to create the admin user
            admin_user = {
                'email': 'isaactrinidadllc@gmail.com',
                'password_hash': 'hashed_password_placeholder',
                'full_name': 'Administrator',
                'subscription_plan': 'business-pro-elite',
                'is_admin': True,
                'email_confirmed': True
            }
            
            create_response = supabase.table('users').insert(admin_user).execute()
            
            if create_response.data:
                print("✅ Administrator user created successfully!")
                print(f"  Email: {admin_user['email']}")
                print(f"  Subscription Plan: {admin_user['subscription_plan']}")
                print(f"  Is Admin: {admin_user['is_admin']}")
            else:
                print("❌ Failed to create administrator user")
            
    except Exception as table_error:
        print(f"⚠️  Database operation failed: {table_error}")
        print("   This might be because the users table doesn't exist yet.")
        print("   You may need to set up the database schema manually in Supabase.")
        
except Exception as e:
    print(f"❌ Error connecting to Supabase: {e}")
    print("Please check your Supabase URL and API key")