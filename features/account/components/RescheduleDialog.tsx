"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { addDays, format, startOfDay } from "date-fns";
import { CalendarClock, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { getAvailableSlots, rescheduleAppointment } from "@/features/booking/actions";
import { cn } from "@/lib/utils";
import type { AppointmentWithRelations } from "@/types/domain";

export function RescheduleDialog({
  appointment,
}: {
  appointment: AppointmentWithRelations;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [date, setDate] = useState(() => format(new Date(), "yyyy-MM-dd"));
  const [slots, setSlots] = useState<string[] | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const dates = useMemo(() => {
    const today = startOfDay(new Date());
    return Array.from({ length: 21 }, (_, index) => addDays(today, index));
  }, []);

  useEffect(() => {
    if (!open || !appointment.service || !appointment.staff) return;

    let cancelled = false;
    setSlots(null);
    setSelected(null);

    getAvailableSlots({
      staffId: appointment.staff.id,
      serviceId: appointment.service.id,
      date,
      excludeAppointmentId: appointment.id,
    }).then((result) => {
      if (!cancelled) setSlots(result.ok ? result.slots : []);
    });

    return () => {
      cancelled = true;
    };
  }, [open, date, appointment]);

  const handleSave = async () => {
    if (!selected) return;
    setSaving(true);
    const result = await rescheduleAppointment({
      appointmentId: appointment.id,
      slot: selected,
    });
    setSaving(false);

    if (result.ok) {
      toast.success("Appointment rescheduled");
      setOpen(false);
      router.refresh();
    } else {
      toast.error(result.error);
      setSlots(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <CalendarClock />
          Reschedule
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Reschedule appointment</DialogTitle>
          <DialogDescription>
            Pick a new date and time for your {appointment.service?.name}.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-5">
          <div className="flex gap-2 overflow-x-auto pb-2">
            {dates.map((day) => {
              const value = format(day, "yyyy-MM-dd");
              return (
                <button
                  key={value}
                  type="button"
                  onClick={() => setDate(value)}
                  className={cn(
                    "border-border flex shrink-0 flex-col items-center rounded-xl border px-3.5 py-2.5 text-xs",
                    date === value && "border-gold-500 bg-gold-500 text-charcoal-900",
                  )}
                >
                  <span className="uppercase opacity-70">{format(day, "EEE")}</span>
                  <span className="font-serif text-base font-medium">
                    {format(day, "d")}
                  </span>
                </button>
              );
            })}
          </div>

          {slots === null ? (
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
              {Array.from({ length: 8 }, (_, index) => (
                <Skeleton key={index} className="h-10" />
              ))}
            </div>
          ) : slots.length === 0 ? (
            <p className="text-muted-foreground py-6 text-center text-sm">
              No times available on this day.
            </p>
          ) : (
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
              {slots.map((slot) => (
                <button
                  key={slot}
                  type="button"
                  onClick={() => setSelected(slot)}
                  className={cn(
                    "border-border rounded-lg border py-2.5 text-sm",
                    selected === slot && "border-gold-500 bg-gold-500 text-charcoal-900",
                  )}
                >
                  {format(new Date(slot), "h:mm a")}
                </button>
              ))}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!selected || saving}>
            {saving && <Loader2 className="animate-spin" />}
            Confirm new time
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
