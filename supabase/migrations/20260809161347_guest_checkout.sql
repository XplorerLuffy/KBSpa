-- Removes customer login/signup entirely in favour of guest checkout.
-- Customers are now identified by phone number (the natural ID for a walk-in
-- salon business) via a new public.customers table, decoupled from
-- auth.users/profiles — profiles is now admin/staff-only. A repeat booking
-- with the same phone number is matched to the same customer record, so the
-- business still sees a customer's full history even though nobody ever
-- creates an account.
--
-- Self-service cancel/reschedule works off the booking's own id (an
-- unguessable UUID handed to the guest via the confirmation page/link) —
-- the same trust model already used for the QR-code feedback page — rather
-- than an auth session.

-- ---------------------------------------------------------------- customers

create table public.customers (
  id uuid primary key default gen_random_uuid(),
  full_name text,
  phone text not null,
  phone_normalized text generated always as (regexp_replace(phone, '\D', '', 'g')) stored,
  email text,
  gender text check (gender in ('female','male','other','prefer_not_to_say')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (phone_normalized)
);

create trigger customers_set_updated_at before update on public.customers
for each row execute function public.set_updated_at();

alter table public.customers enable row level security;

create policy customers_admin_all on public.customers
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- ---------------------------------------------------------------- backfill

-- appointments already stores contact_name/contact_phone/contact_email
-- redundantly on every row, so existing bookings can be attributed to a
-- customer record without any data loss.
insert into public.customers (full_name, phone, email, gender)
select distinct on (regexp_replace(a.contact_phone, '\D', '', 'g'))
  a.contact_name, a.contact_phone, a.contact_email, a.gender
from public.appointments a
where a.contact_phone is not null and length(trim(a.contact_phone)) > 0
order by regexp_replace(a.contact_phone, '\D', '', 'g'), a.created_at asc
on conflict (phone_normalized) do nothing;

alter table public.appointments drop constraint if exists appointments_customer_id_fkey;
alter table public.appointments alter column customer_id drop not null;

update public.appointments a
set customer_id = c.id
from public.customers c
where c.phone_normalized = regexp_replace(a.contact_phone, '\D', '', 'g')
  and a.contact_phone is not null and length(trim(a.contact_phone)) > 0;

alter table public.appointments
  add constraint appointments_customer_id_fkey
  foreign key (customer_id) references public.customers(id) on delete cascade;

-- ---------------------------------------------------------------- RLS

-- Guests are never "authenticated", so the old auth.uid()-based select policy
-- no longer applies to anyone booking as a guest. Reading a single booking is
-- handled by the SECURITY DEFINER get_appointment_confirmation() RPC below
-- instead of a table-level policy — admins keep full access separately.
drop policy if exists appointments_select_own on public.appointments;

-- ---------------------------------------------------------------- RPCs

create or replace function public.create_appointment(
  p_service_id uuid,
  p_staff_id uuid,
  p_start_time timestamptz,
  p_contact_name text default null,
  p_contact_phone text default null,
  p_contact_email text default null,
  p_gender text default null,
  p_notes text default null
)
returns public.appointments
language plpgsql security definer set search_path = public as $$
declare
  v_customer_id uuid;
  v_duration int;
  v_price numeric(10,2);
  v_end timestamptz;
  v_row public.appointments;
begin
  if p_contact_phone is null or length(trim(p_contact_phone)) = 0 then
    raise exception 'PHONE_REQUIRED' using errcode = '22004';
  end if;

  select duration_minutes, price into v_duration, v_price
  from public.services where id = p_service_id and is_active;
  if v_duration is null then
    raise exception 'SERVICE_UNAVAILABLE' using errcode = 'P0002';
  end if;

  if not exists (select 1 from public.staff where id = p_staff_id and is_active) then
    raise exception 'STAFF_UNAVAILABLE' using errcode = 'P0002';
  end if;

  if p_start_time <= now() then
    raise exception 'SLOT_IN_PAST' using errcode = 'P0001';
  end if;

  if not exists (
    select 1 from public.get_available_slots(
      p_staff_id, p_service_id,
      (timezone(public.business_timezone(), p_start_time))::date
    ) s where s.slot = p_start_time
  ) then
    raise exception 'SLOT_UNAVAILABLE' using errcode = 'P0001';
  end if;

  -- Remembers the customer across visits: same phone number, same record.
  insert into public.customers (full_name, phone, email, gender)
  values (
    nullif(trim(p_contact_name), ''),
    p_contact_phone,
    nullif(trim(p_contact_email), ''),
    p_gender
  )
  on conflict (phone_normalized) do update
    set full_name = coalesce(excluded.full_name, public.customers.full_name),
        email = coalesce(excluded.email, public.customers.email),
        gender = coalesce(excluded.gender, public.customers.gender),
        updated_at = now()
  returning id into v_customer_id;

  v_end := p_start_time + make_interval(mins => v_duration);

  insert into public.appointments (
    customer_id, service_id, staff_id, start_time, end_time,
    contact_name, contact_phone, contact_email, gender, notes, price
  ) values (
    v_customer_id, p_service_id, p_staff_id, p_start_time, v_end,
    p_contact_name, p_contact_phone, p_contact_email, p_gender, p_notes, v_price
  )
  returning * into v_row;

  return v_row;
end;
$$;

-- Ownership for guests is proven by knowing the appointment id itself (an
-- unguessable UUID from their confirmation page/email), not an auth session.
create or replace function public.cancel_appointment(
  p_appointment_id uuid,
  p_reason text default null
)
returns public.appointments
language plpgsql security definer set search_path = public as $$
declare v_row public.appointments;
begin
  select * into v_row from public.appointments where id = p_appointment_id;
  if v_row is null then raise exception 'NOT_FOUND' using errcode = 'P0002'; end if;

  if v_row.status in ('completed','cancelled','rejected') then
    raise exception 'NOT_CANCELLABLE' using errcode = 'P0001';
  end if;

  update public.appointments
  set status = 'cancelled', cancelled_reason = p_reason
  where id = p_appointment_id
  returning * into v_row;

  return v_row;
end;
$$;

create or replace function public.reschedule_appointment(
  p_appointment_id uuid,
  p_start_time timestamptz,
  p_staff_id uuid default null
)
returns public.appointments
language plpgsql security definer set search_path = public as $$
declare
  v_row public.appointments;
  v_staff uuid;
  v_duration int;
begin
  select * into v_row from public.appointments where id = p_appointment_id;
  if v_row is null then raise exception 'NOT_FOUND' using errcode = 'P0002'; end if;

  if v_row.status in ('completed','cancelled','rejected') then
    raise exception 'NOT_RESCHEDULABLE' using errcode = 'P0001';
  end if;

  v_staff := coalesce(p_staff_id, v_row.staff_id);
  select duration_minutes into v_duration from public.services where id = v_row.service_id;
  if v_duration is null then
    raise exception 'SERVICE_UNAVAILABLE' using errcode = 'P0002';
  end if;

  -- Excluding this appointment lets it move to an overlapping nearby time.
  if not exists (
    select 1 from public.get_available_slots(
      v_staff, v_row.service_id,
      (timezone(public.business_timezone(), p_start_time))::date,
      p_appointment_id
    ) s where s.slot = p_start_time
  ) then
    raise exception 'SLOT_UNAVAILABLE' using errcode = 'P0001';
  end if;

  update public.appointments
  set staff_id = v_staff,
      start_time = p_start_time,
      end_time = p_start_time + make_interval(mins => v_duration),
      reminder_sent_at = null
  where id = p_appointment_id
  returning * into v_row;

  return v_row;
end;
$$;

-- Powers the guest confirmation page: fetch exactly one booking by its own
-- (unguessable) id, bypassing RLS via SECURITY DEFINER rather than granting
-- anon a blanket table-level select policy.
create or replace function public.get_appointment_confirmation(p_id uuid)
returns table (
  id uuid,
  status text,
  start_time timestamptz,
  end_time timestamptz,
  contact_name text,
  contact_phone text,
  contact_email text,
  gender text,
  notes text,
  price numeric,
  service_id uuid,
  service_name text,
  service_slug text,
  service_duration_minutes int,
  staff_id uuid,
  staff_full_name text,
  staff_title text,
  staff_photo_url text
)
language sql stable security definer set search_path = public as $$
  select
    a.id, a.status, a.start_time, a.end_time,
    a.contact_name, a.contact_phone, a.contact_email, a.gender, a.notes, a.price,
    s.id, s.name, s.slug, s.duration_minutes,
    st.id, st.full_name, st.title, st.photo_url
  from public.appointments a
  join public.services s on s.id = a.service_id
  join public.staff st on st.id = a.staff_id
  where a.id = p_id;
$$;

-- ---------------------------------------------------------------- grants

revoke all on function public.create_appointment(uuid, uuid, timestamptz, text, text, text, text, text) from anon, authenticated, public;
revoke all on function public.cancel_appointment(uuid, text) from anon, authenticated, public;
revoke all on function public.reschedule_appointment(uuid, timestamptz, uuid) from anon, authenticated, public;

grant execute on function public.create_appointment(uuid, uuid, timestamptz, text, text, text, text, text) to anon, authenticated;
grant execute on function public.cancel_appointment(uuid, text) to anon, authenticated;
grant execute on function public.reschedule_appointment(uuid, timestamptz, uuid) to anon, authenticated;
grant execute on function public.get_appointment_confirmation(uuid) to anon, authenticated;
