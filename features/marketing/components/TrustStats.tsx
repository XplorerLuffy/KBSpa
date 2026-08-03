import { Star } from "lucide-react";
import { FadeIn } from "@/components/motion/FadeIn";

type Stat = {
  value: string;
  label: string;
  isRating?: boolean;
};

export function TrustStats({
  serviceCount,
  staffCount,
  averageRating,
  reviewCount,
}: {
  serviceCount: number;
  staffCount: number;
  averageRating: number | null;
  reviewCount: number;
}) {
  const stats: Stat[] = [
    { value: "Since 2020", label: "Serving Gelephu" },
    { value: `${serviceCount}+`, label: "Treatments" },
    { value: `${staffCount}`, label: "Expert therapists" },
  ];

  if (averageRating !== null) {
    stats.push({
      value: averageRating.toFixed(1),
      label: `Guest rating (${reviewCount})`,
      isRating: true,
    });
  }

  return (
    <section className="border-border/70 bg-cream-100 dark:bg-charcoal-900 border-y">
      <FadeIn className="container-page">
        <dl className="grid grid-cols-2 gap-x-6 gap-y-8 py-10 sm:py-12 lg:flex lg:flex-nowrap lg:gap-x-12 lg:divide-x lg:divide-border/70">
          {stats.map(({ value, label, isRating }) => (
            <div
              key={label}
              className="flex flex-1 flex-col items-center gap-1.5 px-2 text-center lg:px-6 lg:first:pl-0 lg:last:pr-0"
            >
              <dt className="sr-only">{label}</dt>
              <dd className="text-charcoal-900 dark:text-cream-100 flex items-center gap-1.5 font-serif text-2xl font-medium sm:text-3xl">
                {isRating && (
                  <Star className="text-gold-500 size-5 fill-current" aria-hidden />
                )}
                {value}
              </dd>
              <span className="text-muted-foreground text-xs font-medium tracking-[0.08em] whitespace-nowrap uppercase sm:text-[0.8125rem]">
                {label}
              </span>
            </div>
          ))}
        </dl>
      </FadeIn>
    </section>
  );
}
