-- Migration 011: Make email optional on members table
-- Run this in the Supabase SQL Editor

-- 1. Drop NOT NULL constraint on email
ALTER TABLE members ALTER COLUMN email DROP NOT NULL;

-- 2. Replace unique constraint with a partial unique index (allows multiple NULLs)
ALTER TABLE members DROP CONSTRAINT IF EXISTS members_email_key;
CREATE UNIQUE INDEX members_email_unique
ON members (email)
WHERE email IS NOT NULL;
