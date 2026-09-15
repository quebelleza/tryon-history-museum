-- Newsletter consent is separate from membership. Only server-side service_role access.
begin;
create table public.newsletter_subscribers (
  id uuid primary key default gen_random_uuid(),
  email text not null unique check (email = lower(btrim(email)) and length(email) <= 254),
  status text not null default 'pending' check (status in ('pending', 'subscribed', 'unsubscribed')),
  confirmation_hash text unique,
  confirmation_expires_at timestamptz,
  unsubscribe_hash text unique,
  requested_at timestamptz,
  confirmed_at timestamptz,
  unsubscribed_at timestamptz,
  request_window_start timestamptz,
  request_count integer not null default 0,
  consent_version text not null default 'newsletter-v1',
  created_at timestamptz not null default now()
);
alter table public.newsletter_subscribers enable row level security;
revoke all on public.newsletter_subscribers from anon, authenticated;
grant all on public.newsletter_subscribers to service_role;

-- Serialize same-address requests across serverless instances. Max 3 emails/day,
-- at least 10 minutes apart. Return no subscriber information to public clients.
create function public.newsletter_request(p_email text, p_confirmation_hash text, p_unsubscribe_hash text)
returns boolean language plpgsql security invoker set search_path = '' as $$
declare s public.newsletter_subscribers%rowtype;
begin
  insert into public.newsletter_subscribers(email) values (p_email) on conflict (email) do nothing;
  select * into s from public.newsletter_subscribers where email = p_email for update;
  if s.status = 'subscribed' or s.requested_at > now() - interval '10 minutes' then return false; end if;
  if s.request_window_start > now() - interval '24 hours' and s.request_count >= 3 then return false; end if;
  update public.newsletter_subscribers set
    status = 'pending', confirmed_at = null, unsubscribed_at = null, confirmation_hash = p_confirmation_hash,
    unsubscribe_hash = p_unsubscribe_hash,
    confirmation_expires_at = now() + interval '24 hours', requested_at = now(),
    request_count = case when s.request_window_start > now() - interval '24 hours' then s.request_count + 1 else 1 end,
    request_window_start = case when s.request_window_start > now() - interval '24 hours' then s.request_window_start else now() end,
    consent_version = 'newsletter-v1'
  where id = s.id;
  return true;
end; $$;

create function public.newsletter_confirm(p_hash text)
returns boolean language plpgsql security invoker set search_path = '' as $$
declare s public.newsletter_subscribers%rowtype;
begin
  select * into s from public.newsletter_subscribers where confirmation_hash = p_hash for update;
  if not found then return false; end if;
  if s.status = 'subscribed' then return true; end if;
  if s.status <> 'pending' or s.confirmation_expires_at <= now() then return false; end if;
  update public.newsletter_subscribers set status = 'subscribed', confirmed_at = now(), unsubscribed_at = null where id = s.id;
  return true;
end; $$;

create function public.newsletter_unsubscribe(p_hash text)
returns boolean language plpgsql security invoker set search_path = '' as $$
begin
  update public.newsletter_subscribers set status = 'unsubscribed',
    unsubscribed_at = coalesce(unsubscribed_at, now()), confirmation_hash = null,
    confirmation_expires_at = null
  where unsubscribe_hash = p_hash;
  return found;
end; $$;

revoke all on function public.newsletter_request(text, text, text) from public, anon, authenticated;
revoke all on function public.newsletter_confirm(text) from public, anon, authenticated;
revoke all on function public.newsletter_unsubscribe(text) from public, anon, authenticated;
grant execute on function public.newsletter_request(text, text, text) to service_role;
grant execute on function public.newsletter_confirm(text) to service_role;
grant execute on function public.newsletter_unsubscribe(text) to service_role;
commit;
