import { NextRequest, NextResponse } from "next/server";

// Temporary internal helper: fetches a public image URL server-side (this
// environment has normal outbound internet) and returns it as base64 JSON,
// for an environment whose own egress is restricted. Removed after use.
const ALLOWED_PREFIXES = [
  "https://xujnlmyphzaxqdlohvjx.supabase.co/storage/v1/object/public/",
  "https://commons.wikimedia.org/wiki/Special:FilePath/",
  "https://upload.wikimedia.org/",
];

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get("url");
  if (!url || !ALLOWED_PREFIXES.some((p) => url.startsWith(p))) {
    return NextResponse.json({ error: "url not allowed" }, { status: 400 });
  }

  const res = await fetch(url, {
    redirect: "follow",
    headers: {
      "User-Agent": "KuenphenBeautySpaBrochureBot/1.0 (internal one-off asset fetch; contact: hello@kuenphenbeautyspa.com)",
    },
  });
  if (!res.ok) {
    return NextResponse.json({ error: `upstream ${res.status}` }, { status: 502 });
  }

  const buf = Buffer.from(await res.arrayBuffer());
  return NextResponse.json({
    contentType: res.headers.get("content-type") ?? "application/octet-stream",
    base64: buf.toString("base64"),
  });
}
