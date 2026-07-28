import type { Metadata } from "next";
import Link from "next/link";
import {
  addDays,
  addMonths,
  endOfMonth,
  endOfWeek,
  format,
  parseISO,
  startOfDay,
  startOfMonth,
  startOfWeek,
} from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  DayView,
  MonthView,
  WeekView,
} from "@/features/admin/calendar/CalendarViews";
import { getAppointmentsInRange } from "@/services/appointments.service";
import { STATUS_LABELS, STATUS_STYLES, APPOINTMENT_STATUSES } from "@/lib/constants";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Calendar", robots: { index: false } };

type View = "day" | "week" | "month";

export default async function CalendarPage({
  searchParams,
}: {
  searchParams: Promise<{ view?: string; date?: string }>;
}) {
  const { view: viewParam, date: dateParam } = await searchParams;
  const view: View = (["day", "week", "month"] as const).includes(viewParam as View)
    ? (viewParam as View)
    : "week";

  const date = dateParam ? startOfDay(parseISO(dateParam)) : startOfDay(new Date());

  const { from, to, title, prev, next } = (() => {
    if (view === "day") {
      return {
        from: date,
        to: addDays(date, 1),
        title: format(date, "EEEE d MMMM yyyy"),
        prev: addDays(date, -1),
        next: addDays(date, 1),
      };
    }
    if (view === "month") {
      return {
        from: startOfWeek(startOfMonth(date)),
        to: addDays(endOfWeek(endOfMonth(date)), 1),
        title: format(date, "MMMM yyyy"),
        prev: addMonths(date, -1),
        next: addMonths(date, 1),
      };
    }
    return {
      from: startOfWeek(date),
      to: addDays(endOfWeek(date), 1),
      title: `${format(startOfWeek(date), "d MMM")} – ${format(endOfWeek(date), "d MMM yyyy")}`,
      prev: addDays(date, -7),
      next: addDays(date, 7),
    };
  })();

  const appointments = await getAppointmentsInRange(from, to);
  const href = (v: View, d: Date) =>
    `/admin/bookings/calendar?view=${v}&date=${format(d, "yyyy-MM-dd")}`;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl font-medium">Calendar</h1>
          <p className="text-muted-foreground mt-1 text-sm">{title}</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="bg-muted flex rounded-full p-1">
            {(["day", "week", "month"] as const).map((value) => (
              <Link
                key={value}
                href={href(value, date)}
                className={cn(
                  "rounded-full px-4 py-1.5 text-sm font-medium capitalize transition-colors",
                  view === value
                    ? "bg-card shadow-soft text-foreground"
                    : "text-muted-foreground",
                )}
              >
                {value}
              </Link>
            ))}
          </div>

          <Button asChild variant="outline" size="icon" aria-label="Previous">
            <Link href={href(view, prev)}>
              <ChevronLeft />
            </Link>
          </Button>
          <Button asChild variant="outline" size="sm">
            <Link href={href(view, new Date())}>Today</Link>
          </Button>
          <Button asChild variant="outline" size="icon" aria-label="Next">
            <Link href={href(view, next)}>
              <ChevronRight />
            </Link>
          </Button>
        </div>
      </div>

      <ul className="flex flex-wrap gap-3">
        {APPOINTMENT_STATUSES.map((status) => (
          <li key={status} className="flex items-center gap-1.5 text-xs">
            <span
              className={cn("size-3 rounded-full border", STATUS_STYLES[status])}
              aria-hidden
            />
            {STATUS_LABELS[status]}
          </li>
        ))}
      </ul>

      <Card className="overflow-hidden p-4 sm:p-6">
        {view === "day" && <DayView date={date} appointments={appointments} />}
        {view === "week" && <WeekView date={date} appointments={appointments} />}
        {view === "month" && <MonthView date={date} appointments={appointments} />}
      </Card>
    </div>
  );
}
