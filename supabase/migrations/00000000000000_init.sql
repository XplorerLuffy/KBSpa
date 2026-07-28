-- Kuenphen Beauty Spa — consolidated schema.
-- Applied to the live project already; this file is the source of truth for a
-- fresh environment (`supabase db reset` / a new project).

create extension if not exists pgcrypto;
create extension if not exists btree_gist;

-- ---------------------------------------------------------------- helpers

create or replace function public.set_updated_at()
returns trigger language plpgsql set search_path = public as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------------------------------------------------------------- profiles

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  phone text,
  gender text check (gender in ('female','male','other','prefer_not_to_say')),
  avatar_url text,
  role text not null default 'customer' check (role in ('customer','admin')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger profiles_set_updated_at before update on public.profiles
for each row execute function public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name, phone)
  values (
    new.id,
    nullif(new.raw_user_meta_data ->> 'full_name', ''),
    nullif(new.raw_user_meta_data ->> 'phone', '')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created after insert on auth.users
for each row execute function public.handle_new_user();

create or replace function public.is_admin()
returns boolean language sql security definer stable set search_path = public as $$
  select exists (
    select 1 from public.profiles where id = auth.uid() and role = 'admin'
  );
$$;

-- ---------------------------------------------------------------- catalogue

create table public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  image_url text,
  sort_order int not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger categories_set_updated_at before update on public.categories
for each row execute function public.set_updated_at();

create table public.services (
  id uuid primary key default gen_random_uuid(),
  category_id uuid references public.categories(id) on delete set null,
  name text not null,
  slug text not null unique,
  short_description text,
  description text,
  benefits text[] not null default '{}',
  duration_minutes int not null check (duration_minutes > 0),
  price numeric(10,2) not null check (price >= 0),
  image_url text,
  gallery_urls text[] not null default '{}',
  is_active boolean not null default true,
  is_featured boolean not null default false,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index services_category_id_idx on public.services (category_id);
create index services_is_active_idx on public.services (is_active);
create trigger services_set_updated_at before update on public.services
for each row execute function public.set_updated_at();

create table public.staff (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  title text,
  bio text,
  photo_url text,
  is_active boolean not null default true,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger staff_set_updated_at before update on public.staff
for each row execute function public.set_updated_at();

create table public.staff_services (
  staff_id uuid not null references public.staff(id) on delete cascade,
  service_id uuid not null references public.services(id) on delete cascade,
  primary key (staff_id, service_id)
);
create index staff_services_service_id_idx on public.staff_services (service_id);

-- ---------------------------------------------------------------- scheduling

create table public.business_hours (
  weekday smallint primary key check (weekday between 0 and 6),
  is_closed boolean not null default false,
  open_time time not null default '09:00',
  close_time time not null default '19:00',
  updated_at timestamptz not null default now()
);
create trigger business_hours_set_updated_at before update on public.business_hours
for each row execute function public.set_updated_at();

-- staff_id null = the whole salon is closed that day.
create table public.holidays (
  id uuid primary key default gen_random_uuid(),
  date date not null,
  staff_id uuid references public.staff(id) on delete cascade,
  reason text,
  created_at timestamptz not null default now()
);
create unique index holidays_date_staff_idx
  on public.holidays (date, coalesce(staff_id, '00000000-0000-0000-0000-000000000000'::uuid));

create table public.appointments (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.profiles(id) on delete cascade,
  service_id uuid not null references public.services(id),
  staff_id uuid not null references public.staff(id),
  start_time timestamptz not null,
  end_time timestamptz not null,
  status text not null default 'pending'
    check (status in ('pending','confirmed','completed','cancelled','rejected','no_show')),
  contact_name text,
  contact_phone text,
  contact_email text,
  gender text check (gender in ('female','male','other','prefer_not_to_say')),
  notes text,
  cancelled_reason text,
  price numeric(10,2),
  -- Stripe-ready: a future checkout step fills these in, no migration needed.
  payment_status text not null default 'unpaid'
    check (payment_status in ('unpaid','paid','refunded')),
  stripe_session_id text,
  amount_total numeric(10,2),
  reminder_sent_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (end_time > start_time)
);
create index appointments_staff_start_idx on public.appointments (staff_id, start_time);
create index appointments_customer_start_idx on public.appointments (customer_id, start_time);
create index appointments_status_idx on public.appointments (status);
create trigger appointments_set_updated_at before update on public.appointments
for each row execute function public.set_updated_at();

-- Race-safe double-booking prevention, enforced by Postgres itself.
alter table public.appointments
  add constraint no_overlapping_staff_appointments
  exclude using gist (
    staff_id with =,
    tstzrange(start_time, end_time) with &&
  )
  where (status not in ('cancelled','rejected'));

-- ---------------------------------------------------------------- content

create table public.gallery_items (
  id uuid primary key default gen_random_uuid(),
  image_url text not null,
  caption text,
  category text,
  is_featured boolean not null default false,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);
create index gallery_items_category_idx on public.gallery_items (category);

create table public.testimonials (
  id uuid primary key default gen_random_uuid(),
  customer_name text not null,
  avatar_url text,
  rating smallint not null default 5 check (rating between 1 and 5),
  quote text not null,
  service_id uuid references public.services(id) on delete set null,
  is_approved boolean not null default false,
  is_featured boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.promotions (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  discount_type text check (discount_type in ('percentage','fixed')),
  discount_value numeric(10,2),
  service_id uuid references public.services(id) on delete set null,
  category_id uuid references public.categories(id) on delete set null,
  banner_image_url text,
  starts_at timestamptz,
  ends_at timestamptz,
  is_active boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.settings (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now()
);
create trigger settings_set_updated_at before update on public.settings
for each row execute function public.set_updated_at();

create table public.favorites (
  customer_id uuid not null references public.profiles(id) on delete cascade,
  service_id uuid not null references public.services(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (customer_id, service_id)
);

create table public.notification_logs (
  id uuid primary key default gen_random_uuid(),
  channel text not null check (channel in ('email','sms','whatsapp')),
  recipient text not null,
  template text,
  payload jsonb,
  status text not null default 'logged',
  error text,
  created_at timestamptz not null default now()
);

create table public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  phone text,
  subject text,
  message text not null,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------- RLS

alter table public.profiles           enable row level security;
alter table public.categories         enable row level security;
alter table public.services           enable row level security;
alter table public.staff              enable row level security;
alter table public.staff_services     enable row level security;
alter table public.business_hours     enable row level security;
alter table public.holidays           enable row level security;
alter table public.appointments       enable row level security;
alter table public.gallery_items      enable row level security;
alter table public.testimonials       enable row level security;
alter table public.promotions         enable row level security;
alter table public.settings           enable row level security;
alter table public.favorites          enable row level security;
alter table public.notification_logs  enable row level security;
alter table public.contact_messages   enable row level security;

create policy profiles_select_own on public.profiles
  for select to authenticated using (id = auth.uid() or public.is_admin());
create policy profiles_update_own on public.profiles
  for update to authenticated using (id = auth.uid()) with check (id = auth.uid());
create policy profiles_admin_all on public.profiles
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

create policy categories_public_read on public.categories
  for select to anon, authenticated using (is_active);
create policy categories_admin_all on public.categories
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

create policy services_public_read on public.services
  for select to anon, authenticated using (is_active);
create policy services_admin_all on public.services
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

create policy staff_public_read on public.staff
  for select to anon, authenticated using (is_active);
create policy staff_admin_all on public.staff
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

create policy staff_services_public_read on public.staff_services
  for select to anon, authenticated using (true);
create policy staff_services_admin_all on public.staff_services
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

create policy business_hours_public_read on public.business_hours
  for select to anon, authenticated using (true);
create policy business_hours_admin_all on public.business_hours
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

create policy holidays_public_read on public.holidays
  for select to anon, authenticated using (true);
create policy holidays_admin_all on public.holidays
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

create policy gallery_public_read on public.gallery_items
  for select to anon, authenticated using (true);
create policy gallery_admin_all on public.gallery_items
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

create policy testimonials_public_read on public.testimonials
  for select to anon, authenticated using (is_approved);
create policy testimonials_admin_all on public.testimonials
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

create policy promotions_public_read on public.promotions
  for select to anon, authenticated using (is_active);
create policy promotions_admin_all on public.promotions
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

create policy settings_public_read on public.settings
  for select to anon, authenticated using (true);
create policy settings_admin_all on public.settings
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- Customers read their own bookings; every write goes through the RPCs below.
create policy appointments_select_own on public.appointments
  for select to authenticated using (customer_id = auth.uid() or public.is_admin());
create policy appointments_admin_all on public.appointments
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

create policy favorites_own_all on public.favorites
  for all to authenticated using (customer_id = auth.uid()) with check (customer_id = auth.uid());

create policy notification_logs_admin_all on public.notification_logs
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

create policy contact_messages_public_insert on public.contact_messages
  for insert to anon, authenticated with check (true);
create policy contact_messages_admin_all on public.contact_messages
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- ---------------------------------------------------------------- booking RPCs

create or replace function public.business_timezone()
returns text language sql stable set search_path = public as $$
  select coalesce(
    (select value #>> '{}' from public.settings where key = 'timezone'),
    'Asia/Thimphu'
  );
$$;

create or replace function public.slot_interval_minutes()
returns int language sql stable set search_path = public as $$
  select coalesce(
    nullif((select value #>> '{}' from public.settings where key = 'booking_slot_interval_minutes'), '')::int,
    30
  );
$$;

create or replace function public.get_available_slots(
  p_staff_id uuid,
  p_service_id uuid,
  p_date date,
  p_exclude_appointment_id uuid default null
)
returns table (slot timestamptz)
language plpgsql stable security definer set search_path = public as $$
declare
  v_tz text := public.business_timezone();
  v_duration int;
  v_interval int := public.slot_interval_minutes();
  v_weekday smallint := extract(dow from p_date)::smallint;
  v_hours public.business_hours%rowtype;
begin
  select duration_minutes into v_duration
  from public.services where id = p_service_id and is_active;
  if v_duration is null then return; end if;

  select * into v_hours from public.business_hours where weekday = v_weekday;
  if v_hours is null or v_hours.is_closed then return; end if;

  if exists (
    select 1 from public.holidays
    where date = p_date and (staff_id is null or staff_id = p_staff_id)
  ) then return; end if;

  return query
  with candidates as (
    select generate_series(
      timezone(v_tz, (p_date + v_hours.open_time)::timestamp),
      timezone(v_tz, (p_date + v_hours.close_time)::timestamp) - make_interval(mins => v_duration),
      make_interval(mins => v_interval)
    ) as start_at
  )
  select c.start_at
  from candidates c
  where c.start_at > now()
    and not exists (
      select 1 from public.appointments a
      where a.staff_id = p_staff_id
        and a.status not in ('cancelled','rejected')
        and (p_exclude_appointment_id is null or a.id <> p_exclude_appointment_id)
        and tstzrange(a.start_time, a.end_time)
            && tstzrange(c.start_at, c.start_at + make_interval(mins => v_duration))
    )
  order by c.start_at;
end;
$$;

-- The EXCLUDE constraint is what makes this race-safe; the re-validation here
-- stops a client posting a slot it was never offered.
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
  v_customer uuid := auth.uid();
  v_duration int;
  v_price numeric(10,2);
  v_end timestamptz;
  v_row public.appointments;
begin
  if v_customer is null then
    raise exception 'AUTH_REQUIRED' using errcode = '28000';
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

  v_end := p_start_time + make_interval(mins => v_duration);

  insert into public.appointments (
    customer_id, service_id, staff_id, start_time, end_time,
    contact_name, contact_phone, contact_email, gender, notes, price
  ) values (
    v_customer, p_service_id, p_staff_id, p_start_time, v_end,
    p_contact_name, p_contact_phone, p_contact_email, p_gender, p_notes, v_price
  )
  returning * into v_row;

  return v_row;
end;
$$;

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

  if v_row.customer_id <> auth.uid() and not public.is_admin() then
    raise exception 'FORBIDDEN' using errcode = '42501';
  end if;

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

  if v_row.customer_id <> auth.uid() and not public.is_admin() then
    raise exception 'FORBIDDEN' using errcode = '42501';
  end if;

  if v_row.status in ('completed','cancelled','rejected') then
    raise exception 'NOT_RESCHEDULABLE' using errcode = 'P0001';
  end if;

  v_staff := coalesce(p_staff_id, v_row.staff_id);
  select duration_minutes into v_duration from public.services where id = v_row.service_id;

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

-- Trigger-only and internal helpers must not be reachable over the REST API.
revoke all on function public.handle_new_user() from anon, authenticated, public;
revoke all on function public.set_updated_at() from anon, authenticated, public;
revoke all on function public.is_admin() from anon, public;
grant execute on function public.is_admin() to authenticated;

grant execute on function public.get_available_slots(uuid, uuid, date, uuid) to anon, authenticated;
revoke all on function public.create_appointment(uuid, uuid, timestamptz, text, text, text, text, text) from anon, public;
revoke all on function public.cancel_appointment(uuid, text) from anon, public;
revoke all on function public.reschedule_appointment(uuid, timestamptz, uuid) from anon, public;
grant execute on function public.create_appointment(uuid, uuid, timestamptz, text, text, text, text, text) to authenticated;
grant execute on function public.cancel_appointment(uuid, text) to authenticated;
grant execute on function public.reschedule_appointment(uuid, timestamptz, uuid) to authenticated;
