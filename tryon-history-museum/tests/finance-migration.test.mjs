import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import { PGlite } from '@electric-sql/pglite';

test('finance migration applies and backfills a valid allocation', async () => {
  const db = new PGlite();
  await db.exec(`
    create role anon;
    create role authenticated;
    create role service_role;
    create schema auth;
    create function auth.jwt() returns jsonb language sql immutable as $$ select '{}'::jsonb $$;
    create type payment_method as enum ('stripe', 'check', 'cash', 'other');
    create type payment_type as enum ('new_membership', 'renewal', 'donation', 'upgrade');
    create type member_status as enum ('active', 'expiring_soon', 'expired', 'pending');
    create table public.members(
      id uuid primary key default gen_random_uuid(), first_name text, last_name text, email text,
      start_date date, membership_start_date date, renewal_due_date date, expiration_date date,
      status member_status not null default 'pending', last_payment_date date, last_payment_amount numeric,
      membership_fee numeric, additional_donation numeric
    );
    create table public.membership_payments(
      id uuid primary key default gen_random_uuid(), created_at timestamptz default now(),
      member_id uuid not null references public.members(id) on delete cascade,
      payment_date date not null, amount numeric(10,2) not null,
      payment_method payment_method not null, payment_type payment_type not null,
      stripe_payment_id text, notes text, membership_fee numeric,
      additional_donation numeric, payment_year integer
    );
    insert into public.members(first_name, last_name, email) values ('Ada', 'Lovelace', 'ada@example.com');
    insert into public.membership_payments(member_id, payment_date, amount, payment_method, payment_type, membership_fee, additional_donation)
    select id, date '2026-01-10', 100, 'check'::payment_method, 'new_membership'::payment_type, 100, 0 from public.members
    union all select id, date '2026-03-10', 200, 'check'::payment_method, 'donation'::payment_type, 0, 200 from public.members
    union all select id, date '2026-12-15', 75, 'check'::payment_method, 'renewal'::payment_type, 50, 25 from public.members;
  `);
  await db.exec(await fs.readFile('supabase/migrations/016_finance_reporting.sql', 'utf8'));
  await db.exec(await fs.readFile('supabase/migrations/017_date_aware_membership_fees.sql', 'utf8'));
  const { rows } = await db.query(`
    select p.payment_date, p.payment_type, p.membership_fee, p.additional_donation, p.donor_name,
           a.amount allocation_amount, a.designation_id
    from public.membership_payments p join public.payment_allocations a on a.payment_id = p.id
    order by p.payment_date
  `);
  assert.equal(rows.length, 3);
  assert.deepEqual(rows.map((row) => [Number(row.membership_fee), Number(row.additional_donation), Number(row.allocation_amount)]), [[50, 50, 50], [0, 200, 200], [50, 25, 25]]);
  assert.equal(rows[0].payment_type, 'new_member');
  assert.equal(rows[0].designation_id, null);
  assert.equal(rows[0].donor_name, 'Ada Lovelace');
  const member = await db.query('select membership_start_date, renewal_due_date from public.members');
  assert.equal(new Date(member.rows[0].membership_start_date).toISOString().slice(0, 10), '2026-01-10');
  assert.equal(new Date(member.rows[0].renewal_due_date).toISOString().slice(0, 10), '2027-12-15');
  await db.close();
});
