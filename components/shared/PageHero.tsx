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
    <section className="from-cream-200 via-cream-100 to-background dark:from-charcoal-800 dark:via-charcoal-900 dark:to-background bg-gradient-to-b pt-36 pb-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
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
