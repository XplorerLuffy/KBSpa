-- notify_booking_email() is only meant to run as the appointments trigger
-- (which invokes it directly, unaffected by these grants). Every function in
-- the public schema is otherwise auto-exposed as a callable RPC endpoint
-- (PostgREST /rpc/<name>) — flagged by the security advisor since calling it
-- outside trigger context would error anyway (tg_op/new/old don't exist),
-- but there's no reason to leave it publicly invocable at all.
revoke execute on function public.notify_booking_email() from public, anon, authenticated;
