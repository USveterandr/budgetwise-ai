-- Migration script to add password_hash column to existing users table
ALTER TABLE users ADD COLUMN password_hash TEXT NOT NULL DEFAULT '';