import type { Metadata } from "next";
import { MessageSquareQuote } from "lucide-react";
import { PageHero } from "@/components/shared/PageHero";
import { EmptyState } from "@/components/shared/EmptyState";
import { StaggerItem, StaggerList } from "@/components/motion/StaggerList";
import { TestimonialCard } from "@/features/testimonials/components/TestimonialCard";
import { getTestimonials } from "@/services/content.service";

export const metadata: Metadata = {
  title: "Testimonials",
  description:
    "Reviews from guests of Kuenphen Beauty Spa — in their own words.",
};

export default async function TestimonialsPage() {
  const testimonials = await getTestimonials();

  return (
    <>
      <PageHero
        eyebrow="Guest Stories"
        title="What our guests say"
        description="Every review here comes from a guest who booked and visited us."
      />

      <section className="mx-auto max-w-7xl px-4 pb-24 sm:px-6 lg:px-8">
        {testimonials.length === 0 ? (
          <EmptyState
            icon={MessageSquareQuote}
            title="No reviews published yet"
            description="Approved reviews will appear here."
          />
        ) : (
          <StaggerList className="grid gap-7 md:grid-cols-2 lg:grid-cols-3">
            {testimonials.map((testimonial) => (
              <StaggerItem key={testimonial.id}>
                <TestimonialCard testimonial={testimonial} />
              </StaggerItem>
            ))}
          </StaggerList>
        )}
      </section>
    </>
  );
}
