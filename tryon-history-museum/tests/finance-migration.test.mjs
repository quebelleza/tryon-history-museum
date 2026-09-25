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
    create table public.members(id uuid primary key default gen_random_uuid(), first_name text, last_name text, email text);
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
    select id, '2026-01-10', 125, 'check', 'new_membership', 125, 0 from public.members;
  `);
  await db.exec(await fs.readFile('supabase/migrations/016_finance_reporting.sql', 'utf8'));
  const { rows } = await db.query(`
    select p.payment_type, p.membership_fee, p.additional_donation, p.donor_name,
           a.amount allocation_amount, a.designation_id
    from public.membership_payments p join public.payment_allocations a on a.payment_id = p.id
  `);
  assert.equal(rows.length, 1);
  assert.equal(rows[0].payment_type, 'new_member');
  assert.equal(Number(rows[0].membership_fee), 50);
  assert.equal(Number(rows[0].additional_donation), 75);
  assert.equal(Number(rows[0].allocation_amount), 75);
  assert.equal(rows[0].designation_id, null);
  assert.equal(rows[0].donor_name, 'Ada Lovelace');
  await db.close();
});
