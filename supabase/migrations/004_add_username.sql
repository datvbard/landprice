-- Migration: Add username column to Better Auth's user table
-- Allows login via username instead of just email/phone
-- Created: 2025-12-31

-- Add username column (nullable for existing users)
ALTER TABLE "user" ADD COLUMN IF NOT EXISTS username VARCHAR(50);

-- Create unique index for username (allows null but unique when set)
CREATE UNIQUE INDEX IF NOT EXISTS idx_user_username ON "user"(username) WHERE username IS NOT NULL;

-- Create index for faster username lookups
CREATE INDEX IF NOT EXISTS idx_user_username_lookup ON "user"(username);
