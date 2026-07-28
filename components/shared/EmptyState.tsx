import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "border-border/70 flex flex-col items-center gap-3 rounded-3xl border border-dashed px-6 py-16 text-center",
        className,
      )}
    >
      {Icon && (
        <span className="bg-cream-200 text-gold-700 flex size-12 items-center justify-center rounded-full">
          <Icon className="size-5" aria-hidden />
        </span>
      )}
      <h3 className="font-serif text-lg font-medium">{title}</h3>
      {description && (
        <p className="text-muted-foreground max-w-sm text-sm">{description}</p>
      )}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}
