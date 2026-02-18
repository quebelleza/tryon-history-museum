-- ============================================================
-- Tryon History Museum — Membership Database Schema
-- Migration 001: Tables, Enums, RLS, Functions, Seed Data
-- ============================================================

-- ─── ENUMS ───────────────────────────────────────────────────

CREATE TYPE membership_tier AS ENUM ('individual', 'family');

CREATE TYPE effective_tier AS ENUM ('individual', 'family');

CREATE TYPE member_status AS ENUM ('active', 'expiring_soon', 'expired', 'pending');

CREATE TYPE donor_class AS ENUM ('none', 'donor', 'patron');

CREATE TYPE payment_method AS ENUM ('stripe', 'check', 'cash', 'other');

CREATE TYPE payment_type AS ENUM ('new_membership', 'renewal', 'donation', 'upgrade');


-- ─── TABLE: members ──────────────────────────────────────────

CREATE TABLE members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  first_name text NOT NULL,
  last_name text NOT NULL,
  email text NOT NULL UNIQUE,
  phone text,
  address text,
  membership_tier membership_tier NOT NULL DEFAULT 'individual',
  effective_access_tier effective_tier NOT NULL DEFAULT 'individual',
  status member_status NOT NULL DEFAULT 'pending',
  start_date date,
  expiration_date date,
  donor_class donor_class NOT NULL DEFAULT 'none',
  assigned_board_member text,
  notes text,
  auth_user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Index for common lookups
CREATE INDEX idx_members_email ON members (email);
CREATE INDEX idx_members_status ON members (status);
CREATE INDEX idx_members_donor_class ON members (donor_class);
CREATE INDEX idx_members_auth_user_id ON members (auth_user_id);
CREATE INDEX idx_members_expiration_date ON members (expiration_date);


-- ─── TABLE: membership_payments ──────────────────────────────

CREATE TABLE membership_payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  member_id uuid NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  payment_date date NOT NULL,
  amount numeric(10,2) NOT NULL CHECK (amount >= 0),
  payment_method payment_method NOT NULL,
  payment_type payment_type NOT NULL,
  stripe_payment_id text,
  notes text
);

CREATE INDEX idx_payments_member_id ON membership_payments (member_id);
CREATE INDEX idx_payments_date ON membership_payments (payment_date);


-- ─── TABLE: board_assignments ────────────────────────────────

CREATE TABLE board_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  member_id uuid NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  board_member_name text NOT NULL,
  assigned_date date NOT NULL,
  notes text
);

CREATE INDEX idx_board_assignments_member_id ON board_assignments (member_id);


-- ─── BUSINESS LOGIC: donor_class → effective_access_tier ─────
-- Rule 1: When donor_class is 'donor' or 'patron', auto-set
-- effective_access_tier to 'family' regardless of membership_tier.

CREATE OR REPLACE FUNCTION fn_sync_effective_tier()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.donor_class IN ('donor', 'patron') THEN
    NEW.effective_access_tier := 'family';
  ELSE
    NEW.effective_access_tier := NEW.membership_tier::text::effective_tier;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_sync_effective_tier
  BEFORE INSERT OR UPDATE OF donor_class, membership_tier
  ON members
  FOR EACH ROW
  EXECUTE FUNCTION fn_sync_effective_tier();


-- ─── BUSINESS LOGIC: Daily status update function ────────────
-- Rule 2: expiration_date within 30 days → 'expiring_soon'
-- Rule 3: expiration_date has passed → 'expired'
-- Run this as a Supabase pg_cron job daily, or call manually.

CREATE OR REPLACE FUNCTION fn_update_membership_statuses()
RETURNS void AS $$
BEGIN
  -- Mark expired members
  UPDATE members
  SET status = 'expired'
  WHERE expiration_date < CURRENT_DATE
    AND status != 'expired';

  -- Mark expiring soon (within 30 days)
  UPDATE members
  SET status = 'expiring_soon'
  WHERE expiration_date >= CURRENT_DATE
    AND expiration_date <= (CURRENT_DATE + INTERVAL '30 days')
    AND status NOT IN ('expired', 'expiring_soon');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- ─── SCHEDULE DAILY JOB (pg_cron) ───────────────────────────
-- Enable pg_cron extension first (may already be enabled on Supabase).
-- This runs every day at 3:00 AM UTC.

CREATE EXTENSION IF NOT EXISTS pg_cron;

SELECT cron.schedule(
  'daily-membership-status-update',
  '0 3 * * *',
  $$ SELECT fn_update_membership_statuses(); $$
);


-- ─── ROW LEVEL SECURITY ─────────────────────────────────────

-- Enable RLS on all tables
ALTER TABLE members ENABLE ROW LEVEL SECURITY;
ALTER TABLE membership_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE board_assignments ENABLE ROW LEVEL SECURITY;

-- Create custom roles (Supabase uses JWT claims for role-based access).
-- We'll use a custom 'user_role' claim in the JWT for 'member' and 'admin'.
-- These policies check auth.uid() and a custom claim via auth.jwt()->'user_metadata'.

-- ── members policies ──

-- Members can read their own record
CREATE POLICY "Members can read own record"
  ON members
  FOR SELECT
  USING (auth.uid() = auth_user_id);

-- Admin can read all members
CREATE POLICY "Admin can read all members"
  ON members
  FOR SELECT
  USING (
    (auth.jwt()->'user_metadata'->>'role') = 'admin'
  );

