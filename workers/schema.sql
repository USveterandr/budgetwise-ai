-- Create users table
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  full_name TEXT,
  subscription_plan TEXT DEFAULT 'free',
  created_at TEXT NOT NULL,
  points INTEGER DEFAULT 0,
  streak_days INTEGER DEFAULT 0,
  last_login TEXT,
  email_confirmation_token TEXT,
  email_confirmation_sent_at TEXT,
  is_hold BOOLEAN DEFAULT FALSE,
  is_paused BOOLEAN DEFAULT FALSE,
  paused_at TEXT,
  hold_reason TEXT
);

-- Create budgets table
CREATE TABLE budgets (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  name TEXT NOT NULL,
  amount REAL NOT NULL,
  created_at TEXT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Create expenses table
CREATE TABLE expenses (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  budget_id TEXT,
  amount REAL NOT NULL,
  description TEXT,
  category TEXT,
  date TEXT NOT NULL,
  created_at TEXT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (budget_id) REFERENCES budgets(id)
);