const RESEND_ENDPOINT = "https://api.resend.com/emails";

export async function sendEmail(input: {
  to: string;
  subject: string;
  html: string;
}) {
  const apiKey = Deno.env.get("RESEND_API_KEY");
  const from = Deno.env.get("RESEND_FROM_EMAIL");

  if (!apiKey || !from) {
    console.warn("Resend is not configured; skipping email to", input.to);
    return { ok: false, skipped: true };
  }

  const response = await fetch(RESEND_ENDPOINT, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ from, to: [input.to], ...input }),
  });

  if (!response.ok) {
    console.error("Resend error", response.status, await response.text());
    return { ok: false, skipped: false };
  }

  return { ok: true, skipped: false };
}

export function createServiceClient() {
  return {
    url: Deno.env.get("SUPABASE_URL")!,
    key: Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  };
}

/** Minimal PostgREST helper — avoids pulling the full supabase-js into Deno. */
export async function restQuery<T>(path: string): Promise<T[]> {
  const { url, key } = createServiceClient();
  const response = await fetch(`${url}/rest/v1/${path}`, {
    headers: { apikey: key, Authorization: `Bearer ${key}` },
  });
  if (!response.ok) return [];
  return response.json();
}

export async function restPatch(path: string, body: unknown) {
  const { url, key } = createServiceClient();
  await fetch(`${url}/rest/v1/${path}`, {
    method: "PATCH",
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
      Prefer: "return=minimal",
    },
    body: JSON.stringify(body),
  });
}
