import type { Metadata } from "next";
import { Sparkles } from "lucide-react";
import { PageHero } from "@/components/shared/PageHero";
import { EmptyState } from "@/components/shared/EmptyState";
import { StaggerItem, StaggerList } from "@/components/motion/StaggerList";
import { ServiceCard } from "@/features/services/components/ServiceCard";
import { CategoryFilterBar } from "@/features/services/components/CategoryFilterBar";
import { getCategories, getServices } from "@/services/catalog.service";

export const metadata: Metadata = {
  title: "Services",
  description:
    "Facials, massage, hair, body spa, nails, bridal and more — browse every treatment at Kuenphen Beauty Spa.",
};

export default async function ServicesPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const { category } = await searchParams;
  const [categories, services] = await Promise.all([
    getCategories(),
    getServices({ categorySlug: category }),
  ]);

  return (
    <>
      <PageHero
        eyebrow="Treatments"
        title="Our Services"
        description="Every treatment is performed by a senior therapist, in an unhurried appointment, with products chosen for your skin and hair."
      />

      <section className="mx-auto max-w-7xl px-4 pb-24 sm:px-6 lg:px-8">
        <CategoryFilterBar categories={categories} active={category ?? "all"} />

        {services.length === 0 ? (
          <EmptyState
            className="mt-14"
            icon={Sparkles}
            title="No treatments in this category yet"
            description="Try another category, or view everything we offer."
          />
        ) : (
          <StaggerList className="mt-12 grid gap-7 sm:grid-cols-2 lg:grid-cols-3">
            {services.map((service) => (
              <StaggerItem key={service.id}>
                <ServiceCard service={service} />
              </StaggerItem>
            ))}
          </StaggerList>
        )}
      </section>
    </>
  );
}
