-- Apply membership dues only when a member is expired, missing a renewal date,
-- or due within 30 days of the payment date. Replay history to repair migration 016.
begin;

create or replace function public.replay_member_payment_history(p_member_id uuid)
returns void language plpgsql security invoker set search_path = '' as $$
declare
  payment record;
  renewal_date date := null;
  membership_start date := null;
  membership_amount numeric(10,2);
  donation_amount numeric(10,2);
  designated_amount numeric(10,2);
  unrestricted_amount numeric(10,2);
  latest_payment record;
begin
  for payment in
    select id, payment_date, amount
    from public.membership_payments
    where member_id = p_member_id and status = 'completed'
    order by payment_date, created_at, id
  loop
    if payment.amount >= 50
       and (renewal_date is null or renewal_date <= payment.payment_date + 30) then
      membership_amount := 50;
      donation_amount := payment.amount - 50;
      renewal_date := (payment.payment_date + interval '1 year')::date;
      membership_start := coalesce(membership_start, payment.payment_date);
    else
      membership_amount := 0;
      donation_amount := payment.amount;
    end if;

    update public.membership_payments
    set membership_fee = membership_amount,
        additional_donation = donation_amount,
        payment_year = extract(year from payment.payment_date)::integer
    where id = payment.id;

    select coalesce(sum(amount), 0) into designated_amount
    from public.payment_allocations
    where payment_id = payment.id and designation_id is not null;

    if designated_amount > donation_amount then
      raise exception 'Designated allocations exceed corrected donation amount for payment %', payment.id;
    end if;

    unrestricted_amount := donation_amount - designated_amount;
    delete from public.payment_allocations
    where payment_id = payment.id and designation_id is null;
    if unrestricted_amount > 0 then
      insert into public.payment_allocations(payment_id, designation_id, amount)
      values (payment.id, null, unrestricted_amount);
    end if;
  end loop;

  select payment_date, amount, membership_fee, additional_donation
  into latest_payment
  from public.membership_payments
  where member_id = p_member_id and status = 'completed'
  order by payment_date desc, created_at desc, id desc
  limit 1;

  update public.members
  set membership_start_date = coalesce(membership_start, membership_start_date),
      start_date = coalesce(membership_start, start_date),
      renewal_due_date = renewal_date,
      expiration_date = renewal_date,
      status = case
        when renewal_date is null then 'pending'
        when renewal_date < current_date then 'expired'
        when renewal_date <= current_date + 30 then 'expiring_soon'
        else 'active'
      end::public.member_status,
      last_payment_date = latest_payment.payment_date,
      last_payment_amount = latest_payment.amount,
      membership_fee = latest_payment.membership_fee,
      additional_donation = latest_payment.additional_donation
  where id = p_member_id;
end; $$;

revoke all on function public.replay_member_payment_history(uuid) from public, anon, authenticated;
grant execute on function public.replay_member_payment_history(uuid) to service_role;

do $$
declare
  member_record record;
begin
  for member_record in
    select distinct member_id
    from public.membership_payments
    where member_id is not null
  loop
    perform public.replay_member_payment_history(member_record.member_id);
  end loop;
end; $$;

commit;
