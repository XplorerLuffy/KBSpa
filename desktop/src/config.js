"use strict";

/**
 * All environment-specific values live here.
 *
 * The Supabase anon key is intentionally embedded: it is a public,
 * publishable key whose only power is what Row Level Security allows. The
 * service-role key must NEVER be shipped in a desktop app — anyone can unzip
 * an installer and read it, and it bypasses RLS entirely.
 */

// kb-spa-mkzq.vercel.app sits behind Vercel's SSO deployment protection
// (enabled for every domain except the custom one), so the desktop app must
// point at the real custom domain — the *.vercel.app one shows a Vercel
// auth wall instead of the login page.
const DEFAULT_ADMIN_URL = "https://www.kuenphenbeautyspa.com";

// Point at a local dev server with:  set KBSPA_URL=http://localhost:3000
const siteUrl = (process.env.KBSPA_URL || DEFAULT_ADMIN_URL).replace(/\/$/, "");

const supabaseUrl =
  process.env.KBSPA_SUPABASE_URL || "https://xujnlmyphzaxqdlohvjx.supabase.co";
const supabaseAnonKey =
  process.env.KBSPA_SUPABASE_ANON_KEY ||
  "sb_publishable_7X-PCXPgo2klWPqWZfLtCg_f40tRcEe";

/** Supabase stores its session in cookies named `sb-<project-ref>-auth-token`. */
function projectRefFrom(url) {
  const match = /^https?:\/\/([^.]+)\./.exec(url);
  return match ? match[1] : null;
}

// This window only ever shows the admin panel and the auth screens needed to
// reach it — never the public marketing site, the customer account area, or
// booking flow, even though they live on the same domain.
const ADMIN_PATHS = ["/admin", "/login", "/signup", "/forgot-password", "/reset-password", "/auth/callback"];

function isAdminPath(pathname) {
  return ADMIN_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

module.exports = {
  siteUrl,
  adminUrl: `${siteUrl}/admin`,
  loginUrl: `${siteUrl}/admin/login`,
  allowedOrigin: new URL(siteUrl).origin,
  isAdminPath,
  supabaseUrl,
  supabaseAnonKey,
  supabaseProjectRef: projectRefFrom(supabaseUrl),
  // Sections offered in the tray / application menu.
  sections: [
    { label: "Dashboard", path: "/admin" },
    { label: "Bookings", path: "/admin/bookings" },
    { label: "Calendar", path: "/admin/bookings/calendar" },
    { label: "Services", path: "/admin/services" },
    { label: "Staff", path: "/admin/staff" },
    { label: "Customers", path: "/admin/customers" },
    { label: "Settings", path: "/admin/settings" },
  ],
};
