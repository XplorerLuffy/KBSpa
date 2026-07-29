import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

type LogoProps = {
  /** When true the wordmark is rendered light, for use over the dark hero overlay. */
  inverted?: boolean;
  showWordmark?: boolean;
  className?: string;
  href?: string | null;
  size?: number;
};

/**
 * Swap point for the brand mark: replace the files in /public to change it
 * everywhere — `logo.svg` is the full lock-up (disc + arced wordmark) and
 * `icon-mark.svg` is the disc alone. Admins can also override the logo without
 * a deploy via Settings → Logo URL.
 */
export function Logo({
  inverted = false,
  showWordmark = true,
  className,
  href = "/",
  size = 44,
}: LogoProps) {
  const content = (
    <span className={cn("inline-flex items-center gap-3", className)}>
      <Image
        // Beside the HTML wordmark, use the disc-only mark: the full logo's
        // arced text would be both unreadable at this size and a duplicate of
        // the words sitting next to it.
        src={showWordmark ? "/icon-mark.svg" : "/logo.svg"}
        alt="Kuenphen Beauty Spa"
        width={size}
        height={size}
        priority
        className="shrink-0"
      />
      {showWordmark && (
        <span className="flex flex-col leading-none">
          <span
            className={cn(
              "font-serif text-base font-semibold tracking-wide sm:text-lg",
              inverted ? "text-white" : "text-charcoal-900 dark:text-cream-100",
            )}
          >
            Kuenphen
          </span>
          <span
            className={cn(
              "text-[0.62rem] font-medium tracking-[0.28em] uppercase",
              inverted ? "text-gold-200" : "text-gold-700 dark:text-gold-300",
            )}
          >
            Beauty Spa
          </span>
        </span>
      )}
    </span>
  );

  if (!href) return content;

  return (
    <Link href={href} aria-label="Kuenphen Beauty Spa — home" className="rounded-xl">
      {content}
    </Link>
  );
}
