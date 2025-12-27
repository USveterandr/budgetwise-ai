CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE,
  email_verified INTEGER DEFAULT 0,
  avatar_url TEXT,
  created_at INTEGER
);

CREATE TABLE IF NOT EXISTS bank_uploads (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  file_url TEXT,
  status TEXT,
  insights TEXT,
  created_at INTEGER
);
