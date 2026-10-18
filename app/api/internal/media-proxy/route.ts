import { NextRequest, NextResponse } from "next/server";

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
