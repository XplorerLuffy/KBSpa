import { SectionHeading } from "@/components/shared/SectionHeading";

export function PageHero({
  eyebrow,
  title,
  description,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
}) {
  return (
    <section className="from-cream-300 via-cream-100 to-background dark:from-charcoal-800 dark:via-charcoal-900 dark:to-background relative overflow-hidden bg-gradient-to-b pt-28 pb-14 sm:pt-36 sm:pb-20">
      {/* Soft sage bloom, kept faint so it reads as light rather than colour. */}
      <div
        aria-hidden
        className="bg-olive-200/25 pointer-events-none absolute -top-28 left-1/2 size-[34rem] -translate-x-1/2 rounded-full blur-3xl dark:bg-olive-900/20"
      />
      <div className="container-page relative">
        <SectionHeading
          as="h1"
          eyebrow={eyebrow}
          title={title}
          description={description}
        />
      </div>
    </section>
  );
}
