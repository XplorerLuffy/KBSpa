import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { format } from "date-fns";
import { CheckCircle2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { getAppointmentConfirmation } from "@/features/booking/actions";
import { ManageBookingActions } from "@/features/booking/components/ManageBookingActions";
import { STATUS_LABELS, type AppointmentStatus } from "@/lib/constants";
import { formatCurrency, formatDuration } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Booking confirmed",
  robots: { index: false },
};

export default async function ConfirmationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const appointment = await getAppointmentConfirmation(id);
  if (!appointment) notFound();

  const start = new Date(appointment.start_time);

  return (
    <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col items-center gap-5 text-center">
        <span className="bg-olive-100 text-olive-700 flex size-16 items-center justify-center rounded-full">
          <CheckCircle2 className="size-8" aria-hidden />
        </span>
        <h1 className="font-serif text-3xl font-medium">Your booking is in</h1>
        <p className="text-muted-foreground max-w-md">
          {appointment.contact_email
            ? `We have sent a confirmation to ${appointment.contact_email}. `
            : ""}
          Our team will confirm your appointment shortly. Bookmark this page — it&apos;s
          how you&apos;ll manage this booking later.
        </p>
        <Badge>{STATUS_LABELS[appointment.status as AppointmentStatus]}</Badge>
      </div>

      <Card className="mt-10 flex flex-col gap-4 p-7">
        <dl className="flex flex-col gap-3.5 text-sm">
          <Row label="Treatment" value={appointment.service_name} />
          <Row
            label="Duration"
            value={
              appointment.service_duration_minutes != null
                ? formatDuration(appointment.service_duration_minutes)
                : "—"
            }
          />
          <Row label="Therapist" value={appointment.staff_full_name} />
          <Row label="Date" value={format(start, "EEEE d MMMM yyyy")} />
          <Row label="Time" value={format(start, "h:mm a")} />
          <Row label="Reference" value={appointment.id.slice(0, 8).toUpperCase()} />
          <Separator />
          <div className="flex items-center justify-between">
            <dt className="font-medium">Total</dt>
            <dd className="font-serif text-2xl font-medium">
              {appointment.price != null ? formatCurrency(appointment.price) : "—"}
            </dd>
          </div>
        </dl>
      </Card>

      <div className="mt-6">
        <ManageBookingActions appointment={appointment} />
      </div>

      <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
        <Button asChild size="lg" variant="outline">
          <Link href="/services">
            <Sparkles />
            Browse more treatments
          </Link>
        </Button>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-6">
      <dt className="text-muted-foreground shrink-0">{label}</dt>
      <dd className="text-right font-medium">{value}</dd>
    </div>
  );
}
