-- Finance reporting: preserve every contribution, split dues from gifts, and track designations.
begin;

-- Normalize payment types to text so application values are consistent across old and new installs.
alter table public.membership_payments
  alter column payment_type type text using payment_type::text,
  alter column member_id drop not null;

update public.membership_payments
set payment_type = 'new_member'
where payment_type in ('new', 'new_membership');

-- Financial records must survive removal of a CRM member record.
alter table public.membership_payments
  drop constraint if exists membership_payments_member_id_fkey;
alter table public.membership_payments
  add constraint membership_payments_member_id_fkey
  foreign key (member_id) references public.members(id) on delete set null;

alter table public.membership_payments
  add column if not exists donor_name text,
  add column if not exists donor_email text,
  add column if not exists source text not null default 'admin',
  add column if not exists status text not null default 'completed',
  add column if not exists stripe_session_id text,
  add column if not exists stripe_payment_intent_id text;

alter table public.membership_payments
  drop constraint if exists membership_payments_source_check,
  add constraint membership_payments_source_check check (source in ('website', 'admin', 'import', 'other')),
  drop constraint if exists membership_payments_status_check,
  add constraint membership_payments_status_check check (status in ('completed', 'refunded', 'voided'));

create unique index if not exists idx_membership_payments_stripe_session
  on public.membership_payments(stripe_session_id)
  where stripe_session_id is not null;
create index if not exists idx_membership_payments_status_date
  on public.membership_payments(status, payment_date);

-- Preserve the contributor identity at transaction time, even if the member later changes.
update public.membership_payments p
set donor_name = nullif(btrim(concat_ws(' ', m.first_name, m.last_name)), ''),
    donor_email = m.email,
    source = case when p.payment_method::text = 'stripe' then 'website' else 'admin' end
from public.members m
where p.member_id = m.id
  and (p.donor_name is null or p.donor_email is null);

-- Calendar-year reporting derives from payment_date. Normalize the accounting split:
-- the first $50 of any qualifying $50+ membership/donation payment is dues.
update public.membership_payments
set membership_fee = case
      when amount >= 50 and payment_type in ('new_member', 'renewal', 'upgrade', 'donation') then 50
      when payment_type in ('new_member', 'renewal', 'upgrade') then amount
      else 0
    end,
    additional_donation = amount - case
      when amount >= 50 and payment_type in ('new_member', 'renewal', 'upgrade', 'donation') then 50
      when payment_type in ('new_member', 'renewal', 'upgrade') then amount
      else 0
    end,
    payment_year = extract(year from payment_date)::integer;

create table if not exists public.giving_designations (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  name text not null,
  kind text not null check (kind in ('fund', 'campaign')),
  description text,
  starts_on date,
  ends_on date,
  active boolean not null default true,
  constraint giving_designations_name_kind_unique unique (name, kind),
  constraint giving_designations_dates_check check (ends_on is null or starts_on is null or ends_on >= starts_on)
);

create table if not exists public.payment_allocations (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  payment_id uuid not null references public.membership_payments(id) on delete cascade,
  designation_id uuid references public.giving_designations(id) on delete restrict,
  amount numeric(10,2) not null check (amount > 0),
  constraint payment_allocation_target_unique unique nulls not distinct (payment_id, designation_id)
);

create index if not exists idx_payment_allocations_payment on public.payment_allocations(payment_id);
create index if not exists idx_payment_allocations_designation on public.payment_allocations(designation_id);

comment on column public.payment_allocations.designation_id is
  'NULL means Unrestricted; otherwise references an administrator-managed fund or campaign.';

-- Existing donation portions become Unrestricted and can be reclassified later.
insert into public.payment_allocations(payment_id, designation_id, amount)
select id, null, additional_donation
from public.membership_payments
where coalesce(additional_donation, 0) > 0
on conflict (payment_id, designation_id) do nothing;

-- New website/admin payments default their donation portion to Unrestricted.
create or replace function public.finance_default_allocation()
returns trigger language plpgsql set search_path = '' as $$
begin
  if coalesce(new.additional_donation, 0) > 0 then
    insert into public.payment_allocations(payment_id, designation_id, amount)
    values (new.id, null, new.additional_donation)
    on conflict (payment_id, designation_id)
    do update set amount = excluded.amount;
  end if;
  return new;
end; $$;

drop trigger if exists finance_default_allocation_on_payment on public.membership_payments;
create trigger finance_default_allocation_on_payment
after insert on public.membership_payments
for each row execute function public.finance_default_allocation();

-- Replace all allocations atomically after validating that they equal the donation portion.
create or replace function public.set_payment_allocations(p_payment_id uuid, p_allocations jsonb)
returns void language plpgsql security invoker set search_path = '' as $$
declare
  expected numeric(10,2);
  supplied numeric(10,2);
begin
  select coalesce(additional_donation, 0) into expected
  from public.membership_payments where id = p_payment_id for update;
  if not found then raise exception 'Payment not found'; end if;

  select coalesce(sum((entry->>'amount')::numeric), 0) into supplied
  from jsonb_array_elements(coalesce(p_allocations, '[]'::jsonb)) entry;
  if supplied <> expected then
    raise exception 'Allocations must total the donation portion of %', expected;
  end if;

  if exists (
    select 1 from jsonb_array_elements(coalesce(p_allocations, '[]'::jsonb)) entry
    left join public.giving_designations d on d.id = nullif(entry->>'designation_id', '')::uuid
    where nullif(entry->>'designation_id', '') is not null and d.id is null
  ) then raise exception 'Unknown designation'; end if;

  delete from public.payment_allocations where payment_id = p_payment_id;
  insert into public.payment_allocations(payment_id, designation_id, amount)
  select p_payment_id, nullif(entry->>'designation_id', '')::uuid, (entry->>'amount')::numeric
  from jsonb_array_elements(coalesce(p_allocations, '[]'::jsonb)) entry
  where (entry->>'amount')::numeric > 0;
end; $$;

drop policy if exists "Admin can read all payments" on public.membership_payments;
create policy "Admin can read all payments"
  on public.membership_payments for select
  using ((auth.jwt()->'app_metadata'->>'role') = 'admin');

alter table public.giving_designations enable row level security;
alter table public.payment_allocations enable row level security;
revoke all on public.giving_designations, public.payment_allocations from anon, authenticated;
grant all on public.giving_designations, public.payment_allocations to service_role;
revoke all on function public.set_payment_allocations(uuid, jsonb) from public, anon, authenticated;
grant execute on function public.set_payment_allocations(uuid, jsonb) to service_role;

commit;