-- Admin can insert members
CREATE POLICY "Admin can insert members"
  ON members
  FOR INSERT
  WITH CHECK (
    (auth.jwt()->'user_metadata'->>'role') = 'admin'
  );

-- Admin can update members
CREATE POLICY "Admin can update members"
  ON members
  FOR UPDATE
  USING (
    (auth.jwt()->'user_metadata'->>'role') = 'admin'
  );

-- Admin can delete members
CREATE POLICY "Admin can delete members"
  ON members
  FOR DELETE
  USING (
    (auth.jwt()->'user_metadata'->>'role') = 'admin'
  );

-- ── membership_payments policies ──

-- Members can read their own payments
CREATE POLICY "Members can read own payments"
  ON membership_payments
  FOR SELECT
  USING (
    member_id IN (SELECT id FROM members WHERE auth_user_id = auth.uid())
  );

-- Admin can read all payments
CREATE POLICY "Admin can read all payments"
  ON membership_payments
  FOR SELECT
  USING (
    (auth.jwt()->'user_metadata'->>'role') = 'admin'
  );

-- Admin can insert payments
CREATE POLICY "Admin can insert payments"
  ON membership_payments
  FOR INSERT
  WITH CHECK (
    (auth.jwt()->'user_metadata'->>'role') = 'admin'
  );

-- Admin can update payments
CREATE POLICY "Admin can update payments"
  ON membership_payments
  FOR UPDATE
  USING (
    (auth.jwt()->'user_metadata'->>'role') = 'admin'
  );

-- Admin can delete payments
CREATE POLICY "Admin can delete payments"
  ON membership_payments
  FOR DELETE
  USING (
    (auth.jwt()->'user_metadata'->>'role') = 'admin'
  );

-- ── board_assignments policies ──

-- Members can read their own board assignments
CREATE POLICY "Members can read own board assignments"
  ON board_assignments
  FOR SELECT
  USING (
    member_id IN (SELECT id FROM members WHERE auth_user_id = auth.uid())
  );

-- Admin can read all board assignments
CREATE POLICY "Admin can read all board assignments"
  ON board_assignments
  FOR SELECT
  USING (
    (auth.jwt()->'user_metadata'->>'role') = 'admin'
  );

-- Admin can insert board assignments
CREATE POLICY "Admin can insert board assignments"
  ON board_assignments
  FOR INSERT
  WITH CHECK (
    (auth.jwt()->'user_metadata'->>'role') = 'admin'
  );

-- Admin can update board assignments
CREATE POLICY "Admin can update board assignments"
  ON board_assignments
  FOR UPDATE
  USING (
    (auth.jwt()->'user_metadata'->>'role') = 'admin'
  );

-- Admin can delete board assignments
CREATE POLICY "Admin can delete board assignments"
  ON board_assignments
  FOR DELETE
  USING (
    (auth.jwt()->'user_metadata'->>'role') = 'admin'
  );


-- ─── SEED DATA ───────────────────────────────────────────────
-- 4 sample records spanning different tiers and donor classes.
-- All marked for easy cleanup before launch.

INSERT INTO members (first_name, last_name, email, phone, address, membership_tier, status, start_date, expiration_date, donor_class, assigned_board_member, notes)
VALUES
  (
    'Eleanor', 'Whitfield',
    'eleanor.whitfield@example.com',
    '828-555-0101',
    '14 Laurel Lane, Tryon, NC 28782',
    'family',
    'active',
    '2025-09-01',
    '2026-09-01',
    'patron',
    'Margaret Davis',
    'SEED DATA — delete before launch'
  ),
  (
    'James', 'Rutherford',
    'james.rutherford@example.com',
    '828-555-0102',
    '88 Chestnut Ridge Rd, Tryon, NC 28782',
    'individual',
    'active',
    '2025-11-15',
    '2026-11-15',
    'donor',
    NULL,
    'SEED DATA — delete before launch'
  ),
  (
    'Susan', 'Hargrove',
    'susan.hargrove@example.com',
    '828-555-0103',
    '201 Trade Street, Tryon, NC 28782',
    'individual',
    'active',
    '2025-06-01',
    '2026-06-01',
    'none',
    NULL,
    'SEED DATA — delete before launch'
  ),
  (
    'Robert', 'Caldwell',
    'robert.caldwell@example.com',
    NULL,
    NULL,
    'family',
    'pending',
    NULL,
    NULL,
    'none',
    NULL,
    'SEED DATA — delete before launch'
  );

-- Seed payments for the first three members
INSERT INTO membership_payments (member_id, payment_date, amount, payment_method, payment_type, notes)
VALUES
  (
    (SELECT id FROM members WHERE email = 'eleanor.whitfield@example.com'),
    '2025-09-01', 350.00, 'check', 'new_membership',
    'SEED DATA — delete before launch'
  ),
  (
    (SELECT id FROM members WHERE email = 'james.rutherford@example.com'),
    '2025-11-15', 150.00, 'stripe', 'new_membership',
    'SEED DATA — delete before launch'
  ),
  (
    (SELECT id FROM members WHERE email = 'susan.hargrove@example.com'),
    '2025-06-01', 50.00, 'cash', 'new_membership',
    'SEED DATA — delete before launch'
  );

-- Seed board assignment for the patron member
INSERT INTO board_assignments (member_id, board_member_name, assigned_date, notes)
VALUES
  (
    (SELECT id FROM members WHERE email = 'eleanor.whitfield@example.com'),
    'Margaret Davis',
    '2025-09-01',
    'SEED DATA — delete before launch'
  );


-- ============================================================
-- END OF MIGRATION 001
-- ============================================================
