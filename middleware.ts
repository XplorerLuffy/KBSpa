import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

const PROTECTED_PREFIXES = ["/account", "/booking/review", "/booking/confirmation"];
const ADMIN_PREFIX = "/admin";

/**
 * Kept self-contained on purpose: the Edge middleware bundle is built separately
 * from the app, and pulling shared modules in through the `@/` alias breaks that
 * bundle. Only package imports here.
 *
 * Every failure path is handled rather than thrown: an exception here returns a
 * 500 for *every* request, so a missing env var or a Supabase blip would take
 * the whole site down. Instead we fail closed on guarded routes (send the user
 * to /login) and open on public ones.
 */
function isGuarded(pathname: string) {
  return (
    pathname.startsWith(ADMIN_PREFIX) ||
    PROTECTED_PREFIXES.some((prefix) => pathname.startsWith(prefix))
  );
}

function redirectToLogin(request: NextRequest) {
  const url = request.nextUrl.clone();
  url.pathname = "/login";
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
    return isGuarded(pathname) ? redirectToLogin(request) : NextResponse.next();
  }

  try {
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

    if (!user && isGuarded(pathname)) return redirectToLogin(request);

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
    return isGuarded(pathname) ? redirectToLogin(request) : NextResponse.next();
  }
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|logo.svg|.*\\.(?:svg|png|jpg|jpeg|gif|webp|avif|ico|woff2?)$).*)",
  ],
};
