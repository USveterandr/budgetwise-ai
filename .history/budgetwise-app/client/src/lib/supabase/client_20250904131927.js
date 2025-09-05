import { createClient } from '@supabase/supabase-js'

// Add debug logs to verify env vars
console.log('SUPABASE_URL:', process.env.REACT_APP_SUPABASE_URL);
console.log('SUPABASE_ANON_KEY:', process.env.REACT_APP_SUPABASE_ANON_KEY);

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase credentials! Check your .env file and restart the server.\n' +
    'https://supabase.com/dashboard/project/_/settings/api'
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: false,
  }
});
