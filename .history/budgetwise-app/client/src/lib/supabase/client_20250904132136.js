import { createClient } from '@supabase/supabase-js'

// Add debug logs to verify env vars
console.log('SUPABASE_URL:', process.env.REACT_APP_SUPABASE_URL);
console.log('SUPABASE_ANON_KEY:', process.env.REACT_APP_SUPABASE_ANON_KEY);

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

// Check if Supabase credentials are provided and not placeholders
if (!supabaseUrl || !supabaseAnonKey || supabaseUrl.includes('YOUR_PROJECT_REF') || supabaseAnonKey.includes('YOUR_ANON_KEY')) {
  console.warn('Supabase credentials are missing or placeholder. The app will run in demo mode. Please update your .env file with actual Supabase credentials from: https://supabase.com/dashboard/project/_/settings/api');
  
  // Create a mock Supabase client that won't crash the app
  const mockSupabase = {
    auth: {
      signIn: () => Promise.resolve({ data: { user: null }, error: new Error('Supabase not configured') }),
      signUp: () => Promise.resolve({ data: { user: null }, error: new Error('Supabase not configured') }),
      signOut: () => Promise.resolve({ error: null }),
      getSession: () => Promise.resolve({ data: { session: null }, error: null })
    },
    from: () => ({
      select: () => ({
        data: [],
        error: new Error('Supabase not configured')
      }),
      insert: () => ({
        error: new Error('Supabase not configured')
      }),
      update: () => ({
        error: new Error('Supabase not configured')
      }),
      delete: () => ({
        error: new Error('Supabase not configured')
      })
    })
  };
  
  export const supabase = mockSupabase;
} else {
  export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: false,
    }
  });
}
