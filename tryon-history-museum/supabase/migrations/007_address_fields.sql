-- Migration 007: Break address into separate fields
-- Run this in the Supabase SQL Editor

ALTER TABLE members
ADD COLUMN IF NOT EXISTS street_address text,
ADD COLUMN IF NOT EXISTS city text,
ADD COLUMN IF NOT EXISTS state text,
ADD COLUMN IF NOT EXISTS zip_code text;

-- Keep the existing address column for backward compatibility.
-- New records will populate the four separate fields going forward.
