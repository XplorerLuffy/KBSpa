import { NextResponse, type NextRequest } from "next/server";

const PROTECTED_PREFIXES = ["/account", "/booking/review", "/booking/confirmation"];
const ADMIN_PREFIX = "/admin";
const ADMIN_LOGIN_PATH = "/admin/login";

/**
 * Kept self-contained on purpose: the Edge middleware bundle is built separately
 * from the app, and pulling shared modules in through the `@/` alias breaks that
 * bundle. Only package imports here.
 *
 * Every failure path is handled rather than thrown: an exception here returns a
 * 500 for *every* request, so a missing env var or a Supabase blip would take
 * the whole site down. Instead we fail closed on guarded routes (send the user
 * to /login) and open on public ones.
 *
 * `@supabase/ssr` is loaded with a dynamic import *inside* the try block below,
 * not as a static top-level import. A static import is evaluated when the module
 * loads, before the function body (and its try/catch) ever runs — so if anything
 * in that module's graph throws during evaluation, it crashes the whole Edge
 * Function with no chance to fail open. That's what was happening: the deployed
 * bundle threw `ReferenceError: __dirname is not defined` at import time, and no
 * in-function try/catch could ever have caught it. Routing the import itself
 * through the try block means a broken import degrades auth instead of taking
 * down the entire site.
 */
function isGuarded(pathname: string) {
  // The admin login page itself must stay reachable while signed out — it's
  // what unauthenticated /admin visitors get redirected to below, and
  // guarding it too would turn that into a redirect loop.
  if (pathname === ADMIN_LOGIN_PATH || pathname.startsWith(`${ADMIN_LOGIN_PATH}/`)) {
    return false;
  }
  return (
    pathname.startsWith(ADMIN_PREFIX) ||
    PROTECTED_PREFIXES.some((prefix) => pathname.startsWith(prefix))
  );
}

function redirectToLogin(request: NextRequest, pathname: string) {
  const url = request.nextUrl.clone();
  url.pathname = pathname.startsWith(ADMIN_PREFIX) ? ADMIN_LOGIN_PATH : "/login";
  url.searchParams.set("redirect", request.nextUrl.pathname);
  return NextResponse.redirect(url);
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    console.error(
      "Supabase env vars are missing; auth guards are inactive. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.",
    );
    return isGuarded(pathname) ? redirectToLogin(request, pathname) : NextResponse.next();
  }

  try {
    const { createServerClient } = await import("@supabase/ssr");

    let response = NextResponse.next({ request });

    const supabase = createServerClient(url, anonKey, {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    });

    // Also refreshes the auth cookie on every matched request.
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user && isGuarded(pathname)) return redirectToLogin(request, pathname);

    if (user && pathname.startsWith(ADMIN_PREFIX)) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      if (profile?.role !== "admin") {
        const home = request.nextUrl.clone();
        home.pathname = "/";
        home.search = "";
        return NextResponse.redirect(home);
      }
    }

    return response;
  } catch (error) {
    console.error("Middleware failed:", error);
    return isGuarded(pathname) ? redirectToLogin(request, pathname) : NextResponse.next();
  }
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|logo.svg|.*\\.(?:svg|png|jpg|jpeg|gif|webp|avif|ico|woff2?)$).*)",
  ],
};
