"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Quote } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { StarRating } from "@/components/shared/StarRating";
import { cn, initials } from "@/lib/utils";
import type { TestimonialWithService } from "@/types/domain";

export function TestimonialCarousel({
  testimonials,
  inverted = false,
}: {
  testimonials: TestimonialWithService[];
  inverted?: boolean;
}) {
  const [index, setIndex] = useState(0);
  const active = testimonials[index];

  if (!active) return null;

  const go = (delta: number) =>
    setIndex((current) => (current + delta + testimonials.length) % testimonials.length);

  return (
    <div className="flex flex-col items-center gap-8">
      <div className="relative min-h-64 w-full max-w-3xl">
        <AnimatePresence mode="wait">
          <motion.blockquote
            key={active.id}
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -18 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            className={cn(
              "flex flex-col items-center gap-6 rounded-3xl px-6 py-10 text-center sm:px-12",
              inverted ? "bg-white/8" : "bg-card border-border/70 border shadow-soft",
            )}
          >
            <Quote
              className={cn("size-8", inverted ? "text-gold-300" : "text-gold-500")}
              aria-hidden
            />
            <StarRating rating={active.rating} size={18} />
            <p
              className={cn(
                "font-serif text-lg leading-relaxed text-balance sm:text-xl",
                inverted ? "text-cream-100" : "text-charcoal-800 dark:text-cream-100",
              )}
            >
              “{active.quote}”
            </p>
            <footer className="flex items-center gap-3">
              <Avatar className="size-11">
                {active.avatar_url && (
                  <AvatarImage src={active.avatar_url} alt="" />
                )}
                <AvatarFallback>{initials(active.customer_name)}</AvatarFallback>
              </Avatar>
              <div className="text-left">
                <p className={cn("text-sm font-medium", inverted && "text-white")}>
                  {active.customer_name}
                </p>
                {active.service && (
                  <p
                    className={cn(
                      "text-xs",
                      inverted ? "text-cream-200/70" : "text-muted-foreground",
                    )}
                  >
                    {active.service.name}
                  </p>
                )}
              </div>
            </footer>
          </motion.blockquote>
        </AnimatePresence>
      </div>

      {testimonials.length > 1 && (
        <div className="flex items-center gap-3">
          <Button
            variant={inverted ? "glass" : "outline"}
            size="icon"
            onClick={() => go(-1)}
            aria-label="Previous testimonial"
          >
            <ChevronLeft />
          </Button>
          <div className="flex gap-2" role="tablist" aria-label="Testimonials">
            {testimonials.map((item, i) => (
              <button
                key={item.id}
                type="button"
                role="tab"
                aria-selected={i === index}
                aria-label={`Testimonial ${i + 1}`}
                onClick={() => setIndex(i)}
                className={cn(
                  "h-2 rounded-full transition-all",
                  i === index
                    ? "bg-gold-500 w-7"
                    : inverted
                      ? "w-2 bg-white/35"
                      : "bg-beige-300 w-2",
                )}
              />
            ))}
          </div>
          <Button
            variant={inverted ? "glass" : "outline"}
            size="icon"
            onClick={() => go(1)}
            aria-label="Next testimonial"
          >
            <ChevronRight />
          </Button>
        </div>
      )}
    </div>
  );
}
