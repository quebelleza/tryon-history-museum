-- Migration 004: Email log table
-- Run this in the Supabase SQL Editor

CREATE TABLE IF NOT EXISTS email_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamp DEFAULT now(),
  member_id uuid REFERENCES members(id),
  email_type text,
  sent_to text,
  status text,
  resend_id text
);
