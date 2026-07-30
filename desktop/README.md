# Kuenphen Admin — Desktop

A native Windows app for the salon's front desk. It wraps the live admin panel
rather than reimplementing it, so there is exactly one copy of every admin
screen: fix a bug once and both web and desktop get it.

What the desktop build adds over a browser tab:

- **New-booking alerts.** A native Windows notification the moment a booking
  comes in, even when the window is closed. Clicking it jumps straight to
  Bookings.
- **Tray icon** showing how many bookings are awaiting approval, with shortcuts
  to each admin section.
- **Runs in the background.** Closing the window hides it to the tray so alerts
  keep arriving; quitting is explicit.
- **Remembers its window** size, position and maximised state.
- **Offline screen** instead of a browser error page, with a retry button.
- **Updates itself.** Checks GitHub Releases for a newer build every few
  hours and at launch, downloads it in the background, and prompts to
  restart — nobody has to reinstall by hand again. See
  [Auto-updates](#auto-updates) for how to ship one.

---

## Running it

```bash
cd desktop
npm install
npm start
```

To point it at a local Next.js dev server instead of production:

```bash
npm run dev          # uses http://localhost:3000
```

Run the tests (no Electron binary needed — they mock the Electron API):

```bash
npm test
```

---

## Building the Windows installer

The installer **must be built on Windows** — that is a constraint of the
Windows packaging toolchain, not a choice.

**Option A — GitHub Actions (no Windows machine needed).** The repo has a
workflow at `.github/workflows/desktop-build.yml`. Run it from the Actions tab
("Build desktop admin (Windows)" → *Run workflow*) and download the installer
from the run's artifacts. Pushing a `desktop-v*` tag also attaches the
installer to a GitHub release.

**Option B — on a Windows PC:**

```bash
cd desktop
npm install
npm run build:win
```

The installer lands in `desktop/dist/KuenphenAdmin-Setup-<version>.exe`.

### About the SmartScreen warning

An unsigned installer makes Windows show a *"Windows protected your PC"*
prompt on first run (users click *More info → Run anyway*). This is normal for
unsigned software and does not mean anything is wrong. To remove it you need an
OV/EV code-signing certificate, then set these as repository secrets and pass
them to electron-builder:

```
CSC_LINK          # base64 of the .pfx certificate
CSC_KEY_PASSWORD  # its password
```

Certificates cost money and are issued to a registered business, so this is a
decision for the salon — the app works fine without one.

---

## Auto-updates

Installed copies check GitHub Releases for a newer version — at launch and
every 4 hours after — download it in the background, and ask to restart once
it's ready ("Restart now" / "Later"; if you pick Later it installs on the next
normal quit instead). There's also **Help → Check for updates** to check on
demand.

**To ship an update, tag a release — that's the only step that matters:**

1. Bump the version in `desktop/package.json` (e.g. `1.0.0` → `1.0.1`) and
   commit it. Installed copies compare against this number, so a build
   without a version bump is invisible to them.
2. Tag it and push the tag:
   ```bash
   git tag desktop-v1.0.1
   git push origin desktop-v1.0.1
   ```
3. That triggers `.github/workflows/desktop-build.yml`, which builds on a real
   Windows runner and attaches three files to the GitHub release: the
   installer, `latest.yml`, and a `.blockmap`. **All three are required** —
   `latest.yml` is the update feed electron-updater reads to know a newer
   version exists, and the `.blockmap` lets it download just the changed
   bytes instead of the whole installer again.

Running `npm run build:win` locally (or the *Run workflow* button without a
tag) still produces a working installer, but doesn't publish anywhere —
existing installs have nothing to check against, so nobody auto-updates from
it. The tag is what makes a build "the current version."

A first-time manual install still needs the SmartScreen click-through above;
auto-updates that follow do not re-trigger it in most cases, since Windows'
reputation check is mainly about the first time a binary is ever run on that
machine.

---

## Configuration

Defaults are baked in; override with environment variables when needed.

| Variable | Purpose | Default |
| --- | --- | --- |
| `KBSPA_URL` | Site the app loads | the production Vercel URL |
| `KBSPA_SUPABASE_URL` | Supabase project URL | the project URL |
| `KBSPA_SUPABASE_ANON_KEY` | Publishable key | the anon key |

**On keys:** only the *publishable* (anon) key is embedded, and that is safe —
it is the same key already shipped in the public website's JavaScript, and Row
Level Security is what actually protects the data. The **service-role key must
never be added here**: anyone can unzip an installer and read its contents, and
that key bypasses RLS entirely.

---

## How the background alerts work

The window signs in normally, and `@supabase/ssr` stores the session in a
cookie. The main process reads that cookie (`src/session.js`), recovers the
access token, and opens its own authenticated Supabase realtime subscription to
the `appointments` table (`src/bookingWatcher.js`).

Doing it this way means the website needs no knowledge that Electron exists —
no IPC contract, no shared code to keep in sync. RLS still applies, so the app
sees exactly what that admin would see in a browser. Every step degrades
quietly: if the cookie is missing or malformed, or realtime is unreachable, the
app carries on as a normal window and the badge simply reads zero.

---

## Security posture

The window renders a remote page, so it is locked down accordingly:

- `contextIsolation: true`, `nodeIntegration: false`, `sandbox: true`
- Navigation is restricted to the app's own origin; every other link opens in
  the system browser
- `setWindowOpenHandler` denies in-app popups
- The preload bridge exposes exactly one argument-less function (`retry`), so
  nothing the page sends can redirect the app

---

## Files

```
src/main.js            App lifecycle, window, menu, security policy
src/config.js          URLs, keys, tray/menu sections
src/session.js         Recovers the Supabase token from window cookies
src/bookingWatcher.js  Realtime subscription + native notifications
src/tray.js            Tray icon, pending-booking badge
src/updater.js         Checks GitHub Releases, downloads and installs updates
src/windowState.js     Remembers window size/position
src/preload.js         Minimal renderer bridge
src/offline.html       Shown when the network is unavailable
test/smoke.test.js     Runs the modules against a mocked Electron API
```
