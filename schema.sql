-- USERS
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  email_verified INTEGER DEFAULT 0,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- TRANSACTIONS
CREATE TABLE transactions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  merchant TEXT,
  amount REAL NOT NULL,
  category TEXT,
  occurred_at TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- BUDGETS
CREATE TABLE budgets (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  category TEXT NOT NULL,
  monthly_limit REAL NOT NULL,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- SUBSCRIPTIONS
CREATE TABLE subscriptions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  merchant TEXT,
  amount REAL,
  frequency TEXT,
  last_charged TEXT,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- ASSETS / LIABILITIES
CREATE TABLE net_worth_items (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  type TEXT CHECK(type IN ('asset','liability')),
  name TEXT,
  value REAL,
  interest_rate REAL,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- AI INSIGHTS (AUDITABLE)
CREATE TABLE ai_insights (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  type TEXT,
  content TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);
