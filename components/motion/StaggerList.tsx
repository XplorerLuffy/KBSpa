"use client";

import { useEffect, useRef, type HTMLAttributes } from "react";
import { gsap } from "@/lib/gsap";

/**
 * Scroll-reveal grid whose children animate in on a stagger, via GSAP +
 * ScrollTrigger rather than Framer Motion's `whileInView`.
 *
 * The effect re-runs whenever `children` changes. `ScrollTrigger`'s `once`
 * option is a one-shot gesture tied to *this* effect run: swapping in a
 * filtered set of children (services/gallery grid) without the component
 * unmounting needs a fresh tween over the new DOM nodes, or the new results
 * would render but stay invisible — the same failure mode the previous
 * `whileInView`-based version had.
 */
export function StaggerList({ className, children, ...props }: HTMLAttributes<HTMLDivElement>) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const items = Array.from(element.children);
    if (items.length === 0) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      gsap.set(items, { opacity: 1, y: 0, scale: 1 });
      return;
    }

    gsap.set(items, { opacity: 0, y: 40, scale: 0.94 });

    const tween = gsap.to(items, {
      opacity: 1,
      y: 0,
      scale: 1,
      duration: 0.6,
      ease: "power3.out",
      stagger: 0.1,
      scrollTrigger: { trigger: element, start: "top 90%", once: true },
    });

    return () => {
      tween.scrollTrigger?.kill();
      tween.kill();
    };
  }, [children]);

  return (
    <div ref={ref} className={className} {...props}>
      {children}
    </div>
  );
}

export function StaggerItem({ className, children, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={className} {...props}>
      {children}
    </div>
  );
}
