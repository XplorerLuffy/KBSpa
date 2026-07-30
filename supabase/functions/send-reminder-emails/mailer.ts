import nodemailer from "npm:nodemailer@6.9.16";

/**
 * Sends through Gmail's own SMTP servers, authenticated as GMAIL_USER via an
 * App Password (GMAIL_APP_PASSWORD) — not a third-party API. That's the only
 * way an email can legitimately claim to be from a gmail.com address: Gmail
 * enforces strict sender authentication for its own domain, so a third-party
 * API (Resend, SendGrid, etc.) sending "from" a gmail.com address fails that
 * check and gets rejected or spam-filtered, regardless of what the from
 * header says.
 */
const GMAIL_USER = Deno.env.get("GMAIL_USER");
const GMAIL_APP_PASSWORD = Deno.env.get("GMAIL_APP_PASSWORD");

let transporter: ReturnType<typeof nodemailer.createTransport> | null = null;

function getTransporter() {
  if (!GMAIL_USER || !GMAIL_APP_PASSWORD) return null;
  if (!transporter) {
    transporter = nodemailer.createTransport({
      service: "gmail",
      auth: { user: GMAIL_USER, pass: GMAIL_APP_PASSWORD },
    });
  }
  return transporter;
}

export async function sendEmail(input: { to: string; subject: string; html: string }) {
  const transport = getTransporter();
  if (!transport) {
    console.warn("Gmail SMTP is not configured; skipping email to", input.to);
    return { ok: false, skipped: true };
  }

  try {
    await transport.sendMail({
      from: `"Kuenphen Beauty Spa" <${GMAIL_USER}>`,
      to: input.to,
      subject: input.subject,
      html: input.html,
    });
    return { ok: true, skipped: false };
  } catch (error) {
    console.error("Gmail SMTP error", error);
    return { ok: false, skipped: false };
  }
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
