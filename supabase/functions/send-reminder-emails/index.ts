// Scheduled hourly via pg_cron. Emails guests whose appointment is ~24h away.
import { bookingReminderEmail } from "../_shared/emails.ts";
import { restPatch, restQuery, sendEmail } from "../_shared/resend.ts";

type Row = {
  id: string;
  start_time: string;
  contact_name: string | null;
  contact_email: string | null;
  price: number | null;
  services: { name: string; duration_minutes: number } | null;
  staff: { full_name: string } | null;
};

Deno.serve(async () => {
  try {
    const from = new Date(Date.now() + 23 * 3600_000).toISOString();
    const to = new Date(Date.now() + 25 * 3600_000).toISOString();

    const rows = await restQuery<Row>(
      `appointments?select=id,start_time,contact_name,contact_email,price,services(name,duration_minutes),staff(full_name)` +
        `&status=eq.confirmed&reminder_sent_at=is.null` +
        `&start_time=gte.${from}&start_time=lt.${to}`,
    );

    const settings = await restQuery<{ key: string; value: string }>(
      "settings?select=key,value",
    );
    const settingsMap = Object.fromEntries(settings.map((row) => [row.key, row.value]));

    let sent = 0;
    for (const row of rows) {
      if (!row.contact_email) continue;

      const email = bookingReminderEmail({
        businessName: settingsMap.business_name ?? "Kuenphen Beauty Spa",
        customerName: row.contact_name ?? "there",
        serviceName: row.services?.name ?? "Treatment",
        staffName: row.staff?.full_name ?? "Our team",
        startTime: new Date(row.start_time).toLocaleString("en-GB", {
          dateStyle: "full",
          timeStyle: "short",
          timeZone: settingsMap.timezone ?? "Asia/Thimphu",
        }),
        durationMinutes: row.services?.duration_minutes ?? 60,
        price: row.price != null ? `Nu. ${row.price}` : "—",
        reference: row.id.slice(0, 8).toUpperCase(),
      });

      await sendEmail({ to: row.contact_email, ...email });
      // Stamped per row so an overlapping cron run cannot send twice.
      await restPatch(`appointments?id=eq.${row.id}`, {
        reminder_sent_at: new Date().toISOString(),
      });
      sent += 1;
    }

    return new Response(JSON.stringify({ sent }), { status: 200 });
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ error: String(error) }), { status: 500 });
  }
});
