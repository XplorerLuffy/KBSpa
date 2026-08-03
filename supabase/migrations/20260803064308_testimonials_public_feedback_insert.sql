-- Lets customers submit their own feedback (via the unlisted /feedback page,
-- reached by scanning an in-salon QR code) as a pending testimonial. The
-- check clause blocks a submitter from self-approving or self-featuring —
-- only an admin update can flip those flags, same as the existing
-- contact_messages_public_insert policy shape.
create policy testimonials_public_insert on public.testimonials
  for insert to anon, authenticated
  with check (is_approved = false and is_featured = false);
