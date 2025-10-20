CREATE TABLE users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  plan TEXT DEFAULT 'free',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE transactions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  date TIMESTAMP NOT NULL,
  description TEXT,
  category TEXT,
  amount REAL,
  type TEXT CHECK(type IN ('income','expense')),
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
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE investments (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  asset_name TEXT,
  symbol TEXT,
  value REAL,
  profit_loss REAL,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE subscriptions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  name TEXT,
  amount REAL,
  next_payment_date TIMESTAMP,
  auto_renew BOOLEAN DEFAULT TRUE,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE consultations (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  advisor_name TEXT,
  scheduled_at TIMESTAMP,
  duration_minutes INTEGER DEFAULT 30,
  status TEXT CHECK(status IN ('pending','completed','cancelled')),
  FOREIGN KEY (user_id) REFERENCES users(id)
);