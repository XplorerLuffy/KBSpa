"use strict";

const { Notification } = require("electron");
const { createClient } = require("@supabase/supabase-js");
const config = require("./config");
const { readAccessToken } = require("./session");
const { playNotificationSound } = require("./sound");

/**
 * Watches the appointments table and raises native alerts for new bookings.
 *
 * Everything here degrades quietly: the desktop app must keep working as a
 * plain window if any of this fails. RLS still applies — the token belongs to
 * the signed-in admin, so this sees exactly what the web panel sees.
 */

const POLL_MS = 60_000;

let client = null;
let channel = null;
let currentToken = null;
let pollTimer = null;
let onCount = () => {};
let openSection = () => {};

function teardown() {
  try {
    if (channel && client) client.removeChannel(channel);
  } catch {
    /* already gone */
  }
  channel = null;
  client = null;
  currentToken = null;
}

async function refreshPendingCount() {
  if (!client) return;
  try {
    const { count, error } = await client
      .from("appointments")
      .select("id", { count: "exact", head: true })
      .eq("status", "pending");

    if (!error && typeof count === "number") onCount(count);
  } catch {
    /* offline — keep the last known count */
  }
}

function notifyNewBooking(row) {
  // Independent of the toast below: Windows can silence a notification's own
  // sound (Focus Assist, per-app settings) while still showing it silently,
  // so a booking worth hearing about needs a cue outside that pipeline.
  playNotificationSound();

  if (!Notification.isSupported()) return;

  const when = row?.start_time
    ? new Date(row.start_time).toLocaleString(undefined, {
        weekday: "short",
        day: "numeric",
        month: "short",
        hour: "numeric",
        minute: "2-digit",
      })
    : "";

  const notification = new Notification({
    title: "New booking request",
    body: when ? `A new appointment was requested for ${when}.` : "A new appointment was requested.",
    silent: false,
  });

  notification.on("click", () => openSection("/admin/bookings"));
  notification.show();
}

/** (Re)connect whenever the signed-in session changes. */
async function sync(electronSession) {
  const token = await readAccessToken(electronSession);

  if (!token) {
    if (client) teardown();
    onCount(0);
    return;
  }

  if (token === currentToken) {
    await refreshPendingCount();
    return;
  }

  teardown();
  currentToken = token;

  try {
    client = createClient(config.supabaseUrl, config.supabaseAnonKey, {
      auth: { persistSession: false, autoRefreshToken: false },
      global: { headers: { Authorization: `Bearer ${token}` } },
    });
    client.realtime.setAuth(token);

    channel = client
      .channel("kbspa-desktop-appointments")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "appointments" },
        (payload) => {
          notifyNewBooking(payload.new);
          refreshPendingCount();
        },
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "appointments" },
        () => refreshPendingCount(),
      )
      .subscribe();

    await refreshPendingCount();
  } catch {
    // Realtime unavailable; the poll below still keeps the badge roughly right.
    teardown();
  }
}

function start({ electronSession, onPendingCount, onOpenSection }) {
  onCount = onPendingCount || onCount;
  openSection = onOpenSection || openSection;

  const tick = () => {
    sync(electronSession).catch(() => {});
  };

  tick();
  pollTimer = setInterval(tick, POLL_MS);
}

function stop() {
  clearInterval(pollTimer);
  pollTimer = null;
  teardown();
}

module.exports = { start, stop };
