-- Profiles table
DROP TABLE IF EXISTS profiles;
CREATE TABLE profiles (
  user_id TEXT PRIMARY KEY,
  email TEXT UNIQUE,
  name TEXT,
  plan TEXT DEFAULT 'Starter',
  monthly_income REAL DEFAULT 0,
  currency TEXT DEFAULT 'USD',
  business_industry TEXT,
  bio TEXT,
  savings_rate REAL DEFAULT 0,
  onboarding_complete INTEGER DEFAULT 0,
  email_verified INTEGER DEFAULT 0,
  avatar_url TEXT,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);

-- Bank uploads table
DROP TABLE IF EXISTS bank_uploads;
CREATE TABLE bank_uploads (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  file_url TEXT,
  status TEXT DEFAULT 'pending',
  insights TEXT,
  created_at INTEGER NOT NULL,
  FOREIGN KEY (user_id) REFERENCES profiles(user_id) ON DELETE CASCADE
);

-- Transactions table
DROP TABLE IF EXISTS transactions;
CREATE TABLE transactions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  type TEXT NOT NULL, -- 'income' or 'expense'
  amount REAL NOT NULL,
  category TEXT NOT NULL,
  description TEXT,
  date INTEGER NOT NULL,
  created_at INTEGER NOT NULL,
  FOREIGN KEY (user_id) REFERENCES profiles(user_id) ON DELETE CASCADE
);

CREATE INDEX idx_transactions_user_date ON transactions(user_id, date DESC);

-- Budgets table
DROP TABLE IF EXISTS budgets;
CREATE TABLE budgets (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  category TEXT NOT NULL,
  limit_amount REAL NOT NULL,
  spent REAL DEFAULT 0,
  month TEXT NOT NULL, -- Format: YYYY-MM
  created_at INTEGER NOT NULL,
  FOREIGN KEY (user_id) REFERENCES profiles(user_id) ON DELETE CASCADE
);

CREATE INDEX idx_budgets_user_month ON budgets(user_id, month);

-- Investments table
DROP TABLE IF EXISTS investments;
CREATE TABLE investments (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL, -- 'stock', 'bond', 'etf', 'crypto', 'other'
  amount REAL NOT NULL,
  current_value REAL NOT NULL,
  purchase_date INTEGER NOT NULL,
  created_at INTEGER NOT NULL,
  FOREIGN KEY (user_id) REFERENCES profiles(user_id) ON DELETE CASCADE
);

CREATE INDEX idx_investments_user ON investments(user_id);

-- Notifications table
DROP TABLE IF EXISTS notifications;
CREATE TABLE notifications (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT DEFAULT 'info', -- 'info', 'warning', 'success', 'error'
  is_read INTEGER DEFAULT 0,
  created_at INTEGER NOT NULL,
  FOREIGN KEY (user_id) REFERENCES profiles(user_id) ON DELETE CASCADE
);

CREATE INDEX idx_notifications_user_read ON notifications(user_id, is_read, created_at DESC);
