import Link from "next/link";
import {
  ArrowRight,
  CalendarCheck,
  Droplets,
  Flower2,
  Footprints,
  Gem,
  Gift,
  HandHeart,
  HeartHandshake,
  Leaf,
  Palette,
  Scissors,
  ShieldCheck,
  Sparkles,
  type LucideIcon,
} from "lucide-react";
import { Hero } from "@/features/marketing/components/Hero";
import { TrustStats } from "@/features/marketing/components/TrustStats";
import { ServiceCard } from "@/features/services/components/ServiceCard";
import { TestimonialCarousel } from "@/features/testimonials/components/TestimonialCarousel";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { GlassPanel } from "@/components/shared/GlassPanel";
import { FadeIn } from "@/components/motion/FadeIn";
import { StaggerItem, StaggerList } from "@/components/motion/StaggerList";
import { Button } from "@/components/ui/button";
import type {
  Category,
  ServiceWithCategory,
  SiteSettings,
  TestimonialWithService,
} from "@/types/domain";

const CATEGORY_ICONS: Record<string, LucideIcon> = {
  facial: Droplets,
  massage: HandHeart,
  hair: Scissors,
  "hair-coloring": Palette,
  "hair-treatment": Sparkles,
  "body-spa": Flower2,
  waxing: Sparkles,
  threading: Sparkles,
  "nail-care": Gem,
  pedicure: Footprints,
  manicure: HandHeart,
  "bridal-makeup": Gem,
  "package-deals": Gift,
};

const HOME_CATEGORY_LIMIT = 8;

const PILLARS = [
  {
    icon: Leaf,
    title: "Natural Products",
    body: "Gentle, skin-first formulations chosen for results without irritation.",
  },
  {
    icon: HeartHandshake,
    title: "Expert Therapists",
    body: "A small, senior team who take the time to understand what you actually need.",
  },
  {
    icon: ShieldCheck,
    title: "Hygiene First",
    body: "Single-use where it matters, sterilised tools, and rooms reset between guests.",
  },
  {
    icon: CalendarCheck,
    title: "Easy Booking",
    body: "See real availability and confirm your appointment in under a minute.",
  },
];

