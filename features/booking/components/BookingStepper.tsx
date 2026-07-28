import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export const BOOKING_STEPS = [
  "Service",
  "Therapist",
  "Date",
  "Time",
  "Your details",
  "Review",
  "Done",
] as const;

export function BookingStepper({ current }: { current: number }) {
  return (
    <ol
      className="flex flex-wrap items-center justify-center gap-x-2 gap-y-3"
      aria-label="Booking progress"
    >
      {BOOKING_STEPS.map((label, index) => {
        const done = index < current;
        const active = index === current;

        return (
          <li key={label} className="flex items-center gap-2">
            <span
              aria-current={active ? "step" : undefined}
              className={cn(
                "flex size-8 shrink-0 items-center justify-center rounded-full border text-xs font-medium transition-colors",
                done && "border-olive-600 bg-olive-600 text-white",
                active && "border-gold-500 bg-gold-500 text-charcoal-900",
                !done && !active && "border-border text-muted-foreground bg-card",
              )}
            >
              {done ? <Check className="size-3.5" strokeWidth={3} /> : index + 1}
            </span>
            <span
              className={cn(
                "hidden text-xs font-medium sm:inline",
                active ? "text-foreground" : "text-muted-foreground",
              )}
            >
              {label}
            </span>
            {index < BOOKING_STEPS.length - 1 && (
              <span
                aria-hidden
                className={cn(
                  "hidden h-px w-6 lg:inline-block",
                  done ? "bg-olive-500" : "bg-border",
                )}
              />
            )}
          </li>
        );
      })}
    </ol>
  );
}
