import type { Metadata } from "next";
import Link from "next/link";
import { format } from "date-fns";
import { CalendarX } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { EmptyState } from "@/components/shared/EmptyState";
import { BookingActions } from "@/features/admin/components/BookingActions";
import { getAllAppointments } from "@/services/appointments.service";
import {
  APPOINTMENT_STATUSES,
  STATUS_LABELS,
  STATUS_STYLES,
} from "@/lib/constants";
import { cn, formatCurrency } from "@/lib/utils";

export const metadata: Metadata = { title: "Bookings", robots: { index: false } };

const PAGE_SIZE = 20;

export default async function AdminBookingsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; page?: string }>;
}) {
  const { status = "all", page: pageParam } = await searchParams;
  const page = Math.max(1, Number(pageParam) || 1);

  const { rows, count } = await getAllAppointments({
    status,
    page,
    pageSize: PAGE_SIZE,
  });
  const totalPages = Math.max(1, Math.ceil(count / PAGE_SIZE));

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-serif text-3xl font-medium">Bookings</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          {count} {count === 1 ? "booking" : "bookings"} total
        </p>
      </div>

      <nav aria-label="Filter by status" className="overflow-x-auto pb-1">
        <ul className="flex w-max gap-2">
          {["all", ...APPOINTMENT_STATUSES].map((value) => (
            <li key={value}>
              <Link
                href={value === "all" ? "/admin/bookings" : `/admin/bookings?status=${value}`}
                className={cn(
                  "inline-flex rounded-full border px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors",
                  status === value
                    ? "border-gold-500 bg-gold-500 text-charcoal-900"
                    : "border-border bg-card text-muted-foreground hover:border-gold-400",
                )}
              >
                {value === "all"
                  ? "All"
                  : STATUS_LABELS[value as keyof typeof STATUS_LABELS]}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <Card className="overflow-hidden">
        {rows.length === 0 ? (
          <EmptyState
            className="border-0"
            icon={CalendarX}
            title="No bookings here"
            description="Bookings matching this filter will appear here."
          />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>When</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Treatment</TableHead>
                <TableHead>Therapist</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((appointment) => (
                <TableRow key={appointment.id}>
                  <TableCell className="whitespace-nowrap">
                    <span className="block font-medium">
                      {format(new Date(appointment.start_time), "d MMM yyyy")}
                    </span>
                    <span className="text-muted-foreground text-xs">
                      {format(new Date(appointment.start_time), "h:mm a")}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="block">
                      {appointment.customer?.full_name ?? appointment.contact_name}
                    </span>
                    <span className="text-muted-foreground text-xs">
                      {appointment.contact_phone}
                    </span>
                  </TableCell>
                  <TableCell>{appointment.service?.name}</TableCell>
                  <TableCell>{appointment.staff?.full_name}</TableCell>
                  <TableCell className="whitespace-nowrap">
                    {appointment.price != null ? formatCurrency(appointment.price) : "—"}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={cn(STATUS_STYLES[appointment.status])}
                    >
                      {STATUS_LABELS[appointment.status]}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <BookingActions id={appointment.id} status={appointment.status} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>

      {totalPages > 1 && (
        <div className="flex items-center justify-between gap-4">
          <Button asChild variant="outline" size="sm" disabled={page <= 1}>
            <Link
              href={`/admin/bookings?status=${status}&page=${page - 1}`}
              aria-disabled={page <= 1}
            >
              Previous
            </Link>
          </Button>
          <span className="text-muted-foreground text-sm">
            Page {page} of {totalPages}
          </span>
          <Button asChild variant="outline" size="sm" disabled={page >= totalPages}>
            <Link href={`/admin/bookings?status=${status}&page=${page + 1}`}>Next</Link>
          </Button>
        </div>
      )}
    </div>
  );
}
