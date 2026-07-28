import Link from "next/link";
import {
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  isToday,
  startOfMonth,
  startOfWeek,
} from "date-fns";
import { STATUS_LABELS, STATUS_STYLES } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { AppointmentWithRelations } from "@/types/domain";

const DAY_START_HOUR = 7;
const DAY_END_HOUR = 22;
const HOURS = Array.from(
  { length: DAY_END_HOUR - DAY_START_HOUR },
  (_, index) => DAY_START_HOUR + index,
);

function EventChip({
  appointment,
  compact = false,
}: {
  appointment: AppointmentWithRelations;
  compact?: boolean;
}) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-lg border px-2 py-1 text-left",
        STATUS_STYLES[appointment.status],
        compact ? "text-[0.65rem] leading-tight" : "text-xs",
      )}
      title={`${format(new Date(appointment.start_time), "h:mm a")} · ${appointment.service?.name} · ${STATUS_LABELS[appointment.status]}`}
    >
      <span className="block truncate font-medium">
        {format(new Date(appointment.start_time), "h:mm a")}{" "}
        {appointment.service?.name}
      </span>
      {!compact && (
        <span className="block truncate opacity-80">
          {appointment.customer?.full_name ?? appointment.contact_name} ·{" "}
          {appointment.staff?.full_name}
        </span>
      )}
    </div>
  );
}

/** Positions an appointment inside an hour-grid column. */
function positionStyle(appointment: AppointmentWithRelations) {
  const start = new Date(appointment.start_time);
  const end = new Date(appointment.end_time);
  const minutesFromTop =
    (start.getHours() - DAY_START_HOUR) * 60 + start.getMinutes();
  const durationMinutes = Math.max(
    30,
    (end.getTime() - start.getTime()) / 60000,
  );

  return {
    top: `${(minutesFromTop / 60) * 4}rem`,
    height: `${(durationMinutes / 60) * 4}rem`,
  };
}

export function DayView({
  date,
  appointments,
}: {
  date: Date;
  appointments: AppointmentWithRelations[];
}) {
  const dayAppointments = appointments.filter((item) =>
    isSameDay(new Date(item.start_time), date),
  );

  return (
    <div className="grid grid-cols-[4rem_1fr]">
      <div>
        {HOURS.map((hour) => (
          <div
            key={hour}
            className="text-muted-foreground border-border/60 h-16 border-t pr-2 text-right text-xs"
          >
            {format(new Date().setHours(hour, 0, 0, 0), "h a")}
          </div>
        ))}
      </div>

      <div className="relative">
        {HOURS.map((hour) => (
          <div key={hour} className="border-border/60 h-16 border-t" />
        ))}
        {dayAppointments.map((appointment) => (
          <div
            key={appointment.id}
            className="absolute inset-x-1"
            style={positionStyle(appointment)}
          >
            <EventChip appointment={appointment} />
          </div>
        ))}
      </div>
    </div>
  );
}

export function WeekView({
  date,
  appointments,
}: {
  date: Date;
  appointments: AppointmentWithRelations[];
}) {
  const days = eachDayOfInterval({
    start: startOfWeek(date),
    end: endOfWeek(date),
  });

  return (
    <div className="overflow-x-auto">
      <div className="min-w-3xl">
        <div className="grid grid-cols-[3.5rem_repeat(7,1fr)]">
          <div />
          {days.map((day) => (
            <div
              key={day.toISOString()}
              className={cn(
                "border-border/60 border-b px-2 pb-2 text-center",
                isToday(day) && "text-gold-700 dark:text-gold-300",
              )}
            >
              <p className="text-xs font-medium uppercase">{format(day, "EEE")}</p>
              <p className="font-serif text-lg font-medium">{format(day, "d")}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-[3.5rem_repeat(7,1fr)]">
          <div>
            {HOURS.map((hour) => (
              <div
                key={hour}
                className="text-muted-foreground border-border/60 h-16 border-t pr-2 text-right text-[0.65rem]"
              >
                {format(new Date().setHours(hour, 0, 0, 0), "h a")}
              </div>
            ))}
          </div>

          {days.map((day) => {
            const dayAppointments = appointments.filter((item) =>
              isSameDay(new Date(item.start_time), day),
            );

            return (
              <div key={day.toISOString()} className="border-border/60 relative border-l">
                {HOURS.map((hour) => (
                  <div key={hour} className="border-border/60 h-16 border-t" />
                ))}
                {dayAppointments.map((appointment) => (
                  <div
                    key={appointment.id}
                    className="absolute inset-x-0.5"
                    style={positionStyle(appointment)}
                  >
                    <EventChip appointment={appointment} compact />
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export function MonthView({
  date,
  appointments,
}: {
  date: Date;
  appointments: AppointmentWithRelations[];
}) {
  const days = eachDayOfInterval({
    start: startOfWeek(startOfMonth(date)),
    end: endOfWeek(endOfMonth(date)),
  });

  return (
    <div>
      <div className="text-muted-foreground grid grid-cols-7 border-b pb-2 text-center text-xs font-medium uppercase">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((label) => (
          <div key={label}>{label}</div>
        ))}
      </div>

      <div className="grid grid-cols-7">
        {days.map((day) => {
          const dayAppointments = appointments.filter((item) =>
            isSameDay(new Date(item.start_time), day),
          );

          return (
            <Link
              key={day.toISOString()}
              href={`/admin/bookings/calendar?view=day&date=${format(day, "yyyy-MM-dd")}`}
              className={cn(
                "border-border/60 hover:bg-accent/60 min-h-28 border-r border-b p-2 transition-colors",
                !isSameMonth(day, date) && "bg-muted/40 opacity-55",
              )}
            >
              <span
                className={cn(
                  "mb-1.5 inline-flex size-6 items-center justify-center rounded-full text-xs font-medium",
                  isToday(day) && "bg-gold-500 text-charcoal-900",
                )}
              >
                {format(day, "d")}
              </span>
              <div className="flex flex-col gap-1">
                {dayAppointments.slice(0, 3).map((appointment) => (
                  <EventChip key={appointment.id} appointment={appointment} compact />
                ))}
                {dayAppointments.length > 3 && (
                  <span className="text-muted-foreground text-[0.65rem]">
                    +{dayAppointments.length - 3} more
                  </span>
                )}
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
