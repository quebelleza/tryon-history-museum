-- Migration 010: Update trigger functions to use new donor_class enum values
-- Run this in the Supabase SQL Editor AFTER migration 009
--
-- The trigger functions from migrations 001 and 002 still reference
-- the old donor_class values ('donor', 'patron', 'steward') which no
-- longer exist in the enum after migration 009 renamed them.
-- PostgreSQL casts string literals to the enum type for IN comparisons,
-- so comparing against removed values throws:
--   "invalid input value for enum donor_class: "donor""

-- Fix the trigger from migration 002 (which replaced the one from 001)
CREATE OR REPLACE FUNCTION set_effective_access_tier()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.donor_class IN ('gillette', 'simone', 'pacolet', 'fitzgerald') THEN
    NEW.effective_access_tier := 'family';
  ELSE
    NEW.effective_access_tier := NEW.membership_tier;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Also fix the original trigger from migration 001 in case it still exists
CREATE OR REPLACE FUNCTION fn_sync_effective_tier()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.donor_class IN ('gillette', 'simone', 'pacolet', 'fitzgerald') THEN
    NEW.effective_access_tier := 'family';
  ELSE
    NEW.effective_access_tier := NEW.membership_tier::text::effective_tier;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
