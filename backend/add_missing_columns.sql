-- SQL Migration to add missing columns to users table
-- Run this in your Supabase SQL Editor

-- Add missing columns to users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS points INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS streak_days INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_login TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS email_confirmation_token TEXT,
ADD COLUMN IF NOT EXISTS email_confirmation_sent_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS is_hold BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS is_paused BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS paused_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS hold_reason TEXT;

-- Optional: Update existing users to have default values
UPDATE users 
SET 
    points = COALESCE(points, 0),
    streak_days = COALESCE(streak_days, 0),
    is_hold = COALESCE(is_hold, FALSE),
    is_paused = COALESCE(is_paused, FALSE)
WHERE points IS NULL OR streak_days IS NULL OR is_hold IS NULL OR is_paused IS NULL;

-- Verify the changes
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'users' 
ORDER BY ordinal_position;