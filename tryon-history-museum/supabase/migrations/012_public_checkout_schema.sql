-- Migration 012: Schema additions for public checkout flow
-- Run this in the Supabase SQL Editor
--
-- Additive and non-destructive only.
-- No existing columns are dropped or renamed.
-- No existing data is modified except the safe renewal_due_date backfill in Change 3.


-- ─── Change 1: Household / display name ──────────────────────────────────────
-- Holds couple or household names like "Skip and Denny Crowe".
-- Application logic: use household_name when present, fall back to
--   first_name || ' ' || last_name when null.
-- Intentionally left null for all existing records — no backfill needed.

ALTER TABLE members
ADD COLUMN IF NOT EXISTS household_name text;


-- ─── Change 2: Member source / creation channel ───────────────────────────────
-- Tracks how a member record originated.

DO $$ BEGIN
  CREATE TYPE member_source AS ENUM (
    'admin',
    'public_join',
    'public_renewal',
    'donation',
    'import',
    'other'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

ALTER TABLE members
ADD COLUMN IF NOT EXISTS source member_source NOT NULL DEFAULT 'other';


-- ─── Change 3: Resolve dual expiration columns (safe, no drops) ───────────────
-- renewal_due_date is now the authoritative column.
-- expiration_date is retained for backward compatibility but deprecated.

COMMENT ON COLUMN members.expiration_date IS
  'DEPRECATED — use renewal_due_date. Retained for backward compatibility.';

COMMENT ON COLUMN members.renewal_due_date IS
  'Authoritative membership expiration date. Written by checkout webhook and admin routes.';

-- Backfill renewal_due_date from expiration_date for any rows where
-- renewal_due_date is NULL but expiration_date is set.
UPDATE members
SET renewal_due_date = expiration_date
WHERE renewal_due_date IS NULL
  AND expiration_date IS NOT NULL;


-- ─── Change 4: Stripe customer reference ──────────────────────────────────────
-- Stores a Stripe customer ID for future subscription or saved-payment support.
-- Nullable — populated only when a Stripe customer object is created.

ALTER TABLE members
ADD COLUMN IF NOT EXISTS stripe_customer_id text;


-- ─── END OF MIGRATION 012 ─────────────────────────────────────────────────────
