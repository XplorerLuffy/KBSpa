import Link from "next/link";
import { CalendarCheck, HeartHandshake, Leaf, ShieldCheck } from "lucide-react";
import { Hero } from "@/features/marketing/components/Hero";
import { ServiceCard } from "@/features/services/components/ServiceCard";
import { TestimonialCarousel } from "@/features/testimonials/components/TestimonialCarousel";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { GlassPanel } from "@/components/shared/GlassPanel";
import { FadeIn } from "@/components/motion/FadeIn";
import { StaggerItem, StaggerList } from "@/components/motion/StaggerList";
import { Button } from "@/components/ui/button";
import { getCategories, getServices } from "@/services/catalog.service";
import { getSettings, getTestimonials } from "@/services/content.service";

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

export default async function HomePage() {
  const [settings, featured, categories, testimonials] = await Promise.all([
    getSettings(),
    getServices({ featuredOnly: true, limit: 6 }),
    getCategories(),
    getTestimonials({ featuredOnly: true, limit: 6 }),
  ]);

  return (
    <>
      <Hero
        headline="Relax. Refresh. Rejuvenate."
        subtitle={
          settings.hero_subtitle ??
          "Premium beauty and wellness treatments tailored just for you."
        }
        imageUrl={settings.hero_image_url || "/hero.svg"}
        videoUrl={settings.hero_video_url || "/hero-video.mp4"}
      />

      <section
        id="featured"
        className="mx-auto max-w-7xl scroll-mt-24 px-4 py-24 sm:px-6 lg:px-8"
      >
        <SectionHeading
          eyebrow="Our Signature Treatments"
          title="Chosen most often, loved every time"
          description="A short list of the treatments our guests come back for."
        />

        <StaggerList className="mt-14 grid gap-7 sm:grid-cols-2 lg:grid-cols-3">
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

      <section className="bg-cream-100 dark:bg-charcoal-800/40 py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="Why Kuenphen"
            title="Care that feels considered, not rushed"
            description="We keep the day gently booked so every guest gets a full, unhurried appointment."
          />

          <StaggerList className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {PILLARS.map(({ icon: Icon, title, body }) => (
              <StaggerItem key={title}>
                <GlassPanel className="flex h-full flex-col gap-4 p-7">
                  <span className="bg-gold-100 text-gold-700 flex size-12 items-center justify-center rounded-2xl">
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

      <section className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Browse by Category"
          title="Find exactly what you came for"
        />

        <StaggerList className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {categories.map((category) => (
            <StaggerItem key={category.id}>
              <Link
                href={`/services?category=${category.slug}`}
                className="border-border/70 bg-card hover:border-gold-400 hover:shadow-soft group flex h-full flex-col gap-2 rounded-2xl border p-6 transition-all"
              >
                <h3 className="group-hover:text-gold-700 dark:group-hover:text-gold-300 font-serif text-lg font-medium transition-colors">
                  {category.name}
                </h3>
                {category.description && (
                  <p className="text-muted-foreground line-clamp-2 text-sm">
                    {category.description}
                  </p>
                )}
              </Link>
            </StaggerItem>
          ))}
        </StaggerList>
      </section>

      {testimonials.length > 0 && (
        <section className="bg-olive-800 py-24 text-white">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <SectionHeading
              inverted
              eyebrow="Guest Stories"
              title="What our guests say"
            />
            <div className="mt-14">
              <TestimonialCarousel testimonials={testimonials} inverted />
            </div>
          </div>
        </section>
      )}

      <section className="mx-auto max-w-5xl px-4 py-24 sm:px-6 lg:px-8">
        <FadeIn>
          <GlassPanel className="from-gold-100 via-cream-100 to-beige-100 dark:from-charcoal-800 dark:via-charcoal-800 dark:to-charcoal-900 flex flex-col items-center gap-6 bg-gradient-to-br px-8 py-16 text-center">
            <SectionHeading
              eyebrow="Ready when you are"
              title="Book your moment of calm"
              description="Pick a treatment, choose your therapist, and see live availability. Confirmation lands in your inbox straight away."
            />
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg">
                <Link href="/booking">Book Appointment</Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="/contact">Contact Us</Link>
              </Button>
            </div>
          </GlassPanel>
        </FadeIn>
      </section>
    </>
  );
}
