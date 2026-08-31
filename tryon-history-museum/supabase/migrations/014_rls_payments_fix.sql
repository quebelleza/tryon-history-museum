-- Migration 014: Fix membership_payments RLS policies
-- The original admin read policy in 001 used user_metadata for the role check.
-- Roles live in app_metadata, not user_metadata. Drop and recreate.
-- The member read policy is correct but recreated here for clarity.

-- Admin read policy fix
DROP POLICY IF EXISTS "Admin can read all payments" ON membership_payments;
CREATE POLICY "Admin can read all payments"
  ON membership_payments FOR SELECT
  USING (
    (auth.jwt()->'app_metadata'->>'role') IN ('admin', 'board_member')
  );

-- Ensure member read policy is correct
DROP POLICY IF EXISTS "Members can read own payments" ON membership_payments;
CREATE POLICY "Members can read own payments"
  ON membership_payments FOR SELECT
  USING (
    member_id IN (
      SELECT id FROM members WHERE auth_user_id = auth.uid()
    )
  );
