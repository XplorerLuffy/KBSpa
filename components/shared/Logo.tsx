import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

type LogoProps = {
  /** True when the mark sits directly on a dark surface (not a light card) —
   * swaps in the light-stroke variant so the arced wordmark stays readable.
   * Only affects the bundled artwork; an admin-supplied `src` always wins. */
  inverted?: boolean;
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
 * The brand mark is one raster lock-up — the circular badge with the
 * "Kuenphen Beauty Spa" wordmark arced around it and "Since 2020" beneath.
 * `logo.png` has black strokes (for light surfaces); `logo-dark.png` is the
 * same artwork with those strokes recolored light (for dark surfaces) — both
 * generated from the same source so the hand illustration and yellow badge
 * stay identical, only the stroke color differs. Swap the files in /public
 * to change the art everywhere. Admins can also override it without a
 * deploy via Settings → Logo URL, which skips the light/dark swap entirely
 * since there's no way to know how an arbitrary uploaded image behaves on
 * a dark background.
 */
export function Logo({ inverted = false, className, href = "/", size = 56, src }: LogoProps) {
  const source = src?.trim() || (inverted ? "/logo-dark.png" : "/logo.png");
  // An admin can paste a URL on any host, which next/image would otherwise
  // reject unless that host is in remotePatterns. Skip optimisation for remote
  // sources so any URL just works.
  const isRemote = /^https?:\/\//i.test(source);

  const content = (
    <Image
      src={source}
      alt="Kuenphen Beauty Spa — Since 2020"
      width={size}
      height={size}
      priority
      unoptimized={isRemote}
      className={cn("h-auto w-auto shrink-0 object-contain", className)}
      style={{ maxHeight: size, maxWidth: size }}
    />
  );

  if (!href) return content;

  return (
    <Link href={href} aria-label="Kuenphen Beauty Spa — home" className="rounded-xl">
      {content}
    </Link>
  );
}
