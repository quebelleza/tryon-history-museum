-- Migration 008: Donor levels, renewal tracking, and days-until-renewal trigger
-- Run this in the Supabase SQL Editor

-- Add donor level enum
DO $$ BEGIN
  CREATE TYPE donor_level AS ENUM (
    'none',
    'gillette',
    'simone',
    'pacolet',
    'fitzgerald'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Add new fields to members table
ALTER TABLE members
ADD COLUMN IF NOT EXISTS donor_level donor_level DEFAULT 'none',
ADD COLUMN IF NOT EXISTS membership_start_date date,
ADD COLUMN IF NOT EXISTS renewal_due_date date,
ADD COLUMN IF NOT EXISTS days_until_renewal integer;

-- Add payment_type to membership_payments if not already present
ALTER TABLE membership_payments
ADD COLUMN IF NOT EXISTS payment_type text;

-- Create function to calculate days_until_renewal on insert/update
CREATE OR REPLACE FUNCTION calculate_days_until_renewal()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.renewal_due_date IS NOT NULL THEN
    NEW.days_until_renewal := (NEW.renewal_due_date - CURRENT_DATE)::integer;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_days_until_renewal ON members;
CREATE TRIGGER update_days_until_renewal
BEFORE INSERT OR UPDATE ON members
FOR EACH ROW EXECUTE FUNCTION calculate_days_until_renewal();

-- Create function to refresh days_until_renewal for all members (pg_cron daily job)
CREATE OR REPLACE FUNCTION refresh_renewal_days()
RETURNS void AS $$
BEGIN
  UPDATE members
  SET days_until_renewal = (renewal_due_date - CURRENT_DATE)::integer
  WHERE renewal_due_date IS NOT NULL;
END;
$$ LANGUAGE plpgsql;

-- Sync last_payment_date and last_payment_amount to members on payment insert
CREATE OR REPLACE FUNCTION sync_last_payment_to_member()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE members
  SET 
    last_payment_date = NEW.payment_date,
    last_payment_amount = NEW.amount
  WHERE id = NEW.member_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS sync_payment_on_insert ON membership_payments;
CREATE TRIGGER sync_payment_on_insert
AFTER INSERT ON membership_payments
FOR EACH ROW EXECUTE FUNCTION sync_last_payment_to_member();

-- To schedule with pg_cron (run once manually in SQL Editor):
-- SELECT cron.schedule('refresh-renewal-days', '0 6 * * *', 'SELECT refresh_renewal_days()');
