"use client";

import { useEffect, type RefObject } from "react";
import { gsap } from "@/lib/gsap";

/**
 * Scroll-linked parallax, driven by ScrollTrigger's `scrub` rather than a raw
 * scroll listener — the tween's progress tracks the trigger section's own
 * position in the viewport instead of the page's absolute scroll offset, so
 * it stays correct regardless of what's above this section on the page.
 */
export function useGsapParallax(
  ref: RefObject<HTMLElement | null>,
  strength = 0.28,
) {
  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const trigger = element.closest("section") ?? element;

    const tween = gsap.fromTo(
      element,
      { y: 0 },
      {
        y: () => window.innerHeight * strength,
        ease: "none",
        scrollTrigger: { trigger, start: "top top", end: "bottom top", scrub: true },
      },
    );

    return () => {
      tween.scrollTrigger?.kill();
      tween.kill();
    };
  }, [ref, strength]);
}
