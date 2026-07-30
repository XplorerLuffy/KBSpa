-- The appointments table was never added to the supabase_realtime
-- publication, so Postgres never emitted change events for it at all —
-- the desktop app's realtime subscription (bookingWatcher.js) connects
-- successfully but silently receives nothing, so its new-booking sound
-- and notification never fire regardless of app version or login state.
alter publication supabase_realtime add table public.appointments;
