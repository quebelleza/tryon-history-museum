-- Migration 002: Add steward donor class, member_label column, board_member role support
-- Run this in the Supabase SQL Editor

-- 1. Add 'steward' to donor_class enum
ALTER TYPE donor_class ADD VALUE IF NOT EXISTS 'steward';

-- 2. Add member_label column to members table
ALTER TABLE members
ADD COLUMN IF NOT EXISTS member_label text DEFAULT 'member';

-- 3. Update the effective_access_tier trigger to include steward
-- Steward, Patron, and Donor all get family-level access
CREATE OR REPLACE FUNCTION set_effective_access_tier()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.donor_class IN ('donor', 'patron', 'steward') THEN
    NEW.effective_access_tier := 'family';
  ELSE
    NEW.effective_access_tier := NEW.membership_tier;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 4. Update the daily status check function to include steward in logic
CREATE OR REPLACE FUNCTION update_membership_statuses()
RETURNS void AS $$
BEGIN
  -- Mark members expiring within 30 days as 'expiring_soon'
  UPDATE members
  SET status = 'expiring_soon'
  WHERE status = 'active'
    AND expiration_date IS NOT NULL
    AND expiration_date <= CURRENT_DATE + INTERVAL '30 days'
    AND expiration_date > CURRENT_DATE;

  -- Mark members past expiration as 'expired'
  UPDATE members
  SET status = 'expired'
  WHERE status IN ('active', 'expiring_soon')
    AND expiration_date IS NOT NULL
    AND expiration_date < CURRENT_DATE;
END;
$$ LANGUAGE plpgsql;

-- 5. Backfill member_label from donor_class for existing records
UPDATE members SET member_label = 'steward' WHERE donor_class = 'steward';
UPDATE members SET member_label = 'patron' WHERE donor_class = 'patron';
UPDATE members SET member_label = 'donor' WHERE donor_class = 'donor';
-- Leave existing 'member' labels as default
