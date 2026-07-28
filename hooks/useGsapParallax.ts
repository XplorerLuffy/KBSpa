"use client";

import { useEffect, type RefObject } from "react";
import gsap from "gsap";

/**
 * Hero-only parallax. GSAP is used here (rather than Framer Motion) because it
 * drives a raw scroll-linked transform without a React re-render per frame.
 */
export function useGsapParallax(
  ref: RefObject<HTMLElement | null>,
  strength = 0.28,
) {
  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const quickTo = gsap.quickTo(element, "y", { duration: 0.5, ease: "power2.out" });
    const onScroll = () => quickTo(window.scrollY * strength);

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      gsap.killTweensOf(element);
    };
  }, [ref, strength]);
}
