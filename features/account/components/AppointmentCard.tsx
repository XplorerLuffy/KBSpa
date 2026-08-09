"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { CalendarClock, Clock, Loader2, UserRound, X } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
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
import { RescheduleDialog } from "@/features/account/components/RescheduleDialog";
import { cancelAppointment } from "@/features/booking/actions";
import { STATUS_LABELS, STATUS_STYLES } from "@/lib/constants";
import { cn, formatCurrency, formatDuration } from "@/lib/utils";
import type { AppointmentWithRelations } from "@/types/domain";

export function AppointmentCard({
  appointment,
}: {
  appointment: AppointmentWithRelations;
}) {
  const router = useRouter();
  const [cancelling, setCancelling] = useState(false);

  const start = new Date(appointment.start_time);
  const isUpcoming = start > new Date();
  const canModify =
    isUpcoming && ["pending", "confirmed"].includes(appointment.status);

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

  return (
    <Card className="flex flex-col gap-5 p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex flex-col gap-1">
          <h3 className="font-serif text-lg font-medium">
            {appointment.service?.name ?? "Treatment"}
          </h3>
          <p className="text-muted-foreground inline-flex items-center gap-1.5 text-sm">
            <UserRound className="size-3.5" aria-hidden />
            {appointment.staff?.full_name ?? "Any therapist"}
          </p>
        </div>
        <Badge
          variant="outline"
          className={cn(STATUS_STYLES[appointment.status])}
        >
          {STATUS_LABELS[appointment.status]}
        </Badge>
      </div>

      <dl className="text-muted-foreground grid gap-3 text-sm sm:grid-cols-3">
        <div className="flex items-center gap-2">
          <CalendarClock className="size-4 shrink-0" aria-hidden />
          <span>{format(start, "EEE d MMM yyyy")}</span>
        </div>
        <div className="flex items-center gap-2">
          <Clock className="size-4 shrink-0" aria-hidden />
          <span>
            {format(start, "h:mm a")}
            {appointment.service?.duration_minutes != null &&
              ` · ${formatDuration(appointment.service.duration_minutes)}`}
          </span>
        </div>
        <div className="text-foreground font-medium sm:text-right">
          {appointment.price != null ? formatCurrency(appointment.price) : ""}
        </div>
      </dl>

      {appointment.notes && (
        <p className="bg-muted text-muted-foreground rounded-xl px-4 py-3 text-sm">
          {appointment.notes}
        </p>
      )}

      {canModify && (
        <div className="flex flex-wrap gap-2">
          <RescheduleDialog appointment={appointment} />

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
                  Your {appointment.service?.name} on{" "}
                  {format(start, "EEEE d MMMM 'at' h:mm a")} will be released. This
                  cannot be undone.
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
      )}
    </Card>
  );
}
