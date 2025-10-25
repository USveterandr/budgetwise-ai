CREATE TABLE users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  password_hash TEXT NOT NULL,
  plan TEXT DEFAULT 'trial',
  is_admin BOOLEAN DEFAULT FALSE,
  email_verified BOOLEAN DEFAULT FALSE,
  trial_ends_at TIMESTAMP,
  password_reset_token TEXT,
  password_reset_expires TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE transactions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  date DATE NOT NULL,
  description TEXT NOT NULL,
  category TEXT,
  amount REAL NOT NULL,
  type TEXT CHECK(type IN ('income','expense','transfer')) NOT NULL,
  receipt_url TEXT,
  merchant TEXT,
  tags TEXT,
  notes TEXT,
  currency TEXT DEFAULT 'USD',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE budgets (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  category TEXT,
  limit_amount REAL,
  spent_amount REAL DEFAULT 0,
  start_date TIMESTAMP,
  end_date TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE investments (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  asset_name TEXT,
  symbol TEXT,
  shares REAL,
  purchase_price REAL,
  current_price REAL,
  value REAL,
  profit_loss REAL,
  purchase_date TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE subscriptions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  name TEXT,
  amount REAL,
  frequency TEXT CHECK(frequency IN ('weekly','monthly','yearly')),
  next_payment_date TIMESTAMP,
  auto_renew BOOLEAN DEFAULT TRUE,
  category TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE consultations (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  advisor_name TEXT,
  scheduled_at TIMESTAMP,
  duration_minutes INTEGER DEFAULT 30,
  status TEXT CHECK(status IN ('pending','completed','cancelled')),
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE receipts (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  transaction_id TEXT,
  file_key TEXT,
  file_url TEXT,
  uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (transaction_id) REFERENCES transactions(id)
);

CREATE TABLE categories (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  name TEXT NOT NULL,
  type TEXT CHECK(type IN ('income','expense')),
  color TEXT,
  icon TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  UNIQUE(user_id, name)
);

-- Indexes for better query performance
CREATE INDEX idx_transactions_user_id ON transactions(user_id);
CREATE INDEX idx_transactions_date ON transactions(date);
CREATE INDEX idx_budgets_user_id ON budgets(user_id);
CREATE INDEX idx_investments_user_id ON investments(user_id);
CREATE INDEX idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX idx_consultations_user_id ON consultations(user_id);
CREATE INDEX idx_receipts_user_id ON receipts(user_id);
CREATE INDEX idx_categories_user_id ON categories(user_id);