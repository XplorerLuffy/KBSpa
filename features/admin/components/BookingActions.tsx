"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check, MoreHorizontal, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { setAppointmentStatus } from "@/features/admin/actions";
import { APPOINTMENT_STATUSES, STATUS_LABELS, type AppointmentStatus } from "@/lib/constants";

export function BookingActions({
  id,
  status,
}: {
  id: string;
  status: AppointmentStatus;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const update = (next: AppointmentStatus) =>
    startTransition(async () => {
      const result = await setAppointmentStatus(id, next);
      if (result.ok) {
        toast.success(`Marked as ${STATUS_LABELS[next].toLowerCase()}`);
        router.refresh();
      } else {
        toast.error(result.error);
      }
    });

  return (
    <div className="flex items-center justify-end gap-1.5">
      {status === "pending" && (
        <>
          <Button size="sm" disabled={pending} onClick={() => update("confirmed")}>
            <Check />
            Approve
          </Button>
          <Button
            size="sm"
            variant="ghost"
            disabled={pending}
            onClick={() => update("rejected")}
          >
            <X />
            Reject
          </Button>
        </>
      )}

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" aria-label="More actions">
            <MoreHorizontal />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Set status</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {APPOINTMENT_STATUSES.filter((value) => value !== status).map((value) => (
            <DropdownMenuItem
              key={value}
              disabled={pending}
              onSelect={() => update(value)}
            >
              {STATUS_LABELS[value]}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
