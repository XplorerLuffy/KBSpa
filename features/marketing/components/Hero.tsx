"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { ChevronDown, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useGsapParallax } from "@/hooks/useGsapParallax";

export function Hero({
  headline,
  subtitle,
  imageUrl,
  videoUrl,
}: {
  headline: string;
  subtitle: string;
  imageUrl: string;
  videoUrl?: string;
}) {
  const backdropRef = useRef<HTMLDivElement>(null);
  useGsapParallax(backdropRef);

  // Skip the video entirely for prefers-reduced-motion — the still image stays as the backdrop.
  const [allowVideo, setAllowVideo] = useState(false);
  useEffect(() => {
    setAllowVideo(!window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }, []);

  return (
    <section className="relative flex min-h-[100svh] items-center justify-center overflow-hidden">
      <div
        ref={backdropRef}
        aria-hidden
        className="absolute inset-0 -top-[10%] h-[120%] bg-cover bg-center will-change-transform"
        style={{ backgroundImage: `url(${imageUrl})` }}
      >
        {videoUrl && allowVideo && (
          <video
            aria-hidden
            autoPlay
            muted
            loop
            playsInline
            poster={imageUrl}
            className="h-full w-full object-cover"
          >
            <source src={videoUrl} type="video/mp4" />
          </video>
        )}
      </div>
      <div
        aria-hidden
        className="from-charcoal-900/85 via-charcoal-900/45 to-charcoal-900/80 absolute inset-0 bg-gradient-to-b"
      />

      <div className="relative mx-auto flex max-w-4xl flex-col items-center gap-8 px-4 py-32 text-center sm:px-6">
        <motion.span
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="glass text-gold-100 inline-flex items-center gap-2 rounded-full border border-white/25 px-5 py-2 text-xs font-medium tracking-[0.24em] uppercase"
        >
          <Sparkles className="size-3.5" aria-hidden />
          Since 2020
        </motion.span>

        <motion.h1
          initial={{ opacity: 0, y: 26 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.85, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          className="font-serif text-4xl leading-[1.08] font-medium text-balance text-white sm:text-6xl lg:text-7xl"
        >
          {headline}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.24, ease: [0.22, 1, 0.36, 1] }}
          className="text-cream-200/85 max-w-xl text-base leading-relaxed text-pretty sm:text-lg"
        >
          {subtitle}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.38, ease: [0.22, 1, 0.36, 1] }}
          className="flex flex-col gap-3 sm:flex-row"
        >
          <Button asChild size="lg">
            <Link href="/booking">Book Appointment</Link>
          </Button>
          <Button asChild size="lg" variant="glass">
            <Link href="/services">View Services</Link>
          </Button>
        </motion.div>
      </div>

      <motion.a
        href="#featured"
        aria-label="Scroll to services"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.1, duration: 0.6 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 rounded-full p-2 text-white/70 transition-colors hover:text-white"
      >
        <motion.span
          animate={{ y: [0, 7, 0] }}
          transition={{ repeat: Infinity, duration: 2.2, ease: "easeInOut" }}
          className="block"
        >
          <ChevronDown className="size-6" />
        </motion.span>
      </motion.a>
    </section>
  );
}
