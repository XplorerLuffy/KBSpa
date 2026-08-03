import type { Metadata } from "next";
import { PageHero } from "@/components/shared/PageHero";
import { Card } from "@/components/ui/card";
import { FeedbackForm } from "@/features/feedback/components/FeedbackForm";
import { getServices } from "@/services/catalog.service";

// Not in NAV_LINKS and not in sitemap.ts — reached only via the QR code
// placed in the salon, never linked from anywhere on the site itself.
export const metadata: Metadata = {
  title: "Share Your Feedback",
  description: "Tell Kuenphen Beauty Spa how your visit went.",
  robots: { index: false, follow: false },
};

export default async function FeedbackPage() {
  const services = await getServices();

  return (
    <>
      <PageHero
        eyebrow="We'd Love to Hear From You"
        title="Share your feedback"
        description="Your review helps us improve and may be featured on our testimonials page."
      />

      <section className="mx-auto max-w-2xl px-4 pb-24 sm:px-6 lg:px-8">
        <Card className="p-7 sm:p-9">
          <FeedbackForm
            services={services.map((service) => ({ id: service.id, name: service.name }))}
          />
        </Card>
      </section>
    </>
  );
}
