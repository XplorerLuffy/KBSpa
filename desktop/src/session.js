"use strict";

const { supabaseProjectRef } = require("./config");

/**
 * Recovers the Supabase access token from the window's cookies.
 *
 * The admin panel signs in normally inside the BrowserWindow; @supabase/ssr
 * writes the session to a cookie named `sb-<project-ref>-auth-token`. Reading
 * it here lets the *main* process open its own authenticated connection for
 * background booking alerts, without the web app needing to know Electron
 * exists — no IPC contract, no coupling, nothing to keep in sync.
 *
 * Large sessions are split across `...auth-token.0`, `.1`, … so the chunks are
 * reassembled in index order before decoding.
 */

const PREFIX = supabaseProjectRef ? `sb-${supabaseProjectRef}-auth-token` : null;

function chunkIndex(name) {
  const match = /\.(\d+)$/.exec(name);
  return match ? Number(match[1]) : 0;
}

function decode(raw) {
  let value = raw;

  // Supabase marks base64 payloads with a `base64-` prefix.
  if (value.startsWith("base64-")) {
    value = Buffer.from(value.slice("base64-".length), "base64").toString("utf8");
  }

  const parsed = JSON.parse(value);
  // Depending on version the cookie holds the session object directly or wraps
  // it in an array alongside the user.
  const session = Array.isArray(parsed) ? parsed[0] : parsed;
  return session && typeof session.access_token === "string"
    ? session.access_token
    : null;
}

/**
 * @returns {Promise<string|null>} the access token, or null when signed out.
 */
async function readAccessToken(session) {
  if (!PREFIX) return null;

  try {
    const cookies = await session.cookies.get({});
    const parts = cookies
      .filter((cookie) => cookie.name.startsWith(PREFIX))
      .sort((a, b) => chunkIndex(a.name) - chunkIndex(b.name));

    if (parts.length === 0) return null;

    return decode(parts.map((cookie) => cookie.value).join(""));
  } catch {
    // Malformed or partially-written cookie: treat as signed out. The next
    // poll picks it up once the session settles.
    return null;
  }
}

module.exports = { readAccessToken };
