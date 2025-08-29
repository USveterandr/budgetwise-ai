# BudgetWise + Supabase Setup

## Quick Supabase Backend Setup (5 minutes)

### 1. Create Supabase Project
1. Go to [supabase.com](https://supabase.com)
2. Create new project
3. Get your project URL and API key

### 2. Database Tables
Run these SQL commands in Supabase SQL Editor:

```sql
-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR UNIQUE NOT NULL,
  full_name VARCHAR NOT NULL,
  subscription_plan VARCHAR DEFAULT 'free',
  points INTEGER DEFAULT 0,
  streak_days INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Expenses table  
CREATE TABLE expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  amount DECIMAL NOT NULL,
  category VARCHAR NOT NULL,
  description TEXT,
  date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Budgets table
CREATE TABLE budgets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  category VARCHAR NOT NULL,
  amount DECIMAL NOT NULL,
  spent DECIMAL DEFAULT 0,
  period VARCHAR DEFAULT 'monthly',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Investments table
CREATE TABLE investments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  name VARCHAR NOT NULL,
  symbol VARCHAR NOT NULL,
  shares DECIMAL NOT NULL,
  purchase_price DECIMAL NOT NULL,
  current_price DECIMAL DEFAULT 0,
  purchase_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 3. Your Backend URL
After creating Supabase project:
```
REACT_APP_BACKEND_URL=https://your-project-id.supabase.co
```

### 4. Install Supabase in Frontend
```bash
cd frontend
npm install @supabase/supabase-js
```

### 5. Update Frontend Code
Replace axios calls with Supabase client calls.
```