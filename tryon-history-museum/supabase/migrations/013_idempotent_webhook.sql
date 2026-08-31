-- Migration 013: Idempotency table for Stripe webhook events
-- Prevents duplicate processing when Stripe retries a delivery.
-- Additive only — no existing tables or data are modified.

create table if not exists processed_webhook_events (
  event_id     text        primary key,
  event_type   text        not null,
  processed_at timestamptz not null default now()
);
