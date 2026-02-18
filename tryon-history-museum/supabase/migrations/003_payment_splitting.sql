-- Migration 003: Payment splitting — membership fee vs additional donation
-- Run this in the Supabase SQL Editor

-- 1. Add payment-split fields to members table
ALTER TABLE members
ADD COLUMN IF NOT EXISTS last_payment_date date,
ADD COLUMN IF NOT EXISTS last_payment_amount numeric,
ADD COLUMN IF NOT EXISTS membership_fee numeric,
ADD COLUMN IF NOT EXISTS additional_donation numeric;

-- 2. Add payment-split fields to membership_payments table
ALTER TABLE membership_payments
ADD COLUMN IF NOT EXISTS membership_fee numeric,
ADD COLUMN IF NOT EXISTS additional_donation numeric,
ADD COLUMN IF NOT EXISTS payment_year integer;

-- 3. Backfill existing members: default membership_fee = last_payment_amount, donation = 0
UPDATE members m
SET
  last_payment_date = p.payment_date,
  last_payment_amount = p.amount,
  membership_fee = p.amount,
  additional_donation = 0
FROM (
  SELECT DISTINCT ON (member_id) member_id, payment_date, amount
  FROM membership_payments
  ORDER BY member_id, payment_date DESC
) p
WHERE m.id = p.member_id
  AND m.last_payment_amount IS NULL;

-- 4. Backfill existing payment records
UPDATE membership_payments
SET
  membership_fee = amount,
  additional_donation = 0,
  payment_year = EXTRACT(YEAR FROM payment_date)::integer
WHERE membership_fee IS NULL;
