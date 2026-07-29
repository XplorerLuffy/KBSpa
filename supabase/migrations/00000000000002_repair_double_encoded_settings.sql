-- Repairs settings values mangled by the double-encoding bug.
--
-- saveSettings used to call JSON.stringify() on a value that supabase-js then
-- JSON-encoded again on its way into the jsonb column. Because the mangled
-- value was read straight back into the admin form, every save added another
-- layer: "+975…" -> "\"+975…\"" -> "\"\\\"+975…\\\"\"" and so on.
--
-- The write path is fixed in features/admin/actions.ts; this migration cleans
-- up rows already written. It is idempotent — correct values are left alone.

do $$
declare
  r record;
  v text;
  prev text;
  guard int;
begin
  for r in
    select key, value from public.settings where jsonb_typeof(value) = 'string'
  loop
    v := r.value #>> '{}';
    guard := 0;

    -- Peel each layer that is itself a valid quoted JSON string.
    loop
      guard := guard + 1;
      exit when guard > 10;
      prev := v;
      if v ~ '^\s*".*"\s*$' then
        begin
          v := (v::jsonb) #>> '{}';
        exception when others then
          exit;
        end;
      end if;
      exit when v = prev;
    end loop;

    -- Some layers were never valid JSON (stray \" wrappers), so strip those
    -- characters directly. Only when a backslash is present, to avoid touching
    -- text an admin deliberately quoted.
    if v ~ '\\' then
      v := btrim(v, '"\ ');
    end if;

    if v is distinct from (r.value #>> '{}') then
      update public.settings
         set value = to_jsonb(btrim(v)), updated_at = now()
       where key = r.key;
    end if;
  end loop;
end $$;

-- A blanked slot interval would break availability generation.
update public.settings
   set value = to_jsonb('30'::text), updated_at = now()
 where key = 'booking_slot_interval_minutes'
   and coalesce(btrim(value #>> '{}'), '') = '';
