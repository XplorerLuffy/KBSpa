import type { Metadata } from "next";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { BookingWizard } from "@/features/booking/components/BookingWizard";
import { getServices, getStaffForService } from "@/services/catalog.service";
import { getSettings } from "@/services/content.service";
import { getCurrentProfile } from "@/lib/supabase/server";
import type { Staff } from "@/types/domain";

export const metadata: Metadata = {
  title: "Book an appointment",
  robots: { index: false },
};

export default async function BookingPage({
  searchParams,
}: {
  searchParams: Promise<{ service?: string }>;
}) {
  const [{ service }, services, profile, settings] = await Promise.all([
    searchParams,
    getServices(),
    getCurrentProfile(),
    getSettings(),
  ]);

  const staffLists = await Promise.all(
    services.map((item) => getStaffForService(item.id)),
  );
  const staffByService: Record<string, Staff[]> = Object.fromEntries(
    services.map((item, index) => [item.id, staffLists[index]]),
  );

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
      <SectionHeading
        as="h1"
        eyebrow="Book Appointment"
        title="Reserve your moment of calm"
        description="Choose a treatment and therapist, then pick a time that suits you."
        className="mb-12"
      />

      <BookingWizard
        services={services}
        staffByService={staffByService}
        preselectedSlug={service}
        isAuthenticated={Boolean(profile)}
        contact={{ phone: settings.phone, whatsapp: settings.whatsapp }}
        defaultProfile={
          profile
            ? {
                name: profile.full_name ?? "",
                email: profile.email ?? "",
                phone: profile.phone ?? "",
              }
            : null
        }
      />
    </div>
  );
}
