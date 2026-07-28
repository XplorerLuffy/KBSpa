import type { Metadata } from "next";
import { SearchX } from "lucide-react";
import { PageHero } from "@/components/shared/PageHero";
import { EmptyState } from "@/components/shared/EmptyState";
import { ServiceCard } from "@/features/services/components/ServiceCard";
import { SearchInput } from "@/features/search/components/SearchInput";
import { getServices } from "@/services/catalog.service";

export const metadata: Metadata = {
  title: "Search",
  description: "Search every treatment offered at Kuenphen Beauty Spa.",
  robots: { index: false },
};

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const query = q?.trim() ?? "";
  const results = query ? await getServices({ search: query }) : [];

  return (
    <>
      <PageHero
        eyebrow="Find a Treatment"
        title="Search services"
        description="Search by treatment name or what you are looking for."
      />

      <section className="mx-auto max-w-5xl px-4 pb-24 sm:px-6 lg:px-8">
        <SearchInput initialQuery={query} />

        {query && (
          <p className="text-muted-foreground mt-6 text-sm">
            {results.length === 0
              ? `No treatments match “${query}”.`
              : `${results.length} ${results.length === 1 ? "treatment" : "treatments"} matching “${query}”.`}
          </p>
        )}

        {query && results.length === 0 ? (
          <EmptyState
            className="mt-10"
            icon={SearchX}
            title="Nothing found"
            description="Try a broader term — for example “massage”, “facial” or “waxing”."
          />
        ) : (
          <div className="mt-10 grid gap-7 sm:grid-cols-2 lg:grid-cols-3">
            {results.map((service) => (
              <ServiceCard key={service.id} service={service} />
            ))}
          </div>
        )}
      </section>
    </>
  );
}
