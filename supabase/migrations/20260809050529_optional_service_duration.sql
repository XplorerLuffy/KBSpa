-- Some treatments (e.g. ones that need a quick call to scope out first) don't
-- have a fixed duration. Previously duration_minutes was required, which
-- blocked saving such services from the admin panel entirely.

alter table public.services
  drop constraint if exists services_duration_minutes_check;

alter table public.services
  alter column duration_minutes drop not null;

alter table public.services
  add constraint services_duration_minutes_check
  check (duration_minutes is null or duration_minutes > 0);

-- reschedule_appointment previously had no explicit null-duration guard (it
-- relied on get_available_slots happening to return zero rows first, which
-- worked but produced a misleading "that slot was just booked" error).
-- create_appointment already guards this explicitly with SERVICE_UNAVAILABLE;
-- mirror that here for a consistent, honest error.
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
