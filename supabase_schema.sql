-- Create transactions table
CREATE TABLE transactions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL, -- Firebase Auth UID
  amount NUMERIC NOT NULL,
  description TEXT,
  category TEXT,
  date TIMESTAMP WITH TIME ZONE,
  type TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create budgets table
CREATE TABLE budgets (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL, -- Firebase Auth UID
  category TEXT NOT NULL,
  limit_amount NUMERIC NOT NULL,
  spent NUMERIC DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Set up Row Level Security (RLS)
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE budgets ENABLE ROW LEVEL SECURITY;

-- Note: Since you are using Firebase for Auth, Supabase's built-in auth.uid() won't work automatically.
-- For a secure setup, you either need to pass a custom JWT from Firebase to Supabase, 
-- or temporarily allow all access (NOT recommended for production) and filter by user_id in the frontend.

-- Basic policy allowing users to read/write their own data based on the user_id column
CREATE POLICY "Users can manage their own transactions" 
ON transactions FOR ALL 
USING (true) -- In production, replace 'true' with a custom JWT validation matching the user_id
WITH CHECK (true);

CREATE POLICY "Users can manage their own budgets" 
ON budgets FOR ALL 
USING (true)
WITH CHECK (true);