export function HomeView({
  settings,
  featured,
  categories,
  testimonials,
  stats,
}: {
  settings: SiteSettings;
  featured: ServiceWithCategory[];
  categories: Category[];
  testimonials: TestimonialWithService[];
  stats: {
    serviceCount: number;
    staffCount: number;
    averageRating: number | null;
    reviewCount: number;
  };
}) {
  const visibleCategories = categories.slice(0, HOME_CATEGORY_LIMIT);
  const hasMoreCategories = categories.length > HOME_CATEGORY_LIMIT;

  return (
    <>
      <Hero
        headline="Relax. Refresh. Rejuvenate."
        subtitle={
          settings.hero_subtitle ??
          "Premium beauty and wellness treatments tailored just for you."
        }
        imageUrl={settings.hero_image_url}
        videoUrl={settings.hero_video_url}
      />

      <TrustStats {...stats} />

      <section id="featured" className="container-page section scroll-mt-24">
        <SectionHeading
          eyebrow="Our Signature Treatments"
          title="Chosen most often, loved every time"
          description="A short list of the treatments our guests come back for."
        />

        <StaggerList className="mt-12 grid gap-6 sm:mt-16 sm:grid-cols-2 sm:gap-7 lg:grid-cols-3">
          {featured.map((service) => (
            <StaggerItem key={service.id}>
              <ServiceCard service={service} />
            </StaggerItem>
          ))}
        </StaggerList>

        <FadeIn className="mt-12 flex justify-center">
          <Button asChild variant="outline" size="lg">
            <Link href="/services">Explore all services</Link>
          </Button>
        </FadeIn>
      </section>

      <section className="bg-cream-300/60 dark:bg-charcoal-800/40 section">
        <div className="container-page">
          <SectionHeading
            eyebrow="Why Kuenphen"
            title="Care that feels considered, not rushed"
            description="We keep the day gently booked so every guest gets a full, unhurried appointment."
          />

          <StaggerList className="mt-12 grid gap-5 sm:mt-16 sm:grid-cols-2 sm:gap-6 lg:grid-cols-4">
            {PILLARS.map(({ icon: Icon, title, body }) => (
              <StaggerItem key={title}>
                <GlassPanel className="flex h-full flex-col gap-4 p-7">
                  <span className="bg-olive-100 text-olive-700 dark:bg-olive-900/40 dark:text-olive-200 flex size-12 items-center justify-center rounded-2xl">
                    <Icon className="size-5" aria-hidden />
                  </span>
                  <h3 className="font-serif text-lg font-medium">{title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{body}</p>
                </GlassPanel>
              </StaggerItem>
            ))}
          </StaggerList>
        </div>
      </section>

      <section className="container-page section">
        <SectionHeading
          eyebrow="Browse by Category"
          title="Find exactly what you came for"
        />

        <StaggerList className="mt-12 grid gap-4 sm:mt-16 sm:grid-cols-2 lg:grid-cols-4">
          {visibleCategories.map((category) => {
            const Icon = CATEGORY_ICONS[category.slug] ?? Sparkles;
            return (
              <StaggerItem key={category.id}>
                <Link
                  href={`/services?category=${category.slug}`}
                  className="border-border/70 bg-card hover:border-olive-300 hover:bg-olive-50/60 dark:hover:bg-olive-900/20 hover:shadow-soft group flex h-full flex-col gap-3 rounded-2xl border p-6 transition-all duration-300"
                >
                  <span className="bg-olive-100 text-olive-700 dark:bg-olive-900/40 dark:text-olive-200 flex size-11 items-center justify-center rounded-xl">
                    <Icon className="size-5" aria-hidden />
                  </span>
                  <h3 className="group-hover:text-olive-800 dark:group-hover:text-olive-200 font-serif text-lg font-medium transition-colors">
                    {category.name}
                  </h3>
                  {category.description && (
                    <p className="text-muted-foreground line-clamp-2 text-sm">
                      {category.description}
                    </p>
                  )}
                </Link>
              </StaggerItem>
            );
          })}
        </StaggerList>

        {hasMoreCategories && (
          <FadeIn className="mt-10 flex justify-center">
            <Button asChild variant="ghost">
              <Link href="/services" className="group">
                View all categories
                <ArrowRight
                  className="size-4 transition-transform group-hover:translate-x-0.5"
                  aria-hidden
                />
              </Link>
            </Button>
          </FadeIn>
        )}
      </section>

      {testimonials.length > 0 && (
        <section className="bg-olive-800 section text-white">
          <div className="container-page">
            <SectionHeading inverted eyebrow="Guest Stories" title="What our guests say" />
            <div className="mt-12 sm:mt-16">
              <TestimonialCarousel testimonials={testimonials} inverted />
            </div>
          </div>
        </section>
      )}

      <section className="container-page section max-w-5xl">
        <FadeIn>
          <GlassPanel className="from-olive-100 via-cream-100 to-cream-300 dark:from-charcoal-800 dark:via-charcoal-800 dark:to-charcoal-900 flex flex-col items-center gap-7 bg-gradient-to-br px-6 py-14 text-center sm:px-10 sm:py-20">
            <SectionHeading
              eyebrow="Ready when you are"
              title="Book your moment of calm"
              description="Pick a treatment, choose your therapist, and see live availability. Confirmation lands in your inbox straight away."
            />
            <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:gap-4">
              <Button asChild size="lg">
                <Link href="/booking">Book appointment</Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="/contact">Contact us</Link>
              </Button>
            </div>
          </GlassPanel>
        </FadeIn>
      </section>
    </>
  );
}
