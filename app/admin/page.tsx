import type { Metadata } from "next";
import Link from "next/link";
import { format } from "date-fns";
import { CalendarClock, CalendarDays, Coins, TrendingUp, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/shared/EmptyState";
import { getDashboardMetrics } from "@/services/admin/dashboard.service";
import { STATUS_LABELS, STATUS_STYLES } from "@/lib/constants";
import { cn, formatCurrency } from "@/lib/utils";

export const metadata: Metadata = { title: "Dashboard", robots: { index: false } };

export default async function AdminDashboardPage() {
  const metrics = await getDashboardMetrics();

  const cards = [
    {
      label: "Today's appointments",
      value: metrics.todayCount,
      icon: CalendarClock,
    },
    { label: "Bookings this month", value: metrics.monthBookings, icon: CalendarDays },
    {
      label: "Revenue this month",
      value: formatCurrency(metrics.monthRevenue),
      icon: Coins,
    },
    { label: "Customers", value: metrics.customerCount, icon: Users },
  ];

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl font-medium">Dashboard</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            {format(new Date(), "EEEE d MMMM yyyy")}
          </p>
        </div>
        {metrics.pendingCount > 0 && (
          <Button asChild>
            <Link href="/admin/bookings?status=pending">
              {metrics.pendingCount} pending to review
            </Link>
          </Button>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map(({ label, value, icon: Icon }) => (
          <Card key={label} className="flex items-center gap-4 p-6">
            <span className="bg-gold-100 text-gold-700 flex size-11 shrink-0 items-center justify-center rounded-2xl">
              <Icon className="size-5" aria-hidden />
            </span>
            <div className="min-w-0">
              <p className="truncate font-serif text-2xl font-medium">{value}</p>
              <p className="text-muted-foreground text-xs">{label}</p>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        <Card className="p-6">
          <div className="mb-5 flex items-center justify-between gap-4">
            <h2 className="font-serif text-xl font-medium">Today&rsquo;s schedule</h2>
            <Button asChild variant="outline" size="sm">
              <Link href="/admin/bookings/calendar">Open calendar</Link>
            </Button>
          </div>

          {metrics.todaysAppointments.length === 0 ? (
            <EmptyState
              icon={CalendarDays}
              title="Nothing booked today"
              description="Bookings made for today will appear here."
            />
          ) : (
            <ul className="flex flex-col gap-3">
              {metrics.todaysAppointments.map((appointment) => (
                <li
                  key={appointment.id}
                  className="border-border/70 flex flex-wrap items-center justify-between gap-3 rounded-2xl border px-4 py-3"
                >
                  <div className="flex items-center gap-4">
                    <span className="font-serif text-lg font-medium">
                      {format(new Date(appointment.start_time), "h:mm a")}
                    </span>
                    <div>
                      <p className="text-sm font-medium">
                        {appointment.service?.name}
                      </p>
                      <p className="text-muted-foreground text-xs">
                        {appointment.customer?.full_name ?? appointment.contact_name} ·{" "}
                        {appointment.staff?.full_name}
                      </p>
                    </div>
                  </div>
                  <Badge variant="outline" className={cn(STATUS_STYLES[appointment.status])}>
                    {STATUS_LABELS[appointment.status]}
                  </Badge>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card className="p-6">
          <h2 className="mb-5 flex items-center gap-2 font-serif text-xl font-medium">
            <TrendingUp className="text-gold-600 size-5" aria-hidden />
            Popular this month
          </h2>

          {metrics.popularServices.length === 0 ? (
            <p className="text-muted-foreground text-sm">No bookings yet this month.</p>
          ) : (
            <ul className="flex flex-col gap-4">
              {metrics.popularServices.map((service) => {
                const max = metrics.popularServices[0].count;
                return (
                  <li key={service.name} className="flex flex-col gap-1.5">
                    <div className="flex justify-between gap-3 text-sm">
                      <span className="truncate">{service.name}</span>
                      <span className="text-muted-foreground shrink-0">
                        {service.count}
                      </span>
                    </div>
                    <div className="bg-muted h-2 overflow-hidden rounded-full">
                      <div
                        className="bg-gold-500 h-full rounded-full"
                        style={{ width: `${(service.count / max) * 100}%` }}
                      />
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </Card>
      </div>
    </div>
  );
}
