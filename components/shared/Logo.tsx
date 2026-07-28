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
 * Swap point for the brand mark: replace /public/logo.svg to change it everywhere.
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
        src="/logo.svg"
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
