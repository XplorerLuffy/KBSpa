# Kuenphen Beauty Spa

A production-ready booking website for Kuenphen Beauty Spa — marketing site, guest
checkout booking engine with double-booking prevention, and a full admin panel.

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
| `GMAIL_USER` | Supabase Edge Function secret | The Gmail address emails send from, e.g. `tshewangdema535@gmail.com` |
| `GMAIL_APP_PASSWORD` | Supabase Edge Function secret | A 16-char Google **App Password** for that account (Google Account → Security → 2-Step Verification → App passwords) — not its real password |
| `INTERNAL_FUNCTION_SECRET` | Supabase Edge Function secret | Shared secret the appointments trigger/cron use to call these functions — must match the `internal_function_secret` entry in Supabase Vault (see migration `20260730104606_wire_booking_email_notifications.sql`) |
| `ADMIN_NOTIFICATION_EMAIL` | Supabase Edge Function secret | Where new/cancelled booking alerts go |

---

## Architecture

```
app/                        Routes only — thin, mostly Server Components
  (marketing)/              Public site: home, services, gallery, about, testimonials, contact, search
  booking/                  Multi-step guest booking wizard + confirmation (cancel/reschedule)
  admin/                    Admin panel (guarded, role = admin) — includes /admin/login
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

The schema covers: `profiles` (admin/staff logins only), `customers` (guest booking
directory, matched by phone number), `categories`, `services`, `staff`, `staff_services`,
`business_hours`, `holidays`, `appointments`, `gallery_items`, `testimonials`,
`promotions`, `settings`, `notification_logs`, `contact_messages`.

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

Two Deno Edge Functions in `supabase/functions/`, sent through **Gmail's own SMTP**
(authenticated as `GMAIL_USER` via an App Password) rather than a third-party API —
that's the only way mail can legitimately claim to be from a gmail.com address at all;
a third-party API sending "from" a gmail.com address fails Gmail's own sender
authentication and gets rejected or spam-filtered, regardless of the from header.

| Function | Trigger | Sends |
| --- | --- | --- |
| `send-booking-email` | Postgres trigger on `appointments` INSERT + UPDATE (`appointments_notify_email`) | Confirmation, approval, cancellation, reschedule (+ admin alerts) |
| `send-reminder-emails` | `pg_cron`, hourly (`send-reminder-emails-hourly`) | 24-hour reminders (idempotent via `reminder_sent_at`) |

Both the trigger and the cron job call their function via `pg_net.http_post`, wired up
entirely as code in migration `20260730104606_wire_booking_email_notifications.sql` — no
Dashboard configuration needed for the trigger/schedule itself. They authenticate with a
shared secret (`x-webhook-secret` header) read from **Supabase Vault** at call time, never
hardcoded in the migration, checked by each function against `INTERNAL_FUNCTION_SECRET`.
Both functions run with `verify_jwt: false`, since neither is ever called by an end user —
only by the trigger/cron — so a user JWT doesn't apply; the shared secret is the auth.

Each function has its own local copies of `mailer.ts` and `emails.ts` (not a shared
`_shared/` folder) — small duplication, but keeps `supabase functions deploy` and the
Supabase MCP tool's own bundler (which does not resolve underscore-prefixed shared
directories across functions) both able to deploy it without drift between them.

Deploy and configure:

```bash
supabase functions deploy send-booking-email --no-verify-jwt
supabase functions deploy send-reminder-emails --no-verify-jwt
supabase secrets set GMAIL_USER=… GMAIL_APP_PASSWORD=… INTERNAL_FUNCTION_SECRET=… ADMIN_NOTIFICATION_EMAIL=…
```

`GMAIL_APP_PASSWORD` requires 2-Step Verification enabled on that Gmail account, then a
generated App Password (Google Account → Security → App passwords) — not the account's
real password. `INTERNAL_FUNCTION_SECRET` must match the value already stored in Vault
as `internal_function_secret` (set once via the SQL editor: `select vault.create_secret('<value>', 'internal_function_secret', '…')`
— see the migration for the exact secret name the trigger/cron look up).

To point `send-booking-email`/`send-reminder-emails` at a different Gmail account later,
just update the `GMAIL_USER`/`GMAIL_APP_PASSWORD` secrets — nothing else changes.

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

1. Import the repo in Vercel and set the three required variables (`NEXT_PUBLIC_SUPABASE_URL`,
   `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `NEXT_PUBLIC_SITE_URL` — the last one must match the
   domain you're deploying to, or metadata/sitemap/auth-redirect links will point at the
   wrong host). `SUPABASE_SERVICE_ROLE_KEY` is optional — see `.env.example`.
