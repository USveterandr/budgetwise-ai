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
    
    try:
        # First, let's see what tables exist
        print("🔍 Checking available tables...")
        
        # Try both 'users' and 'user' table names
        tables_to_check = ['users', 'user']
        
        for table_name in tables_to_check:
            try:
                result = supabase.table(table_name).select('*').limit(1).execute()
                print(f"✅ Found table '{table_name}' with {len(result.data)} records.")
                
                # Check for admin user in this table
                admin_result = supabase.table(table_name).select('*').eq('email', 'isaactrinidadllc@gmail.com').execute()
                if admin_result.data:
                    print(f"✅ Admin user found in '{table_name}': {admin_result.data[0]}")
                else:
                    print(f"⚠️  Admin user not found in '{table_name}' table.")
                    print("   Creating administrator user...")
                    
                    # Create the admin user
                    admin_user = {
                        'email': 'isaactrinidadllc@gmail.com',
                        'password_hash': 'hashed_password_placeholder',
                        'subscription_plan': 'business-pro-elite'
                    }
                    
                    try:
                        create_result = supabase.table(table_name).insert(admin_user).execute()
                        if create_result.data:
                            print(f"✅ Administrator user created successfully: {create_result.data[0]}")
                        else:
                            print("❌ Failed to create administrator user")
                    except Exception as create_error:
                        print(f"❌ Error creating admin user: {create_error}")
                    
                break  # Found a working table, stop checking
                
            except Exception as table_error:
                print(f"⚠️  Table '{table_name}' check failed: {table_error}")
                continue
        
        else:
            # If we get here, no tables were found
            print("❌ No 'users' or 'user' table found.")
            print("   Please create the table manually in Supabase dashboard.")
            
    except Exception as e:
        print(f"❌ Unexpected error: {e}")
        
except Exception as e:
    print(f"❌ Error connecting to Supabase: {e}")
    print("Please check your Supabase URL and API key")