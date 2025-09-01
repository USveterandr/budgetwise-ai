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
    
    # Test connection by querying users table
    response = supabase.table('users').select('email, subscription_plan, is_admin').eq('email', 'isaactrinidadllc@gmail.com').execute()
    
    if response.data:
        user = response.data[0]
        print(f"✅ Successfully connected to Supabase!")
        print(f"Administrator user found:")
        print(f"  Email: {user['email']}")
        print(f"  Subscription Plan: {user['subscription_plan']}")
        print(f"  Is Admin: {user['is_admin']}")
    else:
        print("❌ No user found with email: isaactrinidadllc@gmail.com")
        
except Exception as e:
    print(f"❌ Error connecting to Supabase: {e}")
    print("Please check your Supabase URL and API key")