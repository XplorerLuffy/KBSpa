"use client";

import { useRef } from "react";
import {
  motion,
  useInView,
  useReducedMotion,
  type HTMLMotionProps,
} from "framer-motion";

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};

const item = {
  hidden: { opacity: 0, y: 22 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] as const },
  },
};

/**
 * Scroll-reveal grid whose children animate in on a stagger.
 *
 * Deliberately driven by `useInView` + a declarative `animate`, *not* by
 * `whileInView`. `whileInView` is a one-shot gesture: with `once: true` it
 * fires, detaches its observer, and never speaks to the subtree again. That
 * breaks any list whose contents change without the component unmounting —
 * filtering the services or gallery grid swaps in fresh children that mount
 * into the parent's `initial="hidden"` (opacity 0) and are never told to show,
 * so the results render but stay invisible.
 *
 * `animate` is a prop, so React re-applies it on every render and newly mounted
 * children animate from `hidden` to the parent's current variant.
 */
export function StaggerList({ children, ...props }: HTMLMotionProps<"div">) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const reduceMotion = useReducedMotion();

  // Never gate visibility on an animation the user has asked us not to run.
  const state = reduceMotion || inView ? "show" : "hidden";

  return (
    <motion.div
      ref={ref}
      variants={container}
      initial="hidden"
      animate={state}
      {...props}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({ children, ...props }: HTMLMotionProps<"div">) {
  return (
    <motion.div variants={item} {...props}>
      {children}
    </motion.div>
  );
}
