"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, ZoomIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import type { GalleryItem } from "@/types/domain";

export function GalleryCarousel({ items }: { items: GalleryItem[] }) {
  const [index, setIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  // The filtered set changes size when the category filter changes — clamp
  // rather than let a stale index point past the end of a shorter list.
  useEffect(() => {
    setIndex(0);
  }, [items]);

  const go = (delta: number) =>
    setIndex((current) => (current + delta + items.length) % items.length);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "ArrowLeft") go(-1);
      if (event.key === "ArrowRight") go(1);
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items.length]);

  const active = items[index];
  if (!active) return null;

  return (
    <div className="mt-12 flex flex-col items-center gap-5">
      <div className="bg-cream-200 relative aspect-[4/3] w-full max-w-4xl overflow-hidden rounded-3xl sm:aspect-[16/9]">
        <AnimatePresence initial={false} mode="wait">
          <motion.div
            key={active.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="absolute inset-0"
          >
            <button
              type="button"
              onClick={() => setLightboxOpen(true)}
              aria-label="View full-size photo"
              className="group absolute inset-0 size-full cursor-zoom-in"
            >
              <Image
                src={active.image_url}
                alt={active.caption ?? ""}
                fill
                priority={index === 0}
                sizes="(max-width: 1024px) 100vw, 896px"
                className="object-cover"
              />
              <span className="bg-charcoal-900/0 group-hover:bg-charcoal-900/20 absolute inset-0 flex items-center justify-center transition-colors">
                <ZoomIn
                  className="size-8 text-white opacity-0 drop-shadow transition-opacity group-hover:opacity-100"
                  aria-hidden
                />
              </span>
            </button>
            {active.caption && (
              <div className="from-charcoal-900/80 pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t to-transparent px-6 py-5 text-sm text-white sm:text-base">
                {active.caption}
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {items.length > 1 && (
          <>
            <Button
              type="button"
              variant="glass"
              size="icon"
              aria-label="Previous photo"
              onClick={() => go(-1)}
              className="absolute top-1/2 left-3 -translate-y-1/2"
            >
              <ChevronLeft />
            </Button>
            <Button
              type="button"
              variant="glass"
              size="icon"
              aria-label="Next photo"
              onClick={() => go(1)}
              className="absolute top-1/2 right-3 -translate-y-1/2"
            >
              <ChevronRight />
            </Button>
            <div className="text-charcoal-900 absolute top-3 right-3 rounded-full bg-white/70 px-3 py-1 text-xs font-medium backdrop-blur-sm">
              {index + 1} / {items.length}
            </div>
          </>
        )}
      </div>

      {items.length > 1 && (
        <div className="flex max-w-4xl gap-3 overflow-x-auto px-1 py-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {items.map((item, itemIndex) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setIndex(itemIndex)}
              aria-label={`Show photo ${itemIndex + 1}`}
              aria-current={itemIndex === index}
              className={cn(
                "relative size-16 shrink-0 overflow-hidden rounded-xl border-2 transition-colors sm:size-20",
                itemIndex === index
                  ? "border-gold-500"
                  : "border-transparent opacity-70 hover:opacity-100",
              )}
            >
              <Image
                src={item.image_url}
                alt=""
                fill
                sizes="80px"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}

      <Dialog open={lightboxOpen} onOpenChange={setLightboxOpen}>
        <DialogContent className="flex w-[calc(100%-2rem)] max-w-5xl flex-col gap-3 border-0 bg-transparent p-0 text-white shadow-none [&_svg]:text-white">
          <DialogTitle className="sr-only">
            {active.caption || `Photo ${index + 1} of ${items.length}`}
          </DialogTitle>
          <div className="bg-charcoal-950 relative aspect-[4/3] w-full overflow-hidden rounded-2xl sm:aspect-video">
            <Image
              src={active.image_url}
              alt={active.caption ?? ""}
              fill
              sizes="90vw"
              className="object-contain"
            />

            {items.length > 1 && (
              <>
                <Button
                  type="button"
                  variant="glass"
                  size="icon"
                  aria-label="Previous photo"
                  onClick={() => go(-1)}
                  className="absolute top-1/2 left-3 -translate-y-1/2"
                >
                  <ChevronLeft />
                </Button>
                <Button
                  type="button"
                  variant="glass"
                  size="icon"
                  aria-label="Next photo"
                  onClick={() => go(1)}
                  className="absolute top-1/2 right-3 -translate-y-1/2"
                >
                  <ChevronRight />
                </Button>
              </>
            )}
          </div>
          {(active.caption || items.length > 1) && (
            <div className="flex items-center justify-between px-1 text-sm text-white/80">
              <span>{active.caption}</span>
              {items.length > 1 && (
                <span>
                  {index + 1} / {items.length}
                </span>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
