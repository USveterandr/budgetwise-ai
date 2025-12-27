DROP TABLE IF EXISTS users;
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE,
  name TEXT,
  plan TEXT DEFAULT 'Starter',
  monthly_income REAL,
  currency TEXT DEFAULT 'USD',
  business_industry TEXT,
  bio TEXT,
  savings_rate REAL,
  email_verified INTEGER DEFAULT 0,
  avatar_url TEXT,
  created_at INTEGER,
  updated_at INTEGER
);

CREATE TABLE IF NOT EXISTS bank_uploads (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  file_url TEXT,
  status TEXT,
  insights TEXT,
  created_at INTEGER
);
