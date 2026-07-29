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
  /**
   * Overrides the bundled artwork — pass `settings.logo_url` so the salon can
   * swap its logo from Admin → Settings without a code change or deploy.
   */
  src?: string | null;
};

/**
 * Swap point for the brand mark: replace the files in /public to change it
 * everywhere — `logo.png` is the full lock-up (disc + arced wordmark) and
 * `icon-mark.png` is the disc alone. Admins can also override the logo without
 * a deploy via Settings → Logo URL.
 */
export function Logo({
  inverted = false,
  showWordmark = true,
  className,
  href = "/",
  size = 44,
  src,
}: LogoProps) {
  // Beside the HTML wordmark, the bundled fallback is the disc-only mark: the
  // full logo's arced text would be unreadable at this size and a duplicate of
  // the words sitting next to it. An admin-supplied logo always wins.
  const source = src?.trim() || (showWordmark ? "/icon-mark.png" : "/logo.png");
  // An admin can paste a URL on any host, which next/image would otherwise
  // reject unless that host is in remotePatterns. Skip optimisation for remote
  // sources so any URL just works.
  const isRemote = /^https?:\/\//i.test(source);

  const content = (
    <span className={cn("inline-flex items-center gap-3", className)}>
      <Image
        src={source}
        alt="Kuenphen Beauty Spa"
        width={size}
        height={size}
        priority
        unoptimized={isRemote}
        className="h-auto w-auto shrink-0 object-contain"
        style={{ maxHeight: size, maxWidth: size }}
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
