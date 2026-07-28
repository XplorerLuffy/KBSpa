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
        "flex max-w-2xl flex-col gap-4",
        align === "center" ? "mx-auto items-center text-center" : "items-start text-left",
        className,
      )}
    >
      {eyebrow && (
        <span
          className={cn(
            "inline-flex items-center gap-2 text-xs font-medium tracking-[0.28em] uppercase",
            inverted ? "text-gold-200" : "text-gold-700 dark:text-gold-300",
          )}
        >
          <span className="bg-gold-500 h-px w-8" aria-hidden />
          {eyebrow}
        </span>
      )}
      <Heading
        className={cn(
          "font-serif text-3xl leading-[1.15] font-medium text-balance sm:text-4xl md:text-5xl",
          inverted ? "text-white" : "text-charcoal-900 dark:text-cream-100",
        )}
      >
        {title}
      </Heading>
      {description && (
        <p
          className={cn(
            "max-w-xl text-base leading-relaxed text-pretty",
            inverted ? "text-cream-200/90" : "text-muted-foreground",
          )}
        >
          {description}
        </p>
      )}
    </div>
  );
}
