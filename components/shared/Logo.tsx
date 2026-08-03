import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

type LogoProps = {
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
 * "Kuenphen Beauty Spa" wordmark arced around it and "Since 2020" beneath —
 * so there's no separate HTML wordmark to color for light/dark surfaces; the
 * artwork itself has enough contrast (black outline, white hand fill) to
 * read on both. Swap `/public/logo.png` to change it everywhere. Admins can
 * also override it without a deploy via Settings → Logo URL.
 */
export function Logo({ className, href = "/", size = 56, src }: LogoProps) {
  const source = src?.trim() || "/logo.png";
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
