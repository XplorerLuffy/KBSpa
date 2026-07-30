// Plain-function email templates. Kept dependency-free so the Edge Function
// deploys without a bundler step.

type BookingEmailData = {
  businessName: string;
  customerName: string;
  serviceName: string;
  staffName: string;
  startTime: string;
  durationMinutes: number;
  price: string;
  reference: string;
  reason?: string;
};

const GOLD = "#d4af37";
const CREAM = "#fdfbf7";
const CHARCOAL = "#1c1a18";

function layout(title: string, intro: string, body: string, businessName: string) {
  return `<!doctype html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${title}</title></head>
<body style="margin:0;padding:0;background:${CREAM};font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:${CHARCOAL}">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${CREAM};padding:32px 16px">
    <tr><td align="center">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#fff;border-radius:24px;overflow:hidden;box-shadow:0 8px 32px rgba(120,100,70,.12)">
        <tr><td style="background:${GOLD};padding:28px 32px;text-align:center">
          <h1 style="margin:0;font-family:Georgia,serif;font-size:22px;font-weight:500;color:${CHARCOAL}">${businessName}</h1>
        </td></tr>
        <tr><td style="padding:32px">
          <h2 style="margin:0 0 12px;font-family:Georgia,serif;font-size:20px;font-weight:500">${title}</h2>
          <p style="margin:0 0 24px;font-size:15px;line-height:1.6;color:#4a4540">${intro}</p>
          ${body}
        </td></tr>
        <tr><td style="padding:20px 32px;background:#faf6ee;text-align:center;font-size:12px;color:#7a736c">
          <p style="margin:0">${businessName} · Since 2020</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;
}

function detailsTable(data: BookingEmailData) {
  const rows: [string, string][] = [
    ["Treatment", data.serviceName],
    ["Therapist", data.staffName],
    ["When", data.startTime],
    ["Duration", `${data.durationMinutes} minutes`],
    ["Price", data.price],
    ["Reference", data.reference],
  ];

  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e5d9c3;border-radius:16px;padding:8px 16px">
    ${rows
      .map(
        ([label, value]) =>
          `<tr><td style="padding:8px 0;font-size:14px;color:#7a736c">${label}</td>
           <td style="padding:8px 0;font-size:14px;font-weight:600;text-align:right">${value}</td></tr>`,
      )
      .join("")}
  </table>`;
}

export function bookingConfirmationEmail(data: BookingEmailData) {
  return {
    subject: `Booking received — ${data.serviceName}`,
    html: layout(
      "Your booking is in",
      `Hi ${data.customerName}, thank you for booking with us. We will confirm your appointment shortly.`,
      detailsTable(data),
      data.businessName,
    ),
  };
}

export function bookingApprovedEmail(data: BookingEmailData) {
  return {
    subject: `Confirmed — ${data.serviceName}`,
    html: layout(
      "Your appointment is confirmed",
      `Hi ${data.customerName}, we look forward to seeing you. Please arrive five minutes early.`,
      detailsTable(data),
      data.businessName,
    ),
  };
}

export function bookingCancellationEmail(data: BookingEmailData) {
  return {
    subject: `Cancelled — ${data.serviceName}`,
    html: layout(
      "Your appointment was cancelled",
      `Hi ${data.customerName}, your appointment has been cancelled.${
        data.reason ? ` Reason: ${data.reason}.` : ""
      } You are welcome to book again any time.`,
      detailsTable(data),
      data.businessName,
    ),
  };
}

export function bookingRescheduledEmail(data: BookingEmailData) {
  return {
    subject: `Rescheduled — ${data.serviceName}`,
    html: layout(
      "Your appointment moved",
      `Hi ${data.customerName}, your appointment has a new time. Here are the updated details.`,
      detailsTable(data),
      data.businessName,
    ),
  };
}

export function bookingReminderEmail(data: BookingEmailData) {
  return {
    subject: `Tomorrow — ${data.serviceName}`,
    html: layout(
      "See you tomorrow",
      `Hi ${data.customerName}, this is a reminder of your appointment tomorrow.`,
      detailsTable(data),
      data.businessName,
    ),
  };
}

export function adminNotificationEmail(
  data: BookingEmailData & { kind: "new" | "cancelled" },
) {
  return {
    subject:
      data.kind === "new"
        ? `New booking — ${data.serviceName}`
        : `Cancellation — ${data.serviceName}`,
    html: layout(
      data.kind === "new" ? "New booking" : "Booking cancelled",
      `${data.customerName} ${data.kind === "new" ? "booked" : "cancelled"} ${data.serviceName}.`,
      detailsTable(data),
      data.businessName,
    ),
  };
}

export type { BookingEmailData };
