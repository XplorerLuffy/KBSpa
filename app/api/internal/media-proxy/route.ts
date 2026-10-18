import { NextRequest, NextResponse } from "next/server";

// Temporary internal helper: re-serves a public Supabase Storage media asset as
// base64 JSON. Used once to pull real service photos into a brochure design
// from an environment where the Storage host itself isn't reachable. Removed
// after use — see the commit that deletes this file.
const ALLOWED_PREFIX =
  "https://xujnlmyphzaxqdlohvjx.supabase.co/storage/v1/object/public/";

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get("url");
  if (!url || !url.startsWith(ALLOWED_PREFIX)) {
    return NextResponse.json({ error: "url must be a public media asset" }, { status: 400 });
  }

  const res = await fetch(url);
  if (!res.ok) {
    return NextResponse.json({ error: `upstream ${res.status}` }, { status: 502 });
  }

  const buf = Buffer.from(await res.arrayBuffer());
  return NextResponse.json({
    contentType: res.headers.get("content-type") ?? "application/octet-stream",
    base64: buf.toString("base64"),
  });
}
