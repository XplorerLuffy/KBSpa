import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// Registered once, browser-gated so the module stays import-safe during SSR.
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);

  // ScrollTrigger measures trigger positions when each one is created, which
  // can happen before real photos (uploaded via Admin > Settings, on a slower
  // connection than dev/local) finish loading and shift the page's layout —
  // every trigger below that point would then fire at the wrong scroll
  // offset. Re-measuring once everything (including images) has settled
  // keeps every trigger's numbers honest.
  window.addEventListener("load", () => ScrollTrigger.refresh());
}

export { gsap, ScrollTrigger };
