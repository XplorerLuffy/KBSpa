import type { Metadata } from "next";
import Image from "next/image";
import { ImageIcon } from "lucide-react";
import { PageHero } from "@/components/shared/PageHero";
import { EmptyState } from "@/components/shared/EmptyState";
import { CategoryFilterBar } from "@/features/services/components/CategoryFilterBar";
import { FadeIn } from "@/components/motion/FadeIn";
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
          <div className="mt-12 columns-1 gap-5 sm:columns-2 lg:columns-3 [&>*]:mb-5">
            {items.map((item, index) => (
              <FadeIn
                key={item.id}
                delay={(index % 6) * 0.05}
                className="break-inside-avoid"
              >
                <figure className="group bg-cream-200 relative overflow-hidden rounded-2xl">
                  <Image
                    src={item.image_url}
                    alt={item.caption ?? ""}
                    width={800}
                    height={1000}
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="h-auto w-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  {item.caption && (
                    <figcaption className="from-charcoal-900/80 absolute inset-x-0 bottom-0 bg-gradient-to-t to-transparent p-5 text-sm text-white opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                      {item.caption}
                    </figcaption>
                  )}
                </figure>
              </FadeIn>
            ))}
          </div>
        )}
      </section>
    </>
  );
}
