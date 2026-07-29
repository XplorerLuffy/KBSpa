import { WEEKDAYS } from "@/lib/constants";
import { absoluteUrl } from "@/lib/utils";
import type { BusinessHour, ServiceWithCategory, SiteSettings } from "@/types/domain";

export function buildLocalBusinessJsonLd(
  settings: SiteSettings,
  hours: BusinessHour[],
) {
  return {
    "@context": "https://schema.org",
    "@type": "BeautySalon",
    name: settings.business_name ?? "Kuenphen Beauty Spa",
    description: settings.tagline,
    url: absoluteUrl(),
    // Raster, not SVG: Google's structured-data guidance for organisation
    // logos and images expects a bitmap format.
    logo: absoluteUrl(settings.logo_url || "/logo-512.png"),
    image: absoluteUrl("/og-image.png"),
    telephone: settings.phone,
    email: settings.email,
    address: settings.address
      ? { "@type": "PostalAddress", streetAddress: settings.address }
      : undefined,
    sameAs: [settings.facebook_url, settings.instagram_url].filter(Boolean),
    openingHoursSpecification: hours
      .filter((hour) => !hour.is_closed)
      .map((hour) => ({
        "@type": "OpeningHoursSpecification",
        dayOfWeek: `https://schema.org/${WEEKDAYS[hour.weekday]}`,
        opens: hour.open_time,
        closes: hour.close_time,
      })),
  };
}

export function buildServiceJsonLd(
  service: ServiceWithCategory,
  settings: SiteSettings,
) {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name: service.name,
    description: service.short_description ?? service.description ?? undefined,
    serviceType: service.category?.name,
    url: absoluteUrl(`/services/${service.slug}`),
    provider: {
      "@type": "BeautySalon",
      name: settings.business_name ?? "Kuenphen Beauty Spa",
      telephone: settings.phone,
    },
    offers: {
      "@type": "Offer",
      price: service.price,
      priceCurrency: "BTN",
      availability: "https://schema.org/InStock",
    },
  };
}
