"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { addDays, format, startOfDay } from "date-fns";
import { CalendarClock, Loader2, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
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
import {
  cancelAppointment,
  getAvailableSlots,
  rescheduleAppointment,
  type AppointmentConfirmation,
} from "@/features/booking/actions";
import { cn } from "@/lib/utils";

/**
 * Cancel/reschedule for a guest booking — ownership is proven by having
 * reached this page at all (the appointment id is an unguessable UUID from
 * the confirmation link), not by an auth session.
 */
export function ManageBookingActions({
  appointment,
}: {
  appointment: AppointmentConfirmation;
}) {
  const router = useRouter();
  const [cancelling, setCancelling] = useState(false);
  const [rescheduleOpen, setRescheduleOpen] = useState(false);
  const [date, setDate] = useState(() => format(new Date(), "yyyy-MM-dd"));
  const [slots, setSlots] = useState<string[] | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const start = new Date(appointment.start_time);
  const isUpcoming = start > new Date();
  const canModify = isUpcoming && ["pending", "confirmed"].includes(appointment.status);

  const dates = useMemo(() => {
    const today = startOfDay(new Date());
    return Array.from({ length: 21 }, (_, index) => addDays(today, index));
  }, []);

  useEffect(() => {
    if (!rescheduleOpen) return;

    let cancelled = false;
    setSlots(null);
    setSelected(null);

    getAvailableSlots({
      staffId: appointment.staff_id,
      serviceId: appointment.service_id,
      date,
      excludeAppointmentId: appointment.id,
    }).then((result) => {
      if (!cancelled) setSlots(result.ok ? result.slots : []);
    });

    return () => {
      cancelled = true;
    };
  }, [rescheduleOpen, date, appointment]);

  const handleCancel = async () => {
    setCancelling(true);
    const result = await cancelAppointment(appointment.id);
    setCancelling(false);

    if (result.ok) {
      toast.success("Appointment cancelled");
      router.refresh();
    } else {
      toast.error(result.error);
    }
  };

  const handleReschedule = async () => {
    if (!selected) return;
    setSaving(true);
    const result = await rescheduleAppointment({
      appointmentId: appointment.id,
      slot: selected,
    });
    setSaving(false);

    if (result.ok) {
      toast.success("Appointment rescheduled");
      setRescheduleOpen(false);
      router.refresh();
    } else {
      toast.error(result.error);
      setSlots(null);
    }
  };

  if (!canModify) return null;

  return (
    <div className="flex flex-wrap justify-center gap-2">
      <Dialog open={rescheduleOpen} onOpenChange={setRescheduleOpen}>
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
              Pick a new date and time for your {appointment.service_name}.
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
                      "border-border hover:border-gold-400 flex shrink-0 cursor-pointer flex-col items-center rounded-xl border px-3.5 py-2.5 text-xs transition-colors",
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
                      "border-border hover:border-gold-400 cursor-pointer rounded-lg border py-2.5 text-sm transition-colors",
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
            <Button variant="ghost" onClick={() => setRescheduleOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleReschedule} disabled={!selected || saving}>
              {saving && <Loader2 className="animate-spin" />}
              Confirm new time
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button variant="ghost" size="sm">
            <X />
            Cancel
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel this appointment?</AlertDialogTitle>
            <AlertDialogDescription>
              Your {appointment.service_name} on{" "}
              {format(start, "EEEE d MMMM 'at' h:mm a")} will be released. This cannot
              be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep it</AlertDialogCancel>
            <AlertDialogAction onClick={handleCancel} disabled={cancelling}>
              {cancelling && <Loader2 className="animate-spin" />}
              Cancel appointment
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
