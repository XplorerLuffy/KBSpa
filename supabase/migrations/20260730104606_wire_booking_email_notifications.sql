-- Wires up the two email Edge Functions that already existed as code but
-- were never actually triggered by anything: a trigger on appointments for
-- booking-confirmation/cancellation/reschedule emails, and an hourly cron
-- job for the 24h-ahead reminder email.
--
-- Both calls authenticate with a shared secret read from Supabase Vault
-- (never hardcoded here) via the `x-webhook-secret` header, matching the
-- check each function performs on INTERNAL_FUNCTION_SECRET.

create extension if not exists pg_net;
create extension if not exists pg_cron;

create or replace function public.notify_booking_email()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  secret text;
begin
  select decrypted_secret into secret
  from vault.decrypted_secrets
  where name = 'internal_function_secret';

  perform net.http_post(
    url := 'https://xujnlmyphzaxqdlohvjx.supabase.co/functions/v1/send-booking-email',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'x-webhook-secret', secret
    ),
    body := jsonb_build_object(
      'type', tg_op,
      'record', to_jsonb(new),
      'old_record', case when tg_op = 'UPDATE' then to_jsonb(old) else null end
    )
  );
  return new;
end;
$$;

drop trigger if exists appointments_notify_email on public.appointments;
create trigger appointments_notify_email
after insert or update on public.appointments
for each row execute function public.notify_booking_email();

select cron.schedule(
  'send-reminder-emails-hourly',
  '0 * * * *',
  $cron$
  select net.http_post(
    url := 'https://xujnlmyphzaxqdlohvjx.supabase.co/functions/v1/send-reminder-emails',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'x-webhook-secret',
      (select decrypted_secret from vault.decrypted_secrets where name = 'internal_function_secret')
    ),
    body := '{}'::jsonb
  );
  $cron$
);
