-- Migration 006: Volunteers table
-- Run this in the Supabase SQL Editor

CREATE TABLE IF NOT EXISTS volunteers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamp DEFAULT now(),
  full_name text NOT NULL,
  email text NOT NULL,
  phone text NOT NULL,
  preferred_contact text,        -- 'email', 'phone', 'text'
  interest_reason text,
  prior_experience boolean,
  volunteer_areas text[],        -- array of selected areas
  availability jsonb,            -- stores day/time grid selections
  hours_per_month text,
  public_comfort_level integer,  -- 1-5 scale
  member_id uuid REFERENCES members(id),
  status text DEFAULT 'new'      -- 'new', 'contacted', 'active', 'inactive'
);

-- Auto-link volunteer to existing member by email
CREATE OR REPLACE FUNCTION link_volunteer_to_member()
RETURNS TRIGGER AS $$
BEGIN
  NEW.member_id := (SELECT id FROM members WHERE email = NEW.email LIMIT 1);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER link_volunteer_on_insert
BEFORE INSERT ON volunteers
FOR EACH ROW EXECUTE FUNCTION link_volunteer_to_member();

-- Enable RLS
ALTER TABLE volunteers ENABLE ROW LEVEL SECURITY;

-- Admin and board_member can read/write
CREATE POLICY "Admin full access to volunteers"
  ON volunteers
  FOR ALL
  USING (
    (SELECT role FROM auth.users WHERE id = auth.uid()) IN ('admin', 'board_member')
    OR
    (SELECT raw_app_meta_data->>'role' FROM auth.users WHERE id = auth.uid()) IN ('admin', 'board_member')
  );

-- Allow inserts from anon/authenticated for the public form (service role used server-side)
-- The API route uses the admin client, so RLS won't block it.
