# Kuenphen Beauty Spa

A production-ready booking website for Kuenphen Beauty Spa — marketing site, customer
accounts, a real booking engine with double-booking prevention, and a full admin panel.

Built with Next.js 15 (App Router), TypeScript, Tailwind CSS v4, Radix primitives,
Framer Motion, React Hook Form + Zod, and Supabase (Postgres, Auth, Storage, RLS).

---

## Quick start

```bash
npm install
cp .env.example .env.local   # fill in the values below
npm run dev                  # http://localhost:3000
```

### Environment variables

| Variable | Where | Notes |
| --- | --- | --- |
Three variables are required to run the site — none of them secret:

| Variable | Where | Notes |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Vercel + local | `https://<project-ref>.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Vercel + local | Publishable key (`sb_publishable_…`). Safe to expose — RLS is what protects the data |
| `NEXT_PUBLIC_SITE_URL` | Vercel + local | Used for metadata, sitemap and auth redirect links |

Optional:

| Variable | Where | Notes |
| --- | --- | --- |
| `SUPABASE_SERVICE_ROLE_KEY` | Vercel + local | **Not needed today.** Only `lib/notifications/sms.ts` reads it, and that stub has no call sites yet. The Edge Functions get their own copy injected by Supabase. **Server only** — bypasses RLS, never prefix with `NEXT_PUBLIC_` |
| `RESEND_API_KEY` | Supabase Edge Function secret | Transactional email |
| `RESEND_FROM_EMAIL` | Supabase Edge Function secret | e.g. `bookings@yourdomain.com` |
| `ADMIN_NOTIFICATION_EMAIL` | Supabase Edge Function secret | Where new/cancelled booking alerts go |

---

## Architecture

```
app/                        Routes only — thin, mostly Server Components
  (marketing)/              Public site: home, services, gallery, about, testimonials, contact, search
  (auth)/                   Login, signup, forgot/reset password
  auth/callback/            Supabase code-exchange handler
  booking/                  Multi-step booking wizard + confirmation
  account/                  Customer dashboard (guarded)
  admin/                    Admin panel (guarded, role = admin)
components/ui/              Design-system primitives (Radix-based, hand-authored)
components/shared/          Logo, Navbar, Footer, GlassPanel, PageHero, …
components/motion/          Framer Motion wrappers (FadeIn, StaggerList)
features/<domain>/          Feature UI + server actions, grouped by domain
services/                   Data access — every Supabase query lives here
lib/supabase/               Browser / server / service-role clients
middleware.ts               Session refresh + route guards (self-contained for the Edge bundle)
lib/                        utils, constants, notifications, SEO helpers
schemas/                    Zod schemas (shared by forms and server actions)
types/                      Generated DB types + domain aliases
supabase/functions/         Deno Edge Functions (email)
```

Rule of thumb: **routes** compose, **features** render, **services** fetch. No component
queries Supabase directly.

---

## Database

The schema covers: `profiles`, `categories`, `services`, `staff`, `staff_services`,
`business_hours`, `holidays`, `appointments`, `gallery_items`, `testimonials`,
`promotions`, `settings`, `favorites`, `notification_logs`, `contact_messages`.

### Double-booking prevention

Enforced by Postgres itself, not by application code:

```sql
ALTER TABLE appointments ADD CONSTRAINT no_overlapping_staff_appointments
  EXCLUDE USING gist (staff_id WITH =, tstzrange(start_time, end_time) WITH &&)
  WHERE (status NOT IN ('cancelled','rejected'));
```

Two guests submitting the same slot at the same instant cannot both succeed — the second
insert fails with `23P01`, which the UI surfaces as "That time was just booked."

### Booking RPCs

All booking writes go through `SECURITY DEFINER` functions so the rules live in one place
and cannot be bypassed by a crafted client request:

- `get_available_slots(staff, service, date, exclude_appointment?)` — business hours,
  minus holidays/vacation, minus existing appointments, stepped by the configured slot
  interval, in the configured timezone.
- `create_appointment(...)` — re-validates the slot server-side before inserting.
- `cancel_appointment(id, reason)` / `reschedule_appointment(id, start, staff?)` —
  owner-or-admin only, with legal-state checks.

### Row Level Security

Enabled on every table. Public catalogue content is world-readable; customers can only
read their own profile, appointments and favourites; admins get full access through an
`is_admin()` helper.

---

## Regenerating types after a schema change

```bash
supabase gen types typescript --project-id <project-ref> > types/supabase.ts
```

---

## Email notifications

Two Deno Edge Functions in `supabase/functions/`:

| Function | Trigger | Sends |
| --- | --- | --- |
| `send-booking-email` | Database Webhook on `appointments` INSERT + UPDATE | Confirmation, approval, cancellation, reschedule (+ admin alerts) |
| `send-reminder-emails` | `pg_cron`, hourly | 24-hour reminders (idempotent via `reminder_sent_at`) |

Deploy and configure:

```bash
supabase functions deploy send-booking-email
supabase functions deploy send-reminder-emails
supabase secrets set RESEND_API_KEY=… RESEND_FROM_EMAIL=… ADMIN_NOTIFICATION_EMAIL=…
```

Then in the Supabase Dashboard:

1. **Database → Webhooks** → new webhook on `appointments`, events `INSERT` + `UPDATE`,
   type "Supabase Edge Functions", target `send-booking-email`.
2. **Database → Cron Jobs** → hourly (`0 * * * *`) invoking `send-reminder-emails`.

SMS and WhatsApp are stubbed: `lib/notifications/sms.ts` implements the same
`NotificationChannel` interface and records every send to `notification_logs`. Swap the
body of `send()` for a Twilio call when you are ready — no call sites change.

---

## Making yourself an admin

Sign up through the site, then run once in the Supabase SQL editor:

```sql
update public.profiles set role = 'admin' where id = (
  select id from auth.users where email = 'you@example.com'
);
```

`/admin` is then reachable; it is guarded in middleware *and* re-checked in the layout.

---

## Deploying to Vercel

1. Import the repo in Vercel and set the four `NEXT_PUBLIC_*` / service-role variables.
2. In Supabase → **Authentication → URL Configuration**, set the Site URL to your
   production domain and add `<domain>/auth/callback` to the redirect allow-list.
3. Create public Storage buckets for uploaded imagery: `services`, `staff`, `gallery`,
   `testimonials`, `avatars`.
4. Deploy the two Edge Functions and wire the webhook + cron (above).
5. Deploy. Then walk the golden path: sign up → book → cancel/reschedule from
   `/account` → approve in `/admin/bookings` → check it on the calendar.

`next.config.ts` already allow-lists your Supabase Storage host for `next/image`.

---

## Content management

Nothing user-facing is hardcoded. From `/admin` you can manage services, categories,
staff (and which treatments each performs), bookings, holidays and vacation days,
opening hours, gallery, testimonials, promotions, and every site setting — business
name, logo, contact details, social links, hero image, about copy, booking slot
interval, and timezone.

---

## Payments

Stripe is not wired up, but the data model is ready for it: `appointments` already
carries `payment_status`, `stripe_session_id` and `amount_total`, so a checkout step can
be added between review and confirmation without a migration.

---

## Scripts

```bash
npm run dev      # dev server
npm run build    # production build
npm run start    # serve the production build
npm run lint     # eslint
npx tsc --noEmit # type check
```
