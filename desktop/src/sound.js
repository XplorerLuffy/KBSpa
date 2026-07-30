"use strict";

const { spawn } = require("node:child_process");

/**
 * Plays a short chime for a new booking using Windows' own built-in system
 * sounds (System.Media.SystemSounds, via PowerShell) rather than bundling an
 * audio file — this exists on every Windows install regardless of version or
 * sound scheme, so there is no asset to ship or license.
 *
 * Deliberately separate from the notification toast's own `silent: false`
 * sound: Windows can silence a toast's sound (Focus Assist, per-app
 * notification settings) while still showing it, so relying on that alone
 * isn't reliable for something worth actually hearing. This plays outside
 * the notification pipeline entirely.
 *
 * Best-effort only — if PowerShell is missing, blocked, or this isn't
 * Windows, the app must keep working exactly as if sound were never
 * attempted.
 */
function playNotificationSound() {
  if (process.platform !== "win32") return;

  try {
    const child = spawn(
      "powershell.exe",
      [
        "-NoProfile",
        "-NonInteractive",
        "-Command",
        "[System.Media.SystemSounds]::Asterisk.Play()",
      ],
      { windowsHide: true, stdio: "ignore" },
    );
    child.on("error", () => {
      /* PowerShell unavailable or blocked — silence is an acceptable fallback. */
    });
  } catch {
    /* spawn can throw synchronously in rare cases (e.g. EMFILE). */
  }
}

module.exports = { playNotificationSound };
