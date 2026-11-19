-- Migration 018: Reusable event ticketing schema
-- Run this in the Supabase SQL Editor (test/preview project FIRST, then
-- production only after review).
--
-- Additive and non-destructive only. No existing tables or data touched.
--
-- Model:
--   ticketed_events          — one row per sellable event (capacity + sales flag)
--   event_ticket_types       — priced products per event (seats_per_unit)
--   event_orders             — purchaser + payment state (Stripe or offline/comp)
--   event_order_items        — purchased line items (type snapshot, qty, seats)
--   event_order_attendees    — one row per seat, references its order item
--
-- Capacity rule: a couples ticket is one item with seats_per_unit = 2, so
-- seat math lives entirely in `seats` columns — no special casing.
--
-- Seat availability counts: paid + comp + pending orders whose Stripe
-- Checkout Session has not yet expired (stripe_session_expires_at). Pending
-- holds therefore release in step with Stripe's own session expiry, and the
-- checkout.session.expired webhook marks the order cancelled as well.

-- ─── Tables ─────────────────────────────────────────────────────────────────

create table if not exists public.ticketed_events (
  id            uuid primary key default gen_random_uuid(),
  slug          text not null unique,
  title         text not null,
  starts_at     timestamptz not null,
  venue_name    text,
  venue_address text,
  capacity      integer not null default 0 check (capacity >= 0),
  sales_enabled boolean not null default false,
  refund_policy text,
  status        text not null default 'published'
                check (status in ('draft','published','cancelled','completed')),
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create table if not exists public.event_ticket_types (
  id              uuid primary key default gen_random_uuid(),
  event_id        uuid not null references public.ticketed_events(id) on delete cascade,
  code            text not null,
  label           text not null,
  price_cents     integer not null check (price_cents >= 0),
  seats_per_unit  integer not null default 1 check (seats_per_unit > 0),
  stripe_price_id text,
  sort_order      integer not null default 0,
  active          boolean not null default true,
  unique (event_id, code)
);

create table if not exists public.event_orders (
  id                         uuid primary key default gen_random_uuid(),
  event_id                   uuid not null references public.ticketed_events(id),
  purchaser_name             text not null,
  purchaser_email            text not null,
  purchaser_phone            text,
  status                     text not null default 'pending'
                             check (status in ('pending','paid','cancelled','refunded','comp')),
  amount_cents               integer not null default 0,
  amount_refunded_cents      integer not null default 0,
  seats                      integer not null default 0,
  payment_method             text not null default 'stripe'
                             check (payment_method in ('stripe','comp','offline')),
  stripe_session_id          text unique,
  stripe_payment_intent_id   text,
  stripe_session_expires_at  timestamptz,
  email_sent_at              timestamptz,
  source                     text not null default 'website',
  notes                      text,
  created_at                 timestamptz not null default now(),
  paid_at                    timestamptz,
  refunded_at                timestamptz,
  cancelled_at               timestamptz
);

create index if not exists event_orders_event_idx   on public.event_orders(event_id);
create index if not exists event_orders_status_idx  on public.event_orders(status);
create index if not exists event_orders_pi_idx      on public.event_orders(stripe_payment_intent_id);

create table if not exists public.event_order_items (
  id               uuid primary key default gen_random_uuid(),
  order_id         uuid not null references public.event_orders(id) on delete cascade,
  ticket_type_id   uuid references public.event_ticket_types(id) on delete set null,
  ticket_code      text not null,
  ticket_label     text not null,
  unit_price_cents integer not null,
  quantity         integer not null check (quantity > 0),
  seats            integer not null check (seats > 0)
);

create index if not exists event_order_items_order_idx on public.event_order_items(order_id);

create table if not exists public.event_order_attendees (
  id            uuid primary key default gen_random_uuid(),
  order_id      uuid not null references public.event_orders(id) on delete cascade,
  order_item_id uuid references public.event_order_items(id) on delete set null,
  full_name     text not null,
  checked_in_at timestamptz,
  created_at    timestamptz not null default now()
);

create index if not exists event_order_attendees_order_idx on public.event_order_attendees(order_id);

-- ─── Row-level security ──────────────────────────────────────────────────────
-- All access goes through the service role (admin client), which bypasses RLS.
-- Policies intentionally grant nothing to anon/authenticated so attendee PII
-- is never publicly readable.

alter table public.ticketed_events         enable row level security;
alter table public.event_ticket_types      enable row level security;
alter table public.event_orders            enable row level security;
alter table public.event_order_items       enable row level security;
alter table public.event_order_attendees   enable row level security;

-- ─── Atomic order creation ───────────────────────────────────────────────────
-- Locks the event row (serializing concurrent checkouts), validates ticket
-- types and attendee counts server-side, enforces capacity, then writes the
-- order + items + attendees in a single transaction. Any raised exception
-- rolls the whole thing back.
--
-- p_status/p_payment_method let staff record comp or offline (cash/check)
-- registrations through the same path — those skip the sales_enabled gate
-- but still respect capacity.
--
-- Error convention: raise exception with a stable code prefix the route maps
-- to HTTP responses (event_not_found, sales_closed, invalid_ticket_type:*,
-- invalid_quantity, attendee_count_mismatch, invalid_attendee_name,
-- too_many_seats, sold_out:<remaining>).

create or replace function public.create_event_order(
  p_event_slug      text,
  p_purchaser_name  text,
  p_purchaser_email text,
  p_purchaser_phone text,
  p_items           jsonb,
  p_status          text default 'pending',
  p_payment_method  text default 'stripe',
  p_amount_cents    integer default null,
  p_max_seats_per_order integer default 10
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_event      ticketed_events%rowtype;
  v_item       jsonb;
  v_type       event_ticket_types%rowtype;
  v_order_id   uuid;
  v_item_id    uuid;
  v_qty        integer;
  v_seats      integer;
  v_total_cents integer := 0;
  v_total_seats integer := 0;
  v_sold       integer;
  v_attendees  text[];
  v_name       text;
begin
  if p_items is null or jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) = 0 then
    raise exception 'invalid_items';
  end if;
  if p_status not in ('pending','paid','comp') then
    raise exception 'invalid_status';
  end if;

  select * into v_event
  from ticketed_events
  where slug = p_event_slug
  for update;

  if not found then
    raise exception 'event_not_found';
  end if;

  -- Staff-recorded comp/offline orders bypass the public sales gate only.
  if p_payment_method = 'stripe' and (not v_event.sales_enabled or v_event.capacity <= 0) then
    raise exception 'sales_closed';
  end if;

  insert into event_orders (event_id, purchaser_name, purchaser_email, purchaser_phone,
                            status, payment_method)
  values (v_event.id, p_purchaser_name, p_purchaser_email, p_purchaser_phone,
          p_status, p_payment_method)
  returning id into v_order_id;

  for v_item in select value from jsonb_array_elements(p_items) loop
    select * into v_type
    from event_ticket_types
    where event_id = v_event.id and code = v_item ->> 'code' and active;

    if not found then
      raise exception 'invalid_ticket_type:%', v_item ->> 'code';
    end if;

    v_qty := coalesce((v_item ->> 'quantity')::integer, 0);
    if v_qty < 1 or v_qty > 20 then
      raise exception 'invalid_quantity';
    end if;
    v_seats := v_qty * v_type.seats_per_unit;

    insert into event_order_items (order_id, ticket_type_id, ticket_code, ticket_label,
                                   unit_price_cents, quantity, seats)
    values (v_order_id, v_type.id, v_type.code, v_type.label, v_type.price_cents, v_qty, v_seats)
    returning id into v_item_id;

    select coalesce(array_agg(value), '{}') into v_attendees
    from jsonb_array_elements_text(v_item -> 'attendees');

    if coalesce(array_length(v_attendees, 1), 0) <> v_seats then
      raise exception 'attendee_count_mismatch';
    end if;

    foreach v_name in array v_attendees loop
      if length(btrim(v_name)) < 2 then
        raise exception 'invalid_attendee_name';
      end if;
      insert into event_order_attendees (order_id, order_item_id, full_name)
      values (v_order_id, v_item_id, btrim(v_name));
    end loop;

    v_total_cents := v_total_cents + v_type.price_cents * v_qty;
    v_total_seats := v_total_seats + v_seats;
  end loop;

  if v_total_seats > p_max_seats_per_order then
    raise exception 'too_many_seats:%', p_max_seats_per_order;
  end if;

  -- Seats already committed: paid/comp, plus unexpired pending Stripe holds.
  select coalesce(sum(seats), 0) into v_sold
  from event_orders
  where event_id = v_event.id
    and id <> v_order_id
    and (status in ('paid', 'comp')
         or (status = 'pending' and stripe_session_expires_at > now()));

  if v_sold + v_total_seats > v_event.capacity then
    raise exception 'sold_out:%', greatest(v_event.capacity - v_sold, 0);
  end if;

  update event_orders
  set seats = v_total_seats,
      amount_cents = coalesce(p_amount_cents, v_total_cents),
      paid_at = case when p_status = 'paid' then now() else paid_at end
  where id = v_order_id;

  return v_order_id;
end;
$$;

-- Seats currently committed for an event (paid/comp + live pending holds).
create or replace function public.event_seats_sold(p_event_id uuid)
returns integer
language sql
stable
set search_path = public
as $$
  select coalesce(sum(seats), 0)::integer
  from event_orders
  where event_id = p_event_id
    and (status in ('paid', 'comp')
         or (status = 'pending' and stripe_session_expires_at > now()));
$$;

-- ─── Seed: An Evening of Wine & History ──────────────────────────────────────
-- capacity = 0 and sales_enabled = false by design: ticket sales stay closed
-- until staff set an approved capacity and enable sales in the admin dashboard.

insert into public.ticketed_events (slug, title, starts_at, venue_name, venue_address, capacity, sales_enabled, status)
values (
  'an-evening-of-wine-and-history',
  'An Evening of Wine & History',
  '2026-12-02T17:00:00-05:00',
  'Tryon Depot Room',
  '22 Depot Street, Tryon, NC 28782',
  0,
  false,
  'published'
)
on conflict (slug) do nothing;

insert into public.event_ticket_types (event_id, code, label, price_cents, seats_per_unit, sort_order)
select id, 'single', 'Single Admission', 3000, 1, 1
from public.ticketed_events where slug = 'an-evening-of-wine-and-history'
on conflict (event_id, code) do nothing;

insert into public.event_ticket_types (event_id, code, label, price_cents, seats_per_unit, sort_order)
select id, 'couple', 'Couples Admission', 5000, 2, 2
from public.ticketed_events where slug = 'an-evening-of-wine-and-history'
on conflict (event_id, code) do nothing;
