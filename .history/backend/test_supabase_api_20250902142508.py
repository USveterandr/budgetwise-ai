import requests
import os

# Supabase configuration
SUPABASE_URL = "https://poceibkkajglqfheygbt.supabase.co"
SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBvY2VpYmtrYWpnbHFmaGV5Z2J0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ1MzQ5MzMsImV4cCI6MjA3MDExMDkzM30.eWp6tzrjYrh37YjBc8JsStbBSH3B-NDqYtVhz4Zo6x8"
SUPABASE_SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBvY2VpYmtrYWpnbHFmaGV5Z2J0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDUzNDkzMywiZXhwIjoyMDcwMTEwOTMzfQ.Aqd_aIMmpfvDZU2sFiffGToIZqBsNVKVC2U-7cMrt6o"

def test_supabase_api():
    try:
        # Test basic connection
        headers = {
            'apikey': SUPABASE_ANON_KEY,
            'Authorization': f'Bearer {SUPABASE_ANON_KEY}',
            'Content-Type': 'application/json'
        }
        
        # Try to access the users table
        url = f"{SUPABASE_URL}/rest/v1/users?email=eq.isaactrinidadllc@gmail.com"
        response = requests.get(url, headers=headers)
        
        print(f"API Response Status: {response.status_code}")
        print(f"API Response: {response.text}")
        
        if response.status_code == 200:
            users = response.json()
            print(f"Found {len(users)} users")
            if users:
                user = users[0]
                print(f"User found: {user.get('email')} - Admin: {user.get('is_admin')}")
            else:
                print("No user found with that email")
        else:
            print(f"API Error: {response.status_code} - {response.text}")
            
    except Exception as e:
        print(f"Connection failed: {e}")
        print(f"Error type: {type(e).__name__}")

if __name__ == '__main__':
    test_supabase_api()