-- Migration script to add password reset columns to existing users table
ALTER TABLE users ADD COLUMN password_reset_token TEXT;
ALTER TABLE users ADD COLUMN password_reset_expires TIMESTAMP;