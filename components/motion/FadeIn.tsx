"use client";

import { useEffect, useRef, type HTMLAttributes } from "react";
import { gsap } from "@/lib/gsap";

type FadeInProps = HTMLAttributes<HTMLDivElement> & {
  delay?: number;
  direction?: "up" | "down" | "left" | "right" | "none";
  distance?: number;
};

const offsets = {
  up: { y: 1, x: 0 },
  down: { y: -1, x: 0 },
  left: { y: 0, x: 1 },
  right: { y: 0, x: -1 },
  none: { y: 0, x: 0 },
};

/**
 * Fades an element in as it scrolls into view, via a GSAP tween driven by
 * ScrollTrigger rather than Framer Motion's `whileInView`. The effect re-runs
 * whenever `children` changes so a filtered grid's fresh results still
 * animate in (a static dependency array would only fire once, ever).
 */
export function FadeIn({
  delay = 0,
  direction = "up",
  distance = 24,
  className,
  children,
  ...props
}: FadeInProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      gsap.set(element, { opacity: 1, x: 0, y: 0 });
      return;
    }

    const offset = offsets[direction];
    gsap.set(element, { opacity: 0, x: offset.x * distance, y: offset.y * distance });

    const tween = gsap.to(element, {
      opacity: 1,
      x: 0,
      y: 0,
      duration: 0.6,
      delay,
      ease: "power3.out",
      scrollTrigger: { trigger: element, start: "top 88%", once: true },
    });

    return () => {
      tween.scrollTrigger?.kill();
      tween.kill();
    };
  }, [children, direction, distance, delay]);

  return (
    <div ref={ref} className={className} {...props}>
      {children}
    </div>
  );
}
