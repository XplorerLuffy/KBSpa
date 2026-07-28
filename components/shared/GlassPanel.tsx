import * as React from "react";
import { cn } from "@/lib/utils";

export function GlassPanel({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "glass rounded-3xl border border-white/45 shadow-soft dark:border-white/10",
        className,
      )}
      {...props}
    />
  );
}