2. Storage is created by migration `00000000000003_media_storage.sql` — a single
   public `media` bucket that the admin panel uploads into. Nothing to click.
3. Deploy the two Edge Functions and wire the webhook + cron (above).
4. Deploy. Then walk the golden path: book as a guest → cancel/reschedule from the
   confirmation page it lands you on → approve in `/admin/bookings` → check it on
   the calendar.

`next.config.ts` already allow-lists your Supabase Storage host for `next/image`.

---

## Content management

Nothing user-facing is hardcoded. From `/admin` you can manage services, categories,
staff (and which treatments each performs), bookings, holidays and vacation days,
opening hours, gallery, testimonials, promotions, and every site setting — business
name, logo, contact details, social links, hero image/video, about copy, booking slot
interval, and timezone.

### Images

Every image and video field is an upload control (`MediaField`): choose a file and
it goes straight to Supabase Storage, with a live preview and a Replace/Remove
pair. Pasting a URL is still available behind **Use a link**, so records that
already point at an external image keep working.

Uploads land in the public `media` bucket under a per-feature prefix
(`logo/`, `hero/`, `services/`, `staff/`, `gallery/`, `testimonials/`,
`promotions/`, `categories/`). Filenames are random UUIDs, so two uploads of
`photo.jpg` cannot overwrite each other.

The file goes **straight from the browser to Supabase Storage**, not through a
server action. Server actions cap request bodies at 1 MB and Vercel's functions
at roughly 4.5 MB, so posting a photo through one fails with
`Body exceeded 1 MB limit` for anything larger than a thumbnail. Going direct
also avoids streaming every upload through the server.

That places no trust in the browser. Writes are admin-only through the same
`is_admin()` helper the rest of the schema uses, enforced by storage RLS, and
the bucket enforces its own mime-type allow-list and 10 MB ceiling. Reads are
public because these are public marketing assets. `upload.validation.ts` mirrors
those rules client-side purely so the user gets an instant message instead of a
failed request.

---

## Brand assets & icons

| File | Used for |
| --- | --- |
| `public/logo.png` | Full lock-up — disc, arced wordmark, "SINCE 2020". Transparent background |
| `public/icon-mark.png` | Disc-and-hands only, circular, transparent |
| `app/icon.png` | Browser icon (copy of the mark) |
| `app/favicon.ico` | 48/32/16 px, embedded PNGs |
| `app/apple-icon.png` | 180x180, cream plate (iOS ignores transparency) |
| `public/icon-192.png`, `public/icon-512.png` | PWA manifest icons |
| `public/og-image.png` | 1200x630 Open Graph / Twitter card |
| `public/logo-512.png` | Raster logo for schema.org structured data |

Icons deliberately use the **mark, not the full logo**: the arced wordmark is
unreadable below roughly 64px, and next to the navbar's HTML wordmark it would
just be the same words twice. `favicon.ico` leads with its 48px entry because
Google Search expects a favicon that is a multiple of 48px.

**Replacing the logo.** Two options, neither needing a code change:

1. Admin → **Settings → Logo URL** — point it at any hosted image. Takes effect
   immediately, no deploy.
2. Drop replacement files into `public/` using the names above.

All of these are derived from the client's original 4096px artwork, which is
preserved in git history (commit `6177934`). The background was removed with a
flood fill seeded from the image border rather than a global white key — the
hands inside the disc are white too, so keying white out globally would erase
them. If the logo is ever replaced, regenerate the derived files so every size
stays in sync.

---

## Hero background video

The homepage hero plays a looping ambient MP4 (`public/hero-video.mp4`) over the still
image, generated with [Remotion](https://remotion.dev) — brand-colored gradient, drifting
gold/olive bokeh, and a faint rotating watermark of `public/icon-mark.png`. Source lives in
`remotion/`. To re-render after tweaking it:

```bash
npx remotion render remotion/src/index.ts HeroBackground public/hero-video.mp4
```

`npx remotion studio remotion/src/index.ts` opens a live preview. The video is skipped
entirely for visitors with `prefers-reduced-motion` enabled (the still image stays as the
backdrop), and admins can override both the image and video URLs from **Settings** without
a redeploy.

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
