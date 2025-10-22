-- Migration script to add email verification fields to users table
-- This script should be run on existing databases to add the new columns

-- Add email verification columns
ALTER TABLE users ADD COLUMN email_verification_token TEXT;
ALTER TABLE users ADD COLUMN email_verification_expires TIMESTAMP;

-- For existing users, we'll set them as already verified since they were created before this feature
-- In a real production environment, you might want to send verification emails to existing users
UPDATE users SET email_verified = 1 WHERE email_verified IS NULL OR email_verified = 0;