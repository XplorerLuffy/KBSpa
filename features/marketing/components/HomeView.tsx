import { existsSync } from "node:fs";
import path from "node:path";
import Image from "next/image";
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
  Mountain,
  Palette,
  Phone,
  Scissors,
  Sparkles,
  type LucideIcon,
} from "lucide-react";
import { Hero } from "@/features/marketing/components/Hero";
import { TrustStats } from "@/features/marketing/components/TrustStats";
import { PromotionsBanner } from "@/features/marketing/components/PromotionsBanner";
import { ServiceCard } from "@/features/services/components/ServiceCard";
import { TestimonialCarousel } from "@/features/testimonials/components/TestimonialCarousel";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { FadeIn } from "@/components/motion/FadeIn";
import { StaggerItem, StaggerList } from "@/components/motion/StaggerList";
import { Button } from "@/components/ui/button";
import { WEEKDAYS } from "@/lib/constants";
import type {
  BusinessHour,
  Category,
  PromotionWithRelations,
  ServiceWithCategory,
  SiteSettings,
  TestimonialWithService,
} from "@/types/domain";

// Bundled fallback photography (public/marketing/*) used until the salon
// uploads its own via Admin > Settings — checked on disk so the page falls
// back to the decorative gradient treatment if the file hasn't landed yet.
const BUNDLED_HERO_IMAGE = "/marketing/hero-spa.jpg";
const BUNDLED_ABOUT_IMAGE = "/marketing/about-spa.jpg";

function bundledAssetExists(publicPath: string) {
  return existsSync(path.join(process.cwd(), "public", publicPath));
}

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
const FOUNDED_YEAR = 2020;
const MIN_YEARS_EXPERIENCE = 10;

const ABOUT_PILLARS = [
  { icon: Leaf, title: "Natural & Organic", body: "We use 100% natural and high-quality products." },
  { icon: HeartHandshake, title: "Expert Therapists", body: "Our certified therapists ensure a personalized and professional care." },
  { icon: Mountain, title: "Peaceful Environment", body: "Located in Gelephu, surrounded by nature and serenity." },
];

const EXPERIENCE_PILLARS = [
  { icon: Flower2, title: "Relax", body: "Unwind and release daily stress." },
  { icon: Droplets, title: "Refresh", body: "Revitalize your body and mind." },
  { icon: Leaf, title: "Rejuvenate", body: "Feel renewed with our expert care." },
  { icon: HeartHandshake, title: "Reconnect", body: "Find balance and inner harmony." },
];

function formatTime(value: string) {
  const [h, m] = value.split(":").map(Number);
  const period = h >= 12 ? "PM" : "AM";
  const hour = h % 12 === 0 ? 12 : h % 12;
  return `${hour}:${String(m).padStart(2, "0")} ${period}`;
}

/** A short, human "Open every day, 10am–8pm"-style summary, or the exception. */
function summarizeHours(hours: BusinessHour[]) {
  const open = hours.filter((h) => !h.is_closed);
  if (open.length === 0) return "Closed";
  const allSame = open.every(
    (h) => h.open_time === open[0].open_time && h.close_time === open[0].close_time,
  );
  const range = `${formatTime(open[0].open_time)} – ${formatTime(open[0].close_time)}`;
  if (allSame && open.length === 7) return `Open every day, ${range}`;
  if (allSame) return range;
  return `${WEEKDAYS[open[0].weekday]}: ${range}`;
}

