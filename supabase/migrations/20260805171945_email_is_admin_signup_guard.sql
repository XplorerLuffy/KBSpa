-- Lets the public signup form check (before creating an account) whether an
-- email belongs to an existing admin, without exposing anything else about
-- the auth.users table. Only a boolean for the exact email asked about.
create or replace function public.email_is_admin(check_email text)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1
    from auth.users u
    join public.profiles p on p.id = u.id
    where p.role = 'admin' and lower(u.email) = lower(check_email)
  );
$$;

revoke all on function public.email_is_admin(text) from public;
grant execute on function public.email_is_admin(text) to anon, authenticated;
