-- Storage for admin-uploaded imagery.
--
-- One public bucket, with folder prefixes per feature (logo/, hero/, services/,
-- staff/, gallery/, testimonials/, promotions/). A single bucket keeps the
-- policy surface small; the prefixes are purely organisational.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'media',
  'media',
  true,
  10485760,  -- 10 MB
  array[
    'image/png', 'image/jpeg', 'image/webp', 'image/avif',
    'image/gif', 'image/svg+xml', 'video/mp4', 'video/webm'
  ]
)
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

-- Anyone may read: these are public marketing assets, and the bucket is served
-- through public object URLs.
drop policy if exists "media is publicly readable" on storage.objects;
create policy "media is publicly readable"
  on storage.objects for select
  using (bucket_id = 'media');

-- Only admins may write. is_admin() is the same helper the rest of the schema
-- uses, so there is one definition of "admin" across the app.
drop policy if exists "admins can upload media" on storage.objects;
create policy "admins can upload media"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'media' and public.is_admin());

drop policy if exists "admins can update media" on storage.objects;
create policy "admins can update media"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'media' and public.is_admin())
  with check (bucket_id = 'media' and public.is_admin());

drop policy if exists "admins can delete media" on storage.objects;
create policy "admins can delete media"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'media' and public.is_admin());