export function HomeView({
  settings,
  featured,
  categories,
  testimonials,
  stats,
  hours,
  promotions,
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
  hours: BusinessHour[];
  promotions: PromotionWithRelations[];
}) {
  const visibleCategories = categories.slice(0, HOME_CATEGORY_LIMIT);
  const hasMoreCategories = categories.length > HOME_CATEGORY_LIMIT;
  const yearsExperience = Math.max(
    MIN_YEARS_EXPERIENCE,
    new Date().getFullYear() - FOUNDED_YEAR,
  );
  const heroImage =
    settings.hero_image_url ||
    (bundledAssetExists(BUNDLED_HERO_IMAGE) ? BUNDLED_HERO_IMAGE : undefined);
  const aboutImage =
    settings.about_image_url ||
    (bundledAssetExists(BUNDLED_ABOUT_IMAGE) ? BUNDLED_ABOUT_IMAGE : undefined);

  return (
    <>
      <Hero
        headline="Experience Luxury Wellness in the Heart of Gelephu, Bhutan."
        subtitle={
          settings.hero_subtitle ??
          "Kuenphen Beauty Spa is your sanctuary for relaxation, healing, and natural beauty."
        }
        imageUrl={heroImage}
        videoUrl={settings.hero_video_url}
        instagramUrl={settings.instagram_url}
        facebookUrl={settings.facebook_url}
        mapUrl={settings.map_embed_url}
      />

      <TrustStats {...stats} />

      <PromotionsBanner promotions={promotions} />

      {/* About */}
      <section className="section container-page">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <FadeIn className="flex flex-col gap-6">
            <SectionHeading
              align="left"
              eyebrow="About Kuenphen"
              title="Where Traditional Healing Meets Modern Luxury"
              description="Inspired by Bhutanese wellness traditions and infused with modern techniques, we offer a unique spa experience that nourishes your body, mind, and soul."
            />
            <div className="mt-2 grid grid-cols-3 gap-4 sm:gap-6">
              {ABOUT_PILLARS.map(({ icon: Icon, title, body }) => (
                <div key={title} className="flex flex-col gap-2">
                  <Icon className="text-olive-600 dark:text-olive-300 size-6" aria-hidden />
                  <h3 className="text-sm font-medium">{title}</h3>
                  <p className="text-muted-foreground text-xs leading-relaxed">{body}</p>
                </div>
              ))}
            </div>
          </FadeIn>

          <FadeIn className="relative mx-auto w-full max-w-sm lg:max-w-none">
            <div className="from-olive-200 via-cream-200 to-beige-200 relative aspect-[3/4] w-full overflow-hidden rounded-t-[9999px] rounded-b-[2rem] bg-gradient-to-br shadow-soft-lg">
              {aboutImage ? (
                <Image
                  src={aboutImage}
                  alt="Handmade herbal potli compresses used in Kuenphen Beauty Spa treatments"
                  fill
                  sizes="(max-width: 1024px) 90vw, 40vw"
                  className="object-cover"
                  priority={false}
                />
              ) : (
                <>
                  <div className="bg-olive-500/20 absolute -top-10 -left-10 size-52 rounded-full blur-3xl" />
                  <div className="bg-gold-300/25 absolute -right-8 bottom-10 size-40 rounded-full blur-3xl" />
                  <Flower2 className="text-olive-600/25 absolute inset-0 m-auto size-24" aria-hidden />
                </>
              )}
            </div>
            <div className="bg-olive-700 text-white shadow-soft-lg absolute -bottom-6 -right-2 flex flex-col items-center gap-1 rounded-2xl px-7 py-5 sm:right-4">
              <span className="font-serif text-3xl font-medium">{yearsExperience}+</span>
              <span className="text-[0.6875rem] font-medium tracking-[0.08em] whitespace-nowrap uppercase opacity-85">
                Years of Experience
              </span>
            </div>
          </FadeIn>
        </div>
      </section>

      <section id="featured" className="container-page section scroll-mt-24">
        <SectionHeading
          eyebrow="Our Services"
          title="Rejuvenate with Our Signature Treatments"
          description="From relaxing massages to revitalizing therapies, discover treatments designed just for you."
        />

        <StaggerList className="mt-12 grid gap-6 sm:mt-16 sm:grid-cols-2 sm:gap-7 lg:grid-cols-4">
          {featured.map((service) => (
            <StaggerItem key={service.id}>
              <ServiceCard service={service} />
            </StaggerItem>
          ))}
        </StaggerList>

        <FadeIn className="mt-12 flex justify-center">
          <Button asChild variant="outline" size="lg">
            <Link href="/services">
              View All Services
              <ArrowRight className="size-4" aria-hidden />
            </Link>
          </Button>
        </FadeIn>
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

      {/* Experience banner */}
      <section className="container-page">
        <FadeIn>
          <div className="bg-olive-900 relative overflow-hidden rounded-[2rem] px-6 py-14 text-white sm:px-10 sm:py-16 lg:px-16">
            <div className="bg-olive-500/20 absolute -top-24 -left-24 size-72 rounded-full blur-[100px]" aria-hidden />
            <div className="relative flex flex-col gap-10 lg:flex-row lg:items-center lg:justify-between">
              <div className="max-w-md">
                <span className="text-olive-200 mb-4 inline-flex items-center gap-3 text-[0.6875rem] font-semibold tracking-[0.22em] uppercase">
                  <span className="bg-olive-300/70 h-px w-7" aria-hidden />
                  Kuenphen Experience
                </span>
                <h2 className="font-serif text-[1.75rem] leading-[1.2] font-medium text-balance sm:text-[2.25rem]">
                  A Holistic Experience for Body, Mind &amp; Soul
                </h2>
                <Button asChild size="lg" variant="glass" className="mt-8">
                  <Link href="/booking">Book Your Escape</Link>
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-x-8 gap-y-8 sm:grid-cols-4">
                {EXPERIENCE_PILLARS.map(({ icon: Icon, title, body }) => (
                  <div key={title} className="flex flex-col items-center gap-3 text-center sm:items-start sm:text-left">
                    <span className="flex size-11 items-center justify-center rounded-full border border-white/25">
                      <Icon className="size-5" aria-hidden />
                    </span>
                    <h3 className="font-serif text-base font-medium">{title}</h3>
                    <p className="text-cream-200/70 max-w-[9rem] text-xs leading-relaxed">{body}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </FadeIn>
      </section>

      {/* Contact strip */}
      <section className="container-page section">
        <FadeIn className="bg-card shadow-soft-lg border-border/60 flex flex-col gap-8 rounded-[2rem] border p-8 sm:p-10 lg:flex-row lg:items-center lg:justify-between">
          <div className="grid flex-1 gap-8 sm:grid-cols-3">
            <div className="flex items-start gap-3">
              <CalendarCheck className="text-olive-600 dark:text-olive-300 mt-1 size-5 shrink-0" aria-hidden />
              <div>
                <p className="text-muted-foreground text-[0.6875rem] font-semibold tracking-[0.14em] uppercase">
                  Open Every Day
                </p>
                <p className="mt-1 text-sm font-medium">{summarizeHours(hours)}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Mountain className="text-olive-600 dark:text-olive-300 mt-1 size-5 shrink-0" aria-hidden />
              <div>
                <p className="text-muted-foreground text-[0.6875rem] font-semibold tracking-[0.14em] uppercase">
                  Visit Us
                </p>
                <p className="mt-1 text-sm font-medium">
                  {settings.address || "Find peace and tranquility in the heart of Gelephu."}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Phone className="text-olive-600 dark:text-olive-300 mt-1 size-5 shrink-0" aria-hidden />
              <div>
                <p className="text-muted-foreground text-[0.6875rem] font-semibold tracking-[0.14em] uppercase">
                  Call Us
                </p>
                {settings.phone ? (
                  <a href={`tel:${settings.phone.replace(/\s/g, "")}`} className="mt-1 block text-sm font-medium">
                    {settings.phone}
                  </a>
                ) : (
                  <p className="mt-1 text-sm font-medium">We&apos;re happy to help.</p>
                )}
              </div>
            </div>
          </div>
          <Button asChild size="lg" className="w-full lg:w-auto">
            <Link href="/booking">Book Appointment</Link>
          </Button>
        </FadeIn>
      </section>
    </>
  );
}
