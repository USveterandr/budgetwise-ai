-- Migration script for Transaction Management feature
-- This script updates the existing transactions table to match the new schema

-- Add new columns to transactions table
ALTER TABLE transactions ADD COLUMN merchant TEXT;
ALTER TABLE transactions ADD COLUMN tags TEXT;
ALTER TABLE transactions ADD COLUMN notes TEXT;
ALTER TABLE transactions ADD COLUMN currency TEXT DEFAULT 'USD';

-- Update the type column to include 'transfer' option
-- Note: SQLite doesn't support altering CHECK constraints directly
-- We'll need to recreate the table if we're using SQLite
-- For Cloudflare D1, we can modify the constraint

-- Update the date column type from TIMESTAMP to DATE
-- This might require recreating the table in some databases

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_transactions_category ON transactions(category);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(type);
CREATE INDEX IF NOT EXISTS idx_transactions_merchant ON transactions(merchant);

-- Update existing transactions to have default values
UPDATE transactions SET currency = 'USD' WHERE currency IS NULL;
UPDATE transactions SET description = '' WHERE description IS NULL;

-- Ensure description is not null
-- This might require recreating the table with the correct schema

-- Sample data for testing
-- INSERT INTO transactions (id, user_id, date, description, category, amount, type, currency) 
-- VALUES ('txn_1', 'user_123', '2023-01-01', 'Grocery shopping', 'Food', 50.00, 'expense', 'USD');