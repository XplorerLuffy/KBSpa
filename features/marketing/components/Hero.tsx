"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { MapPin, Play } from "lucide-react";
import { FacebookIcon, InstagramIcon } from "@/components/shared/BrandIcons";
import { Button } from "@/components/ui/button";
import { useGsapParallax } from "@/hooks/useGsapParallax";
import { cn } from "@/lib/utils";

const EASE = [0.22, 1, 0.36, 1] as const;

/**
 * The hero always renders the dark cinematic treatment (gradient overlay,
 * white text) regardless of whether the salon has uploaded its own photo or
 * video yet — a rich generated backdrop stands in until real photography is
 * added from Admin > Settings, so the page never looks unfinished or flips
 * visual identity once a real photo lands.
 */
export function Hero({
  headline,
  subtitle,
  imageUrl,
  videoUrl,
  instagramUrl,
  facebookUrl,
  mapUrl,
}: {
  headline: string;
  subtitle: string;
  imageUrl?: string;
  videoUrl?: string;
  instagramUrl?: string;
  facebookUrl?: string;
  mapUrl?: string;
}) {
  const backdropRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoPlaying, setVideoPlaying] = useState(false);
  useGsapParallax(backdropRef);

  const hasPhoto = Boolean(imageUrl || videoUrl);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = true;
    video.play().catch(() => {
      /* Autoplay may still be refused; the poster remains a fine backdrop. */
    });
  }, [videoUrl]);

  const socials = [
    instagramUrl && { href: instagramUrl, label: "Instagram", Icon: InstagramIcon },
    facebookUrl && { href: facebookUrl, label: "Facebook", Icon: FacebookIcon },
    mapUrl && { href: mapUrl, label: "Find us on the map", Icon: MapPin },
  ].filter(Boolean) as { href: string; label: string; Icon: typeof MapPin }[];

  return (
    <section className="relative flex min-h-[100svh] items-center overflow-hidden">
      <div
        ref={backdropRef}
        aria-hidden
        className="absolute inset-0 -top-[10%] h-[120%] bg-cover bg-center will-change-transform"
        style={imageUrl ? { backgroundImage: `url(${imageUrl})` } : undefined}
      >
        {!hasPhoto && (
          <div className="from-olive-900 via-charcoal-900 to-charcoal-900 absolute inset-0 bg-gradient-to-br">
            <div className="bg-olive-500/25 absolute -top-32 -left-24 size-[36rem] rounded-full blur-[130px]" />
            <div className="bg-olive-400/15 absolute -right-32 bottom-0 size-[30rem] rounded-full blur-[130px]" />
            <div
              aria-hidden
              className="absolute inset-0 opacity-[0.06] mix-blend-overlay"
              style={{
                backgroundImage:
                  "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
                backgroundSize: "28px 28px",
              }}
            />
          </div>
        )}
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
            onPlaying={() => setVideoPlaying(true)}
            className="motion-reduce:hidden h-full w-full object-cover"
          >
            <source src={videoUrl} type="video/mp4" />
          </video>
        )}
      </div>
      <div
        aria-hidden
        className={cn(
          "absolute inset-0 bg-gradient-to-b",
          hasPhoto
            ? "from-charcoal-900/75 via-charcoal-900/45 to-charcoal-900/85"
            : "from-transparent via-transparent to-charcoal-900/40",
        )}
      />
      <div
        aria-hidden
        className="from-charcoal-900/70 via-charcoal-900/10 absolute inset-0 bg-gradient-to-r to-transparent"
      />

      <div className="container-page relative flex w-full flex-col gap-10 py-32 sm:py-36 lg:flex-row lg:items-end lg:justify-between">
        <div className="flex max-w-2xl flex-col gap-6 sm:gap-7">
          <motion.span
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: EASE }}
            className="glass inline-flex w-fit items-center gap-2.5 rounded-full border border-white/25 px-5 py-2 text-[0.6875rem] font-semibold tracking-[0.24em] text-cream-100 uppercase"
          >
            Relax. Refresh. Rejuvenate.
          </motion.span>

          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.85, delay: 0.08, ease: EASE }}
            className="font-serif text-[2.5rem] leading-[1.1] font-medium text-balance text-white sm:text-6xl lg:text-[4rem]"
          >
            {headline}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: EASE }}
            className="text-cream-200/85 max-w-lg text-[1.0625rem] leading-[1.75] text-pretty sm:text-lg"
          >
            {subtitle}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.32, ease: EASE }}
            className="flex w-full flex-col gap-3 pt-2 sm:w-auto sm:flex-row sm:gap-4"
          >
            <Button asChild size="lg">
              <Link href="/booking">Book Appointment</Link>
            </Button>
            <Button asChild size="lg" variant="glass">
              <Link href="/services">Explore Services</Link>
            </Button>
          </motion.div>
        </div>

        {videoUrl && (
          <motion.button
            type="button"
            onClick={() => videoRef.current?.scrollIntoView({ behavior: "smooth", block: "center" })}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.4, ease: EASE }}
            className="group hidden shrink-0 items-center gap-4 self-end lg:flex"
          >
            <span className="glass motion-safe:group-hover:scale-105 flex size-16 items-center justify-center rounded-full border border-white/30 text-white transition-transform">
              <Play className="ml-0.5 size-5 fill-current" aria-hidden />
            </span>
            <span className="text-left text-white">
              <span className="block text-sm font-medium">Watch Video</span>
              <span className="text-cream-200/70 block text-xs">
                {videoPlaying ? "Playing" : "Discover our spa"}
              </span>
            </span>
          </motion.button>
        )}
      </div>

      {socials.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.6 }}
          className="absolute top-1/2 right-6 hidden -translate-y-1/2 flex-col items-center gap-4 sm:flex"
        >
          {socials.map(({ href, label, Icon }) => (
            <Link
              key={label}
              href={href}
              aria-label={label}
              target="_blank"
              rel="noreferrer"
              className="text-white/70 transition-colors hover:text-white"
            >
              <Icon className="size-4" aria-hidden />
            </Link>
          ))}
          <span aria-hidden className="h-10 w-px bg-white/25" />
        </motion.div>
      )}
    </section>
  );
}
