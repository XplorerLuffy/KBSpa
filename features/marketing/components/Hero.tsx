"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { ChevronDown, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useGsapParallax } from "@/hooks/useGsapParallax";
import { cn } from "@/lib/utils";

const EASE = [0.22, 1, 0.36, 1] as const;

/**
 * Two treatments, chosen by whether the salon has supplied its own backdrop:
 *
 * - No backdrop (the default): a light, airy wash of cream and sage with dark
 *   text. Calmer than a photo, always legible, and nothing to download.
 * - Custom photo or video: the media fills the section behind a dark scrim, and
 *   the text flips to white so it stays readable over any image.
 *
 * The previous version always used the dark treatment, which over the bundled
 * artwork produced a muddy brown hero with grey-on-grey text.
 */
export function Hero({
  headline,
  subtitle,
  imageUrl,
  videoUrl,
}: {
  headline: string;
  subtitle: string;
  imageUrl?: string;
  videoUrl?: string;
}) {
  const backdropRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  useGsapParallax(backdropRef);

  const hasBackdrop = Boolean(imageUrl || videoUrl);

  // React doesn't reliably sync the `muted` *property* from the JSX attribute
  // (facebook/react#10389), and an unmuted video fails the browser's autoplay
  // policy and freezes on the poster frame — which looks identical to "no
  // video". Set it imperatively and start playback explicitly.
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = true;
    video.play().catch(() => {
      /* Autoplay may still be refused; the poster remains a fine backdrop. */
    });
  }, [videoUrl]);

  return (
    <section
      className={cn(
        "relative flex min-h-[100svh] items-center justify-center overflow-hidden",
        !hasBackdrop && "bg-cream-100",
      )}
    >
      {hasBackdrop ? (
        <>
          <div
            ref={backdropRef}
            aria-hidden
            className="absolute inset-0 -top-[10%] h-[120%] bg-cover bg-center will-change-transform"
            style={imageUrl ? { backgroundImage: `url(${imageUrl})` } : undefined}
          >
            {videoUrl && (
              <video
                ref={videoRef}
                aria-hidden
                autoPlay
                muted
                loop
                playsInline
                preload="auto"
                poster={imageUrl}
                className="motion-reduce:hidden h-full w-full object-cover"
              >
                <source src={videoUrl} type="video/mp4" />
              </video>
            )}
          </div>
          <div
            aria-hidden
            className="from-charcoal-900/70 via-charcoal-900/40 to-charcoal-900/80 absolute inset-0 bg-gradient-to-b"
          />
        </>
      ) : (
        /* Light wash: two very soft blooms plus a warm base. Pure CSS. */
        <div aria-hidden className="absolute inset-0">
          <div className="from-cream-50 via-cream-100 to-cream-300 absolute inset-0 bg-gradient-to-b" />
          <div className="bg-olive-200/40 absolute -top-40 -left-32 size-[42rem] rounded-full blur-[120px]" />
          <div className="bg-gold-200/30 absolute -right-40 -bottom-52 size-[38rem] rounded-full blur-[120px]" />
        </div>
      )}

      <div className="container-page relative flex max-w-3xl flex-col items-center gap-7 py-28 text-center sm:gap-8 sm:py-32">
        <motion.span
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: EASE }}
          className={cn(
            "inline-flex items-center gap-2.5 rounded-full border px-5 py-2 text-[0.6875rem] font-semibold tracking-[0.22em] uppercase",
            hasBackdrop
              ? "glass text-cream-100 border-white/25"
              : "border-olive-200 bg-white/70 text-olive-700",
          )}
        >
          <Sparkles className="text-gold-500 size-3.5" aria-hidden />
          Since 2020
        </motion.span>

        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.85, delay: 0.08, ease: EASE }}
          className={cn(
            "font-serif text-[2.5rem] leading-[1.08] font-medium text-balance sm:text-6xl lg:text-[4.25rem]",
            hasBackdrop ? "text-white" : "text-charcoal-900",
          )}
        >
          {headline}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: EASE }}
          className={cn(
            "max-w-lg text-[1.0625rem] leading-[1.75] text-pretty sm:text-lg",
            hasBackdrop ? "text-cream-200/85" : "text-charcoal-600",
          )}
        >
          {subtitle}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.32, ease: EASE }}
          className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:gap-4"
        >
          <Button asChild size="lg">
            <Link href="/booking">Book appointment</Link>
          </Button>
          <Button asChild size="lg" variant={hasBackdrop ? "glass" : "outline"}>
            <Link href="/services">View services</Link>
          </Button>
        </motion.div>
      </div>

      <motion.a
        href="#featured"
        aria-label="Scroll to services"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.1, duration: 0.6 }}
        className={cn(
          "absolute bottom-8 left-1/2 -translate-x-1/2 rounded-full p-2 transition-colors",
          hasBackdrop
            ? "text-white/70 hover:text-white"
            : "text-charcoal-400 hover:text-olive-700",
        )}
      >
        <motion.span
          animate={{ y: [0, 7, 0] }}
          transition={{ repeat: Infinity, duration: 2.4, ease: "easeInOut" }}
          className="block"
        >
          <ChevronDown className="size-6" />
        </motion.span>
      </motion.a>
    </section>
  );
}
