import { cn } from "@/lib/utils";

type SectionHeadingProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
  inverted?: boolean;
  className?: string;
  as?: "h1" | "h2";
};

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "center",
  inverted = false,
  className,
  as: Heading = "h2",
}: SectionHeadingProps) {
  return (
    <div
      className={cn(
        "flex max-w-2xl flex-col gap-4 sm:gap-5",
        align === "center" ? "mx-auto items-center text-center" : "items-start text-left",
        className,
      )}
    >
      {eyebrow && (
        <span
          className={cn(
            "inline-flex items-center gap-3 text-[0.6875rem] font-semibold tracking-[0.22em] uppercase",
            inverted ? "text-olive-200" : "text-olive-600 dark:text-olive-300",
          )}
        >
          <span
            className={cn("h-px w-7", inverted ? "bg-olive-200/70" : "bg-olive-400/70")}
            aria-hidden
          />
          {eyebrow}
        </span>
      )}
      <Heading
        className={cn(
          "font-serif text-[1.75rem] leading-[1.2] font-medium text-balance sm:text-[2.25rem] md:text-[2.75rem]",
          inverted ? "text-white" : "text-charcoal-900 dark:text-cream-100",
        )}
      >
        {title}
      </Heading>
      {description && (
        <p
          className={cn(
            "max-w-xl text-[0.975rem] leading-[1.75] text-pretty sm:text-base",
            inverted ? "text-cream-200/85" : "text-muted-foreground",
          )}
        >
          {description}
        </p>
      )}
    </div>
  );
}
