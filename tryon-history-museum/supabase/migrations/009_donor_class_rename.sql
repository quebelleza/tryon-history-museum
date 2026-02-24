-- Migration 009: Replace generic donor_class enum values with Tryon named giving levels
-- Run this in the Supabase SQL Editor
--
-- Mapping:
--   none    → none
--   donor   → gillette  ($100–$249)
--   patron  → simone    ($250–$499)
--   steward → pacolet   ($500–$999)
--   (new)   → fitzgerald ($1,000+)

-- Step 1: Rename old enum
ALTER TYPE donor_class RENAME TO donor_class_old;

-- Step 2: Create new enum with Tryon names
CREATE TYPE donor_class AS ENUM (
  'none',
  'gillette',
  'simone',
  'pacolet',
  'fitzgerald'
);

-- Step 3: Migrate the column, mapping old values to new
ALTER TABLE members
  ALTER COLUMN donor_class TYPE donor_class
  USING CASE donor_class::text
    WHEN 'none'    THEN 'none'
    WHEN 'donor'   THEN 'gillette'
    WHEN 'patron'  THEN 'simone'
    WHEN 'steward' THEN 'pacolet'
    ELSE 'none'
  END::donor_class;

-- Step 4: Drop old enum
DROP TYPE donor_class_old;
