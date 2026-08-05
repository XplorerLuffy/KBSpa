import type { Metadata } from "next";
import { ImageIcon } from "lucide-react";
import { PageHero } from "@/components/shared/PageHero";
import { EmptyState } from "@/components/shared/EmptyState";
import { CategoryFilterBar } from "@/features/services/components/CategoryFilterBar";
import { GalleryCarousel } from "@/features/gallery/components/GalleryCarousel";
import { getGalleryCategories, getGalleryItems } from "@/services/content.service";

export const metadata: Metadata = {
  title: "Gallery",
  description:
    "A look inside Kuenphen Beauty Spa — our treatment rooms, our work, and the details we care about.",
};

export default async function GalleryPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const { category } = await searchParams;
  const [items, categories] = await Promise.all([
    getGalleryItems(category),
    getGalleryCategories(),
  ]);

  return (
    <>
      <PageHero
        eyebrow="Our Space"
        title="Gallery"
        description="A look inside the studio, and a few results we are proud of."
      />

      <section className="mx-auto max-w-7xl px-4 pb-24 sm:px-6 lg:px-8">
        {categories.length > 0 && (
          <CategoryFilterBar
            basePath="/gallery"
            active={category ?? "all"}
            categories={categories.map((name) => ({
              id: name,
              name: name.charAt(0).toUpperCase() + name.slice(1),
              slug: name,
            }))}
          />
        )}

        {items.length === 0 ? (
          <EmptyState
            className="mt-14"
            icon={ImageIcon}
            title="No photos here yet"
            description="Gallery images are managed from the admin panel — add some to see them appear here."
          />
        ) : (
          <GalleryCarousel items={items} />
        )}
      </section>
    </>
  );
}
