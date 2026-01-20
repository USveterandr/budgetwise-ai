-- Users table to track subscription state
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT,
  name TEXT,
  subscription_tier TEXT DEFAULT 'none', -- 'none', 'starter', 'pro', 'elite'
  subscription_status TEXT DEFAULT 'inactive', -- 'inactive', 'active', 'trial', 'expired'
  billing_cycle TEXT DEFAULT 'monthly', -- 'monthly', 'yearly'
  trial_ends_at INTEGER, -- Unix timestamp
  created_at INTEGER,
  updated_at INTEGER
);