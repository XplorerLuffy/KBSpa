// Triggered by a Supabase Database Webhook on public.appointments (INSERT + UPDATE).
import {
  adminNotificationEmail,
  bookingApprovedEmail,
  bookingCancellationEmail,
  bookingConfirmationEmail,
  bookingRescheduledEmail,
  type BookingEmailData,
} from "../_shared/emails.ts";
import { restQuery, sendEmail } from "../_shared/resend.ts";

type AppointmentRecord = {
  id: string;
  service_id: string;
  staff_id: string;
  start_time: string;
  end_time: string;
  status: string;
  contact_name: string | null;
  contact_email: string | null;
  cancelled_reason: string | null;
  price: number | null;
};

type WebhookPayload = {
  type: "INSERT" | "UPDATE" | "DELETE";
  record: AppointmentRecord;
  old_record: AppointmentRecord | null;
};

async function buildEmailData(record: AppointmentRecord): Promise<BookingEmailData> {
  const [services, staff, settings] = await Promise.all([
    restQuery<{ name: string; duration_minutes: number }>(
      `services?id=eq.${record.service_id}&select=name,duration_minutes`,
    ),
    restQuery<{ full_name: string }>(`staff?id=eq.${record.staff_id}&select=full_name`),
    restQuery<{ key: string; value: string }>(`settings?select=key,value`),
  ]);

  const settingsMap = Object.fromEntries(settings.map((row) => [row.key, row.value]));

  return {
    businessName: settingsMap.business_name ?? "Kuenphen Beauty Spa",
    customerName: record.contact_name ?? "there",
    serviceName: services[0]?.name ?? "Treatment",
    staffName: staff[0]?.full_name ?? "Our team",
    startTime: new Date(record.start_time).toLocaleString("en-GB", {
      dateStyle: "full",
      timeStyle: "short",
      timeZone: settingsMap.timezone ?? "Asia/Thimphu",
    }),
    durationMinutes: services[0]?.duration_minutes ?? 60,
    price: record.price != null ? `Nu. ${record.price}` : "—",
    reference: record.id.slice(0, 8).toUpperCase(),
    reason: record.cancelled_reason ?? undefined,
  };
}

Deno.serve(async (request) => {
  try {
    const payload: WebhookPayload = await request.json();
    const { type, record, old_record: previous } = payload;

    if (!record?.contact_email) {
      return new Response(JSON.stringify({ skipped: "no recipient" }), { status: 200 });
    }

    const data = await buildEmailData(record);
    const adminEmail = Deno.env.get("ADMIN_NOTIFICATION_EMAIL");

    if (type === "INSERT") {
      const email = bookingConfirmationEmail(data);
      await sendEmail({ to: record.contact_email, ...email });

      if (adminEmail) {
        const notice = adminNotificationEmail({ ...data, kind: "new" });
        await sendEmail({ to: adminEmail, ...notice });
      }
      return new Response(JSON.stringify({ sent: "confirmation" }), { status: 200 });
    }

    if (type === "UPDATE" && previous) {
      const statusChanged = previous.status !== record.status;
      const timeChanged = previous.start_time !== record.start_time;

      if (statusChanged && ["cancelled", "rejected"].includes(record.status)) {
        const email = bookingCancellationEmail(data);
        await sendEmail({ to: record.contact_email, ...email });

        if (adminEmail) {
          const notice = adminNotificationEmail({ ...data, kind: "cancelled" });
          await sendEmail({ to: adminEmail, ...notice });
        }
        return new Response(JSON.stringify({ sent: "cancellation" }), { status: 200 });
      }

      if (statusChanged && record.status === "confirmed") {
        const email = bookingApprovedEmail(data);
        await sendEmail({ to: record.contact_email, ...email });
        return new Response(JSON.stringify({ sent: "approved" }), { status: 200 });
      }

      if (timeChanged) {
        const email = bookingRescheduledEmail(data);
        await sendEmail({ to: record.contact_email, ...email });
        return new Response(JSON.stringify({ sent: "rescheduled" }), { status: 200 });
      }
    }

    return new Response(JSON.stringify({ skipped: "no matching event" }), {
      status: 200,
    });
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ error: String(error) }), { status: 500 });
  }
});
